import { MindMapNode } from '../models/MindMap';
import { v4 as uuidv4 } from 'uuid';

interface ParsedNode {
  text: string;
  level: number;
  indent: number;
  linkedTaskId?: string;
}

/**
 * Parse markdown content into hierarchical tree structure
 * @param markdown - Markdown content to parse
 * @returns Array of mind map nodes
 */
export function parseMarkdownToTree(markdown: string): MindMapNode[] {
  const lines = markdown.split('\n');
  const nodes: MindMapNode[] = [];
  const stack: Array<{ node: MindMapNode; indent: number }> = [];

  for (const line of lines) {
    const trimmed = line.trimEnd();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const parsed = parseMarkdownLine(trimmed);
    if (!parsed) continue;

    let parentId: string | undefined;
    while (stack.length > 0 && stack[stack.length - 1].indent >= parsed.indent) {
      stack.pop();
    }

    if (stack.length > 0) {
      parentId = stack[stack.length - 1].node.id;
    }

    const node: MindMapNode = {
      id: uuidv4(),
      text: parsed.text,
      parentId,
      level: parsed.level,
      linkedTaskId: parsed.linkedTaskId
    };

    nodes.push(node);
    stack.push({ node, indent: parsed.indent });
  }

  return nodes;
}

/**
 * Convert tree structure to hierarchical markdown
 * @param nodes - Array of mind map nodes
 * @param title - Optional title for the markdown
 * @returns Markdown string
 */
export function treeToMarkdown(nodes: MindMapNode[], title?: string): string {
  let markdown = title ? `# ${title}\n\n` : '';

  const rootNodes = nodes.filter(n => !n.parentId);
  
  for (const root of rootNodes) {
    markdown += nodeToMarkdownRecursive(nodes, root, 0);
  }

  return markdown;
}

/**
 * Parse a single markdown line into node data
 * @param line - Markdown line to parse
 * @returns Parsed node data or null if invalid
 */
function parseMarkdownLine(line: string): ParsedNode | null {
  const match = line.match(/^(\s*)([-*])\s+(.+)$/);
  if (!match) return null;

  const leadingSpaces = match[1].length;
  const text = match[3];

  const indent = Math.floor(leadingSpaces / 2);
  const level = indent;

  const linkedTaskMatch = text.match(/\[\[([^\]]+)\]\]/);
  const linkedTaskId = linkedTaskMatch ? linkedTaskMatch[1] : undefined;
  const cleanText = text.replace(/\[\[([^\]]+)\]\]/g, '').trim();

  return {
    text: cleanText,
    level,
    indent,
    linkedTaskId
  };
}

/**
 * Recursively convert node to markdown with children
 * @param allNodes - All nodes in the tree
 * @param node - Current node to convert
 * @param depth - Current depth in tree
 * @returns Markdown string
 */
function nodeToMarkdownRecursive(allNodes: MindMapNode[], node: MindMapNode, depth: number): string {
  const indent = '  '.repeat(depth);
  
  let line = `${indent}- ${node.text}`;
  if (node.linkedTaskId) {
    line += ` [[${node.linkedTaskId}]]`;
  }
  line += '\n';

  const children = allNodes.filter(n => n.parentId === node.id);
  for (const child of children) {
    line += nodeToMarkdownRecursive(allNodes, child, depth + 1);
  }

  return line;
}

/**
 * Find all descendants of a node
 * @param nodes - All nodes in the tree
 * @param parentId - Parent node ID
 * @returns Array of descendant node IDs
 */
export function getAllDescendants(nodes: MindMapNode[], parentId: string): string[] {
  const descendants: string[] = [];
  const children = nodes.filter(n => n.parentId === parentId);
  
  for (const child of children) {
    descendants.push(child.id);
    descendants.push(...getAllDescendants(nodes, child.id));
  }

  return descendants;
}

/**
 * Validate tree structure (no cycles, single root per tree)
 * @param nodes - Nodes to validate
 * @returns True if valid, false otherwise
 */
export function validateTree(nodes: MindMapNode[]): boolean {
  if (nodes.length === 0) return true;

  const visited = new Set<string>();
  const rootNodes = nodes.filter(n => !n.parentId);

  for (const root of rootNodes) {
    if (!validateSubtree(nodes, root.id, visited)) {
      return false;
    }
  }

  return visited.size === nodes.length;
}

/**
 * Validate subtree for cycles
 * @param nodes - All nodes
 * @param nodeId - Current node ID
 * @param visited - Set of visited node IDs
 * @returns True if valid, false if cycle detected
 */
function validateSubtree(nodes: MindMapNode[], nodeId: string, visited: Set<string>): boolean {
  if (visited.has(nodeId)) {
    return false;
  }

  visited.add(nodeId);

  const children = nodes.filter(n => n.parentId === nodeId);
  for (const child of children) {
    if (!validateSubtree(nodes, child.id, visited)) {
      return false;
    }
  }

  return true;
}
