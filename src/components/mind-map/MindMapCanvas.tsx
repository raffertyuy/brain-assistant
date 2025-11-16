import React, { useEffect, useRef, useState } from 'react';
import { MindMap, MindMapNode } from '../../models/MindMap';
import { forceSimulation, forceLink, forceManyBody, forceCenter, SimulationNodeDatum, SimulationLinkDatum } from 'd3-force';
import styles from './MindMapCanvas.module.css';

interface MindMapCanvasProps {
  mindMap: MindMap;
  onNodeClick?: (node: MindMapNode) => void;
  onNodeDoubleClick?: (node: MindMapNode) => void;
  onAddChild?: (parentNode: MindMapNode) => void;
  onDeleteNode?: (node: MindMapNode) => void;
  selectedNodeId?: string;
}

interface D3Node extends SimulationNodeDatum {
  id: string;
  text: string;
  node: MindMapNode;
}

interface D3Link extends SimulationLinkDatum<D3Node> {
  source: string | D3Node;
  target: string | D3Node;
}

export const MindMapCanvas: React.FC<MindMapCanvasProps> = ({
  mindMap,
  onNodeClick,
  onNodeDoubleClick,
  onAddChild,
  onDeleteNode,
  selectedNodeId
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [nodes, setNodes] = useState<D3Node[]>([]);
  const [links, setLinks] = useState<D3Link[]>([]);

  useEffect(() => {
    if (!mindMap || mindMap.nodes.length === 0) {
      setNodes([]);
      setLinks([]);
      return;
    }

    const d3Nodes: D3Node[] = mindMap.nodes.map(node => ({
      id: node.id,
      text: node.text,
      node: node,
      x: Math.random() * 800,
      y: Math.random() * 600
    }));

    const d3Links: D3Link[] = mindMap.nodes
      .filter(node => node.parentId)
      .map(node => ({
        source: node.parentId!,
        target: node.id
      }));

    const simulation = forceSimulation(d3Nodes)
      .force('link', forceLink<D3Node, D3Link>(d3Links).id(d => d.id).distance(100))
      .force('charge', forceManyBody().strength(-300))
      .force('center', forceCenter(400, 300))
      .on('tick', () => {
        setNodes([...d3Nodes]);
        setLinks([...d3Links]);
      });

    simulation.alpha(1).restart();

    return () => {
      simulation.stop();
    };
  }, [mindMap]);

  const handleNodeClick = (node: MindMapNode, event: React.MouseEvent) => {
    event.stopPropagation();
    if (onNodeClick) {
      onNodeClick(node);
    }
  };

  const handleNodeDoubleClick = (node: MindMapNode, event: React.MouseEvent) => {
    event.stopPropagation();
    if (onNodeDoubleClick) {
      onNodeDoubleClick(node);
    }
  };

  const handleAddChild = (node: MindMapNode, event: React.MouseEvent) => {
    event.stopPropagation();
    if (onAddChild) {
      onAddChild(node);
    }
  };

  const handleDelete = (node: MindMapNode, event: React.MouseEvent) => {
    event.stopPropagation();
    if (onDeleteNode) {
      onDeleteNode(node);
    }
  };

  if (!mindMap || mindMap.nodes.length === 0) {
    return (
      <div className={styles.emptyState}>
        <p>No nodes in this mind map yet.</p>
        <p>Click "Add Root Node" to get started.</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <svg ref={svgRef} className={styles.svg} width="800" height="600">
        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="10"
            refX="20"
            refY="3"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <path d="M0,0 L0,6 L9,3 z" fill="#999" />
          </marker>
        </defs>

        {links.map((link, index) => {
          const sourceNode = nodes.find(n => n.id === (typeof link.source === 'string' ? link.source : link.source.id));
          const targetNode = nodes.find(n => n.id === (typeof link.target === 'string' ? link.target : link.target.id));
          
          if (!sourceNode || !targetNode) return null;

          return (
            <line
              key={`link-${index}`}
              x1={sourceNode.x ?? 0}
              y1={sourceNode.y ?? 0}
              x2={targetNode.x ?? 0}
              y2={targetNode.y ?? 0}
              className={styles.link}
              markerEnd="url(#arrowhead)"
            />
          );
        })}

        {nodes.map(d3Node => (
          <g
            key={d3Node.id}
            transform={`translate(${d3Node.x ?? 0}, ${d3Node.y ?? 0})`}
            onClick={(e) => handleNodeClick(d3Node.node, e)}
            onDoubleClick={(e) => handleNodeDoubleClick(d3Node.node, e)}
            className={styles.nodeGroup}
          >
            <circle
              r={30}
              className={`${styles.node} ${selectedNodeId === d3Node.id ? styles.selected : ''}`}
            />
            <text
              className={styles.nodeText}
              textAnchor="middle"
              dy=".3em"
            >
              {d3Node.text.length > 15 ? d3Node.text.substring(0, 15) + '...' : d3Node.text}
            </text>
            
            {selectedNodeId === d3Node.id && (
              <>
                <circle
                  r={12}
                  cx={40}
                  cy={-20}
                  className={styles.actionButton}
                  onClick={(e) => handleAddChild(d3Node.node, e)}
                />
                <text
                  x={40}
                  y={-20}
                  className={styles.actionIcon}
                  textAnchor="middle"
                  dy=".3em"
                  onClick={(e) => handleAddChild(d3Node.node, e)}
                >
                  +
                </text>

                <circle
                  r={12}
                  cx={40}
                  cy={20}
                  className={styles.deleteButton}
                  onClick={(e) => handleDelete(d3Node.node, e)}
                />
                <text
                  x={40}
                  y={20}
                  className={styles.actionIcon}
                  textAnchor="middle"
                  dy=".3em"
                  onClick={(e) => handleDelete(d3Node.node, e)}
                >
                  ×
                </text>
              </>
            )}
            
            {d3Node.node.linkedTaskId && (
              <circle
                r={5}
                cx={30}
                cy={0}
                className={styles.linkIndicator}
                title={`Linked to task ${d3Node.node.linkedTaskId}`}
              />
            )}
          </g>
        ))}
      </svg>
    </div>
  );
};
