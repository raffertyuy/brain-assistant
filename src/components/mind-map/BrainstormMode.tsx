import React, { useState, useEffect } from 'react';
import { Task } from '../../models/Task';
import { MindMap, MindMapNode } from '../../models/MindMap';
import { MindMapCanvas } from './MindMapCanvas';
import { NodeEditor } from './NodeEditor';
import { AISuggestionsPanel } from './AISuggestionsPanel';
import { MindMapService } from '../../services/mind-map/MindMapService';
import { AIService, BrainstormSuggestion } from '../../services/ai/AIService';
import styles from './BrainstormMode.module.css';

interface BrainstormModeProps {
  task: Task;
  mindMapService: MindMapService;
  aiService?: AIService;
  onClose: () => void;
}

export const BrainstormMode: React.FC<BrainstormModeProps> = ({
  task,
  mindMapService,
  aiService,
  onClose
}) => {
  const [mindMap, setMindMap] = useState<MindMap | null>(null);
  const [selectedNode, setSelectedNode] = useState<MindMapNode | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editorMode, setEditorMode] = useState<'create' | 'edit'>('create');
  const [parentForNewNode, setParentForNewNode] = useState<MindMapNode | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  // AI suggestions state
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<BrainstormSuggestion[]>([]);
  const [aiQuestions, setAiQuestions] = useState<string[]>([]);
  const [aiSimplifications, setAiSimplifications] = useState<string[]>([]);
  const [isAILoading, setIsAILoading] = useState(false);

  useEffect(() => {
    loadMindMap();
  }, [task.id]);

  const loadMindMap = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      let existingMindMap = await mindMapService.getMindMap(task.id);
      
      if (!existingMindMap) {
        existingMindMap = await mindMapService.createMindMap(task.id);
        existingMindMap.title = task.title;
      }
      
      setMindMap(existingMindMap);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load mind map');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddRootNode = () => {
    setParentForNewNode(null);
    setEditorMode('create');
    setIsEditorOpen(true);
  };

  const handleAddChild = (parentNode: MindMapNode) => {
    setParentForNewNode(parentNode);
    setEditorMode('create');
    setIsEditorOpen(true);
  };

  const handleNodeClick = (node: MindMapNode) => {
    setSelectedNode(node);
  };

  const handleNodeDoubleClick = (node: MindMapNode) => {
    setSelectedNode(node);
    setEditorMode('edit');
    setIsEditorOpen(true);
  };

  const handleDeleteNode = async (node: MindMapNode) => {
    if (!mindMap) return;

    const confirmDelete = window.confirm(
      `Delete "${node.text}" and all its children?`
    );
    
    if (!confirmDelete) return;

    try {
      setIsSaving(true);
      const updated = await mindMapService.deleteNode(task.id, node.id);
      setMindMap(updated);
      setSelectedNode(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete node');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveNode = async (nodeData: { text: string; linkedTaskId?: string }) => {
    if (!mindMap) return;

    try {
      setIsSaving(true);
      let updated: MindMap;

      if (editorMode === 'create') {
        const parentId = parentForNewNode?.id;
        const level = parentId 
          ? (mindMap.nodes.find(n => n.id === parentId)?.level ?? 0) + 1 
          : 0;

        updated = await mindMapService.addNode(task.id, {
          text: nodeData.text,
          parentId,
          level,
          linkedTaskId: nodeData.linkedTaskId
        });
      } else {
        if (!selectedNode) return;
        
        updated = await mindMapService.updateNode(task.id, selectedNode.id, {
          text: nodeData.text,
          linkedTaskId: nodeData.linkedTaskId
        });
      }

      setMindMap(updated);
      setIsEditorOpen(false);
      setParentForNewNode(null);
      setSelectedNode(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save node');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveMindMap = async () => {
    if (!mindMap) return;

    try {
      setIsSaving(true);
      await mindMapService.getMindMap(task.id);
      alert('Mind map saved successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save mind map');
    } finally {
      setIsSaving(false);
    }
  };

  const handleGetAISuggestions = async () => {
    if (!aiService || !aiService.isReady()) {
      alert('Please configure your OpenAI API key first');
      return;
    }

    setShowAIPanel(true);
    setIsAILoading(true);

    try {
      // Generate all AI assistance in parallel
      const [suggestions, questions, simplifications] = await Promise.all([
        aiService.generateBrainstormSuggestions(task),
        aiService.generateProbingQuestions(task, mindMap ? getMindMapContext() : ''),
        mindMap && mindMap.nodes.length > 0
          ? aiService.suggestSimplifications(getMindMapContext())
          : Promise.resolve([])
      ]);

      setAiSuggestions(suggestions);
      setAiQuestions(questions);
      setAiSimplifications(simplifications);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get AI suggestions');
    } finally {
      setIsAILoading(false);
    }
  };

  const getMindMapContext = (): string => {
    if (!mindMap) return '';
    
    // Convert mind map to text representation for AI
    const buildContext = (nodes: MindMapNode[], parentId: string | undefined = undefined, level = 0): string => {
      const childNodes = nodes.filter(n => n.parentId === parentId);
      return childNodes
        .map(node => {
          const indent = '  '.repeat(level);
          const children = buildContext(nodes, node.id, level + 1);
          return `${indent}- ${node.text}${children ? '\n' + children : ''}`;
        })
        .join('\n');
    };

    return buildContext(mindMap.nodes);
  };

  const handleRefineApproach = async (suggestion: BrainstormSuggestion, userInput: string) => {
    if (!aiService || !aiService.isReady()) return;

    setIsAILoading(true);
    try {
      // Request refined suggestions based on user modification of the original suggestion
      const refinedSuggestions = await aiService.generateBrainstormSuggestions({
        ...task,
        description: `${task.description}\n\nOriginal suggestion: ${suggestion.text}\nUser refinement: ${userInput}`
      });
      
      setAiSuggestions(refinedSuggestions);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refine suggestions');
    } finally {
      setIsAILoading(false);
    }
  };

  const handleApplySuggestion = async (suggestion: BrainstormSuggestion) => {
    if (!mindMap) return;

    // Add suggestion as a new node
    try {
      setIsSaving(true);
      const updated = await mindMapService.addNode(task.id, {
        text: suggestion.text,
        parentId: undefined, // Add as root node
        level: 0
      });
      
      setMindMap(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to apply suggestion');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading mind map...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <p>Error: {error}</p>
          <button onClick={loadMindMap} className={styles.retryButton}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h2>{task.title}</h2>
          <p className={styles.subtitle}>Brainstorm Mode</p>
        </div>
        <div className={styles.headerRight}>
          <button
            onClick={handleAddRootNode}
            className={styles.addButton}
            disabled={isSaving}
          >
            + Add Root Node
          </button>
          {aiService && aiService.isReady() && (
            <button
              onClick={handleGetAISuggestions}
              className={styles.aiButton}
              disabled={isSaving || isAILoading}
            >
              {isAILoading ? 'AI Thinking...' : '✨ AI Suggestions'}
            </button>
          )}
          <button
            onClick={handleSaveMindMap}
            className={styles.saveButton}
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save'}
          </button>
          <button onClick={onClose} className={styles.closeButton}>
            Close
          </button>
        </div>
      </div>

      <div className={styles.mainContent}>
        <div className={styles.canvasWrapper}>
          <MindMapCanvas
            mindMap={mindMap!}
            selectedNodeId={selectedNode?.id}
            onNodeClick={handleNodeClick}
            onNodeDoubleClick={handleNodeDoubleClick}
            onAddChild={handleAddChild}
            onDeleteNode={handleDeleteNode}
          />
        </div>

        {showAIPanel && (
          <AISuggestionsPanel
            suggestions={aiSuggestions}
            questions={aiQuestions}
            simplifications={aiSimplifications}
            isLoading={isAILoading}
            onRefineApproach={handleRefineApproach}
            onApplySuggestion={handleApplySuggestion}
          />
        )}
      </div>

      <NodeEditor
        node={editorMode === 'edit' ? selectedNode ?? undefined : undefined}
        isOpen={isEditorOpen}
        onSave={handleSaveNode}
        onCancel={() => {
          setIsEditorOpen(false);
          setParentForNewNode(null);
        }}
        mode={editorMode}
      />

      {mindMap && mindMap.nodes.length > 0 && (
        <div className={styles.instructions}>
          <p><strong>Instructions:</strong></p>
          <ul>
            <li>Click a node to select it</li>
            <li>Double-click a node to edit it</li>
            <li>Click + button on selected node to add a child</li>
            <li>Click × button on selected node to delete it</li>
          </ul>
        </div>
      )}
    </div>
  );
};
