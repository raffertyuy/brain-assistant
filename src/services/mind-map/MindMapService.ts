import { MindMap, MindMapNode } from '../../models/MindMap';
import { StorageService } from '../storage/StorageService';
import { v4 as uuidv4 } from 'uuid';

export class MindMapService {
  private storageService: StorageService;
  private currentProfile: string | null = null;

  constructor(storageService: StorageService) {
    this.storageService = storageService;
  }

  /**
   * Set the current active profile
   * @param profileName - Name of the active profile
   */
  setProfile(profileName: string): void {
    this.currentProfile = profileName;
  }

  /**
   * Create mind map for task
   * @param taskId - Task to create mind map for
   * @returns Promise resolving to created mind map
   */
  async createMindMap(taskId: string): Promise<MindMap> {
    if (!this.currentProfile) {
      throw new Error('No active profile set');
    }

    const mindMap: MindMap = {
      id: uuidv4(),
      taskId,
      title: `Mind Map for Task ${taskId}`,
      nodes: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await this.saveMindMap(mindMap);
    return mindMap;
  }

  /**
   * Get mind map for task
   * @param taskId - Task ID
   * @returns Promise resolving to mind map or null if none exists
   */
  async getMindMap(taskId: string): Promise<MindMap | null> {
    if (!this.currentProfile) {
      throw new Error('No active profile set');
    }

    try {
      const content = await this.storageService.readMindMapFile(taskId);
      return this.fromMarkdown(content, taskId);
    } catch (error) {
      return null;
    }
  }

  /**
   * Add node to mind map
   * @param mindMapId - Mind map ID (or taskId)
   * @param nodeData - Node data
   * @returns Promise resolving to updated mind map
   */
  async addNode(mindMapId: string, nodeData: Omit<MindMapNode, 'id'>): Promise<MindMap> {
    // For our implementation, mindMapId is actually the taskId
    const mindMap = await this.getMindMap(mindMapId);
    if (!mindMap) {
      throw new Error(`Mind map for task ${mindMapId} not found`);
    }

    const newNode: MindMapNode = {
      id: uuidv4(),
      ...nodeData
    };

    mindMap.nodes.push(newNode);
    mindMap.updatedAt = new Date();

    await this.saveMindMap(mindMap);
    return mindMap;
  }

  /**
   * Update node in mind map
   * @param mindMapId - Mind map ID (or taskId)
   * @param nodeId - Node ID to update
   * @param updates - Partial node data
   * @returns Promise resolving to updated mind map
   */
  async updateNode(mindMapId: string, nodeId: string, updates: Partial<MindMapNode>): Promise<MindMap> {
    const mindMap = await this.getMindMap(mindMapId);
    if (!mindMap) {
      throw new Error(`Mind map for task ${mindMapId} not found`);
    }

    const nodeIndex = mindMap.nodes.findIndex(n => n.id === nodeId);
    if (nodeIndex === -1) {
      throw new Error(`Node ${nodeId} not found`);
    }

    mindMap.nodes[nodeIndex] = {
      ...mindMap.nodes[nodeIndex],
      ...updates
    };
    mindMap.updatedAt = new Date();

    await this.saveMindMap(mindMap);
    return mindMap;
  }

  /**
   * Delete node from mind map
   * @param mindMapId - Mind map ID (or taskId)
   * @param nodeId - Node ID to delete
   * @returns Promise resolving to updated mind map
   */
  async deleteNode(mindMapId: string, nodeId: string): Promise<MindMap> {
    const mindMap = await this.getMindMap(mindMapId);
    if (!mindMap) {
      throw new Error(`Mind map for task ${mindMapId} not found`);
    }

    const nodeToDelete = mindMap.nodes.find(n => n.id === nodeId);
    if (!nodeToDelete) {
      throw new Error(`Node ${nodeId} not found`);
    }

    const childrenToDelete = this.getAllDescendants(mindMap.nodes, nodeId);
    const nodesToRemove = new Set([nodeId, ...childrenToDelete]);

    mindMap.nodes = mindMap.nodes.filter(n => !nodesToRemove.has(n.id));
    mindMap.updatedAt = new Date();

    await this.saveMindMap(mindMap);
    return mindMap;
  }

  /**
   * Convert mind map to markdown format
   * @param mindMap - Mind map to convert
   * @returns Markdown string representation
   */
  toMarkdown(mindMap: MindMap): string {
    let markdown = `# ${mindMap.title}\n\n`;

    const rootNodes = mindMap.nodes.filter(n => !n.parentId);
    
    for (const root of rootNodes) {
      markdown += this.nodeToMarkdown(mindMap.nodes, root, 0);
    }

    return markdown;
  }

  /**
   * Parse markdown to mind map structure
   * @param markdown - Markdown content
   * @param taskId - Associated task ID
   * @returns Mind map structure
   */
  fromMarkdown(markdown: string, taskId: string): MindMap {
    const lines = markdown.split('\n');
    const nodes: MindMapNode[] = [];
    const stack: Array<{ node: MindMapNode; indent: number }> = [];
    
    let title = 'Mind Map';
    let currentIndent = -1;

    for (const line of lines) {
      const trimmed = line.trimEnd();
      if (!trimmed) continue;

      if (trimmed.startsWith('# ')) {
        title = trimmed.substring(2).trim();
        continue;
      }

      const match = trimmed.match(/^(#+|\s*-)\s*(.+)$/);
      if (!match) continue;

      const prefix = match[1];
      const text = match[2];
      
      let indent = 0;
      let level = 0;

      if (prefix.startsWith('#')) {
        level = prefix.length - 1;
        indent = level;
      } else {
        const leadingSpaces = trimmed.match(/^\s*/)?.[0].length || 0;
        indent = Math.floor(leadingSpaces / 2);
        level = indent + 1;
      }

      let parentId: string | undefined;
      while (stack.length > 0 && stack[stack.length - 1].indent >= indent) {
        stack.pop();
      }
      
      if (stack.length > 0) {
        parentId = stack[stack.length - 1].node.id;
      }

      const linkedTaskMatch = text.match(/\[\[([^\]]+)\]\]/);
      const linkedTaskId = linkedTaskMatch ? linkedTaskMatch[1] : undefined;
      const cleanText = text.replace(/\[\[([^\]]+)\]\]/g, '').trim();

      const node: MindMapNode = {
        id: uuidv4(),
        text: cleanText,
        parentId,
        level,
        linkedTaskId
      };

      nodes.push(node);
      stack.push({ node, indent });
    }

    return {
      id: uuidv4(),
      taskId,
      title,
      nodes,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  private async saveMindMap(mindMap: MindMap): Promise<void> {
    if (!this.currentProfile) {
      throw new Error('No active profile set');
    }

    const markdown = this.toMarkdown(mindMap);
    await this.storageService.writeMindMapFile(mindMap.taskId, markdown);
  }

  private nodeToMarkdown(allNodes: MindMapNode[], node: MindMapNode, depth: number): string {
    const indent = '  '.repeat(depth);
    const prefix = depth === 0 ? '## ' : '- ';
    
    let line = `${indent}${prefix}${node.text}`;
    if (node.linkedTaskId) {
      line += ` [[${node.linkedTaskId}]]`;
    }
    line += '\n';

    const children = allNodes.filter(n => n.parentId === node.id);
    for (const child of children) {
      line += this.nodeToMarkdown(allNodes, child, depth + 1);
    }

    return line;
  }

  private getAllDescendants(nodes: MindMapNode[], parentId: string): string[] {
    const descendants: string[] = [];
    const children = nodes.filter(n => n.parentId === parentId);
    
    for (const child of children) {
      descendants.push(child.id);
      descendants.push(...this.getAllDescendants(nodes, child.id));
    }

    return descendants;
  }
}
