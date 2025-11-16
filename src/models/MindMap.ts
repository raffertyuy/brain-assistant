export interface MindMap {
  id: string;
  taskId: string;
  title: string;
  nodes: MindMapNode[];
  createdAt: Date;
  updatedAt: Date;
}

export interface MindMapNode {
  id: string;
  text: string;
  parentId?: string;
  children?: string[];
  linkedTaskId?: string;
  level: number;
}
