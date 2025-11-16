import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MindMapService } from '../../../src/services/mind-map/MindMapService';
import { IStorageService } from '../../../src/services/storage/IStorageService';

describe('Mind Map Workflow Integration', () => {
  let mindMapService: MindMapService;
  let mockStorageService: IStorageService;
  let savedFiles: Map<string, string>;

  beforeEach(() => {
    savedFiles = new Map();

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
        const content = savedFiles.get(taskId);
        if (!content) {
          throw new Error(`File not found: ${taskId}`);
        }
        return content;
      }),
      writeMindMapFile: vi.fn(async (taskId: string, content: string) => {
        savedFiles.set(taskId, content);
      }),
      readProfilesConfig: vi.fn(),
      writeProfilesConfig: vi.fn(),
      createProfileFolder: vi.fn()
    } as any;

    mindMapService = new MindMapService(mockStorageService);
    mindMapService.setProfile('test-profile');
  });

  it('should complete full mind map lifecycle', async () => {
    const taskId = 'task-123';

    const mindMap = await mindMapService.createMindMap(taskId);
    expect(mindMap.taskId).toBe(taskId);
    expect(mindMap.nodes).toHaveLength(0);

    const rootNode = await mindMapService.addNode(taskId, {
      text: 'Project Planning',
      level: 0,
      parentId: undefined
    });
    expect(rootNode.nodes).toHaveLength(1);
    expect(rootNode.nodes[0].text).toBe('Project Planning');

    const rootId = rootNode.nodes[0].id;
    const withChild = await mindMapService.addNode(taskId, {
      text: 'Requirements',
      level: 1,
      parentId: rootId
    });
    expect(withChild.nodes).toHaveLength(2);

    const childId = withChild.nodes[1].id;
    const updated = await mindMapService.updateNode(taskId, childId, {
      text: 'Updated Requirements',
      linkedTaskId: 'task-456'
    });
    expect(updated.nodes[1].text).toBe('Updated Requirements');
    expect(updated.nodes[1].linkedTaskId).toBe('task-456');

    const loaded = await mindMapService.getMindMap(taskId);
    expect(loaded).not.toBeNull();
    expect(loaded?.nodes).toHaveLength(2);
    expect(loaded?.nodes[1].linkedTaskId).toBe('task-456');
  });

  it('should handle complex hierarchical structure', async () => {
    const taskId = 'task-complex';
    const mindMap = await mindMapService.createMindMap(taskId);

    const root = await mindMapService.addNode(taskId, {
      text: 'Root',
      level: 0,
      parentId: undefined
    });

    const rootId = root.nodes[0].id;

    const withBranch1 = await mindMapService.addNode(taskId, {
      text: 'Branch 1',
      level: 1,
      parentId: rootId
    });

    await mindMapService.addNode(taskId, {
      text: 'Branch 2',
      level: 1,
      parentId: rootId
    });

    const branch1 = withBranch1.nodes.find((n: { text: string; }) => n.text === 'Branch 1');
    const branch1Id = branch1?.id;
    const withLeaf = await mindMapService.addNode(taskId, {
      text: 'Leaf 1.1',
      level: 2,
      parentId: branch1Id!
    });

    expect(withLeaf.nodes).toHaveLength(4);

    const markdown = mindMapService.toMarkdown(withLeaf);
    expect(markdown).toContain('Root');
    expect(markdown).toContain('Branch 1');
    expect(markdown).toContain('Branch 2');
    expect(markdown).toContain('Leaf 1.1');

    const loaded = await mindMapService.getMindMap(taskId);
    expect(loaded?.nodes).toHaveLength(4);
  });

  it('should delete node and all descendants', async () => {
    const taskId = 'task-delete';
    const mindMap = await mindMapService.createMindMap(taskId);

    const root = await mindMapService.addNode(taskId, {
      text: 'Root',
      level: 0,
      parentId: undefined
    });

    const rootId = root.nodes[0].id;

    const withChild = await mindMapService.addNode(taskId, {
      text: 'Child',
      level: 1,
      parentId: rootId
    });

    const childId = withChild.nodes[1].id;

    const withGrandchild = await mindMapService.addNode(taskId, {
      text: 'Grandchild',
      level: 2,
      parentId: childId
    });

    expect(withGrandchild.nodes).toHaveLength(3);

    const afterDelete = await mindMapService.deleteNode(taskId, childId);
    expect(afterDelete.nodes).toHaveLength(1);
    expect(afterDelete.nodes[0].text).toBe('Root');
  });

  it('should persist and retrieve mind maps across sessions', async () => {
    const taskId = 'task-persist';

    const mindMap1 = await mindMapService.createMindMap(taskId);
    await mindMapService.addNode(mindMap1.id, {
      text: 'Persisted Node',
      level: 0,
      parentId: undefined
    });

    const newService = new MindMapService(mockStorageService);
    newService.setProfile('test-profile');

    const loaded = await newService.getMindMap(taskId);
    expect(loaded).not.toBeNull();
    expect(loaded?.nodes).toHaveLength(1);
    expect(loaded?.nodes[0].text).toBe('Persisted Node');
  });

  it('should handle task links in nodes', async () => {
    const taskId = 'task-links';
    const mindMap = await mindMapService.createMindMap(taskId);

    const withLinkedNode = await mindMapService.addNode(taskId, {
      text: 'Related Task',
      level: 0,
      parentId: undefined,
      linkedTaskId: 'task-999'
    });

    const markdown = mindMapService.toMarkdown(withLinkedNode);
    expect(markdown).toContain('[[task-999]]');

    const loaded = await mindMapService.getMindMap(taskId);
    expect(loaded?.nodes[0].linkedTaskId).toBe('task-999');
  });

  it('should handle markdown round-trip conversion correctly', async () => {
    const taskId = 'task-roundtrip';
    const mindMap = await mindMapService.createMindMap(taskId);

    const root = await mindMapService.addNode(taskId, {
      text: 'Root',
      level: 0,
      parentId: undefined
    });

    const rootId = root.nodes[0].id;

    await mindMapService.addNode(taskId, {
      text: 'Child 1',
      level: 1,
      parentId: rootId
    });

    await mindMapService.addNode(taskId, {
      text: 'Child 2',
      level: 1,
      parentId: rootId,
      linkedTaskId: 'task-ref'
    });

    const original = await mindMapService.getMindMap(taskId);
    const markdown = mindMapService.toMarkdown(original!);
    const reparsed = mindMapService.fromMarkdown(markdown, taskId);

    expect(reparsed.nodes).toHaveLength(original!.nodes.length);
    
    const linkedNode = reparsed.nodes.find((n: { linkedTaskId: any; }) => n.linkedTaskId);
    expect(linkedNode?.text).toBe('Child 2');
    expect(linkedNode?.linkedTaskId).toBe('task-ref');
  });

  it('should handle empty mind maps gracefully', async () => {
    const taskId = 'task-empty';
    const mindMap = await mindMapService.createMindMap(taskId);

    expect(mindMap.nodes).toHaveLength(0);

    const markdown = mindMapService.toMarkdown(mindMap);
    expect(markdown).toContain('Mind Map for Task');

    const loaded = await mindMapService.getMindMap(taskId);
    expect(loaded?.nodes).toHaveLength(0);
  });
});
