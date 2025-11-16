import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MindMapService } from '../../../src/services/mind-map/MindMapService';
import { IStorageService } from '../../../src/services/storage/IStorageService';
import { MindMap } from '../../../src/models/MindMap';

describe('MindMapService', () => {
  let mindMapService: MindMapService;
  let mockStorageService: IStorageService;
  let savedMindMaps: Map<string, string>;

  beforeEach(() => {
    savedMindMaps = new Map();

    mockStorageService = {
      initialize: vi.fn(),
      isInitialized: vi.fn(() => true),
      setCurrentProfile: vi.fn(),
      getCurrentProfile: vi.fn(() => 'test-profile'),
      readTasksFile: vi.fn(),
      writeTasksFile: vi.fn(),
      readArchiveFile: vi.fn(),
      writeArchiveFile: vi.fn(),
      readMindMapFile: vi.fn(async (taskId: string) => {
        const content = savedMindMaps.get(taskId);
        if (!content) {
          throw new Error(`File not found: ${taskId}`);
        }
        return content;
      }),
      writeMindMapFile: vi.fn(async (taskId: string, content: string) => {
        savedMindMaps.set(taskId, content);
      }),
      readProfilesConfig: vi.fn(),
      writeProfilesConfig: vi.fn(),
      createProfileFolder: vi.fn()
    } as any;

    mindMapService = new MindMapService(mockStorageService);
    mindMapService.setProfile('test-profile');
  });

  describe('createMindMap', () => {
    it('should create a new mind map for a task', async () => {
      const mindMap = await mindMapService.createMindMap('task-123');

      expect(mindMap).toBeDefined();
      expect(mindMap.taskId).toBe('task-123');
      expect(mindMap.nodes).toEqual([]);
      expect(mindMap.id).toBeDefined();
      expect(mockStorageService.writeMindMapFile).toHaveBeenCalledWith(
        'task-123',
        expect.any(String)
      );
    });

    it('should throw error if no profile is set', async () => {
      const service = new MindMapService(mockStorageService);

      await expect(service.createMindMap('task-123')).rejects.toThrow('No active profile set');
    });
  });

  describe('getMindMap', () => {
    it('should return null if mind map does not exist', async () => {
      const result = await mindMapService.getMindMap('task-123');

      expect(result).toBeNull();
    });

    it('should parse and return existing mind map', async () => {
      const markdown = `# Test Mind Map

- Root node
  - Child node
    - Grandchild node`;

      savedMindMaps.set('task-123', markdown);

      const result = await mindMapService.getMindMap('task-123');

      expect(result).not.toBeNull();
      expect(result?.nodes).toHaveLength(3);
      expect(result?.nodes[0].text).toBe('Root node');
      expect(result?.nodes[1].text).toBe('Child node');
      expect(result?.nodes[1].parentId).toBe(result?.nodes[0].id);
    });
  });

  describe('addNode', () => {
    it('should add a node to existing mind map', async () => {
      const markdown = `# Test Mind Map

- Root node`;

      savedMindMaps.set('task-123', markdown);

      const initialMindMap = await mindMapService.getMindMap('task-123');
      expect(initialMindMap).not.toBeNull();

      const rootNodeId = initialMindMap!.nodes[0].id;
      
      const updatedMarkdown = await mindMapService.addNode('task-123', {
        text: 'New child node',
        parentId: rootNodeId,
        level: 1
      });

      expect(updatedMarkdown.nodes).toHaveLength(2);
      expect(updatedMarkdown.nodes[1].text).toBe('New child node');
      expect(mockStorageService.writeMindMapFile).toHaveBeenCalled();
    });

    it('should throw error if mind map not found', async () => {
      await expect(mindMapService.addNode('non-existent-id', {
        text: 'Node',
        level: 0
      })).rejects.toThrow('Mind map for task non-existent-id not found');
    });
  });

  describe('updateNode', () => {
    it('should update a node in mind map', async () => {
      const markdown = `# Test Mind Map

- Root node
  - Child node`;

      savedMindMaps.set('task-123', markdown);

      const mindMap = await mindMapService.getMindMap('task-123');
      expect(mindMap).not.toBeNull();

      const nodeToUpdate = mindMap!.nodes[1];
      
      const updated = await mindMapService.updateNode('task-123', nodeToUpdate.id, {
        text: 'Updated child node'
      });

      expect(updated.nodes[1].text).toBe('Updated child node');
      expect(mockStorageService.writeMindMapFile).toHaveBeenCalled();
    });

    it('should throw error if node not found', async () => {
      const markdown = `# Test Mind Map

- Root node`;

      savedMindMaps.set('task-123', markdown);

      await mindMapService.getMindMap('task-123');
      
      await expect(mindMapService.updateNode('task-123', 'non-existent-node', {
        text: 'Updated'
      })).rejects.toThrow('Node non-existent-node not found');
    });
  });

  describe('deleteNode', () => {
    it('should delete a node and its children', async () => {
      const markdown = `# Test Mind Map

- Root node
  - Child node
    - Grandchild node`;

      savedMindMaps.set('task-123', markdown);

      const mindMap = await mindMapService.getMindMap('task-123');
      expect(mindMap).not.toBeNull();

      const childNode = mindMap!.nodes[1];
      
      const updated = await mindMapService.deleteNode('task-123', childNode.id);

      expect(updated.nodes).toHaveLength(1);
      expect(updated.nodes[0].text).toBe('Root node');
      expect(mockStorageService.writeMindMapFile).toHaveBeenCalled();
    });

    it('should throw error if node not found', async () => {
      const markdown = `# Test Mind Map

- Root node`;

      savedMindMaps.set('task-123', markdown);

      await mindMapService.getMindMap('task-123');
      
      await expect(mindMapService.deleteNode('task-123', 'non-existent-node'))
        .rejects.toThrow('Node non-existent-node not found');
    });
  });

  describe('toMarkdown', () => {
    it('should convert mind map to markdown format', () => {
      const mindMap: MindMap = {
        id: 'mm-1',
        taskId: 'task-1',
        title: 'Test Mind Map',
        nodes: [
          { id: 'node-1', text: 'Root', level: 0, parentId: undefined },
          { id: 'node-2', text: 'Child 1', level: 1, parentId: 'node-1' },
          { id: 'node-3', text: 'Child 2', level: 1, parentId: 'node-1' }
        ],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const markdown = mindMapService.toMarkdown(mindMap);

      expect(markdown).toContain('# Test Mind Map');
      expect(markdown).toContain('## Root');
      expect(markdown).toContain('  - Child 1');
      expect(markdown).toContain('  - Child 2');
    });

    it('should include task links in markdown', () => {
      const mindMap: MindMap = {
        id: 'mm-1',
        taskId: 'task-1',
        title: 'Test Mind Map',
        nodes: [
          { id: 'node-1', text: 'Root', level: 0, parentId: undefined },
          { id: 'node-2', text: 'Linked', level: 1, parentId: 'node-1', linkedTaskId: 'task-999' }
        ],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const markdown = mindMapService.toMarkdown(mindMap);

      expect(markdown).toContain('[[task-999]]');
    });
  });

  describe('fromMarkdown', () => {
    it('should parse markdown into mind map structure', () => {
      const markdown = `# Test Mind Map

- Root node
  - Child node
    - Grandchild node`;

      const mindMap = mindMapService.fromMarkdown(markdown, 'task-123');

      expect(mindMap.title).toBe('Test Mind Map');
      expect(mindMap.taskId).toBe('task-123');
      expect(mindMap.nodes).toHaveLength(3);
      
      const root = mindMap.nodes[0];
      expect(root.text).toBe('Root node');
      expect(root.parentId).toBeUndefined();
      
      const child = mindMap.nodes[1];
      expect(child.text).toBe('Child node');
      expect(child.parentId).toBe(root.id);
      
      const grandchild = mindMap.nodes[2];
      expect(grandchild.text).toBe('Grandchild node');
      expect(grandchild.parentId).toBe(child.id);
    });

    it('should parse task links from markdown', () => {
      const markdown = `# Test

- Node with link [[task-456]]`;

      const mindMap = mindMapService.fromMarkdown(markdown, 'task-123');

      expect(mindMap.nodes[0].text).toBe('Node with link');
      expect(mindMap.nodes[0].linkedTaskId).toBe('task-456');
    });

    it('should handle empty markdown', () => {
      const markdown = '';

      const mindMap = mindMapService.fromMarkdown(markdown, 'task-123');

      expect(mindMap.nodes).toHaveLength(0);
    });
  });

  describe('round-trip conversion', () => {
    it('should preserve structure through markdown conversion', () => {
      const original: MindMap = {
        id: 'mm-1',
        taskId: 'task-1',
        title: 'Round Trip Test',
        nodes: [
          { id: 'n1', text: 'Root', level: 0, parentId: undefined },
          { id: 'n2', text: 'Child 1', level: 1, parentId: 'n1' },
          { id: 'n3', text: 'Child 2', level: 1, parentId: 'n1', linkedTaskId: 'task-999' },
          { id: 'n4', text: 'Grandchild', level: 2, parentId: 'n2' }
        ],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const markdown = mindMapService.toMarkdown(original);
      const parsed = mindMapService.fromMarkdown(markdown, original.taskId);

      expect(parsed.title).toBe(original.title);
      expect(parsed.nodes).toHaveLength(original.nodes.length);
      
      const rootNode = parsed.nodes.find(n => !n.parentId);
      expect(rootNode?.text).toBe('Root');
      
      const linkedNode = parsed.nodes.find(n => n.linkedTaskId);
      expect(linkedNode?.text).toBe('Child 2');
      expect(linkedNode?.linkedTaskId).toBe('task-999');
    });
  });
});
