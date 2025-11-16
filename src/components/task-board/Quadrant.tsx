import React from 'react';
import { useDrop } from 'react-dnd';
import type { Task } from '../../models/Task';
import { Quadrant as QuadrantEnum, QUADRANT_DEFINITIONS } from '../../models/Quadrant';
import { TaskCard } from './TaskCard';
import styles from './Quadrant.module.css';

interface QuadrantProps {
  quadrant: QuadrantEnum;
  tasks: Task[];
  onTaskMove: (taskId: string, targetQuadrant: QuadrantEnum) => void;
  onTaskEdit: (task: Task) => void;
  onTaskComplete: (taskId: string) => void;
  onBrainstorm?: (task: Task) => void;
}

export const Quadrant: React.FC<QuadrantProps> = ({
  quadrant,
  tasks,
  onTaskMove,
  onTaskEdit,
  onTaskComplete,
  onBrainstorm,
}) => {
  const definition = QUADRANT_DEFINITIONS[quadrant];

  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: 'TASK',
    drop: (item: { id: string }) => {
      onTaskMove(item.id, quadrant);
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
      canDrop: !!monitor.canDrop(),
    }),
  }));

  const isActive = isOver && canDrop;

  return (
    <div
      ref={drop}
      className={`${styles.quadrant} ${isActive ? styles.active : ''}`}
      data-quadrant={quadrant}
      style={{ borderColor: definition.color }}
    >
      <div className={styles.header} style={{ backgroundColor: definition.color }}>
        <h2 className={styles.title}>{definition.label}</h2>
        <p className={styles.description}>{definition.description}</p>
        <span className={styles.count}>{tasks.length}</span>
      </div>
      <div className={styles.taskList}>
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onEdit={onTaskEdit}
            onComplete={onTaskComplete}
            onBrainstorm={onBrainstorm}
          />
        ))}
      </div>
    </div>
  );
};
