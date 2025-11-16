import React, { useState, useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Quadrant as QuadrantComponent } from './Quadrant';
import { TaskEditDialog } from './TaskEditDialog';
import { Quadrant as QuadrantEnum } from '../../models/Quadrant';
import type { Task } from '../../models/Task';
import type { TaskService } from '../../services/task-manager/TaskService';
import styles from './TaskBoard.module.css';

interface TaskBoardProps {
  taskService: TaskService;
  onShowArchive: () => void;
  onBrainstorm?: (task: Task) => void;
}

export const TaskBoard: React.FC<TaskBoardProps> = ({ taskService, onShowArchive, onBrainstorm }) => {
  const [tasksByQuadrant, setTasksByQuadrant] = useState<Record<QuadrantEnum, Task[]>>({
    [QuadrantEnum.DO]: [],
    [QuadrantEnum.PLAN]: [],
    [QuadrantEnum.DELEGATE]: [],
    [QuadrantEnum.ELIMINATE]: [],
  });
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);

  const loadTasks = async () => {
    setLoading(true);
    try {
      await taskService.loadTasks();
      const doTasks = await taskService.getTasksByQuadrant(QuadrantEnum.DO);
      const planTasks = await taskService.getTasksByQuadrant(QuadrantEnum.PLAN);
      const delegateTasks = await taskService.getTasksByQuadrant(QuadrantEnum.DELEGATE);
      const eliminateTasks = await taskService.getTasksByQuadrant(QuadrantEnum.ELIMINATE);

      setTasksByQuadrant({
        [QuadrantEnum.DO]: doTasks,
        [QuadrantEnum.PLAN]: planTasks,
        [QuadrantEnum.DELEGATE]: delegateTasks,
        [QuadrantEnum.ELIMINATE]: eliminateTasks,
      });
    } catch (error) {
      console.error('Failed to load tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const handleTaskMove = async (taskId: string, targetQuadrant: QuadrantEnum) => {
    try {
      await taskService.moveToQuadrant(taskId, targetQuadrant);
      await loadTasks();
    } catch (error) {
      console.error('Failed to move task:', error);
    }
  };

  const handleTaskEdit = (task: Task) => {
    setEditingTask(task);
  };

  const handleTaskSave = async (updatedTask: Task) => {
    try {
      await taskService.updateTask(updatedTask.id, updatedTask);
      await loadTasks();
      setEditingTask(null);
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  const handleTaskComplete = async (taskId: string) => {
    try {
      await taskService.completeTask(taskId);
      await loadTasks();
    } catch (error) {
      console.error('Failed to complete task:', error);
    }
  };

  if (loading) {
    return <div className={styles.loading}>Loading tasks...</div>;
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.pageTitle}>Task Board</h1>
          <button className={styles.archiveButton} onClick={onShowArchive}>
            📦 View Archive
          </button>
        </div>
        <div className={styles.grid}>
          <QuadrantComponent
            quadrant={QuadrantEnum.DO}
            tasks={tasksByQuadrant[QuadrantEnum.DO]}
            onTaskMove={handleTaskMove}
            onTaskEdit={handleTaskEdit}
            onTaskComplete={handleTaskComplete}
            onBrainstorm={onBrainstorm}
          />
          <QuadrantComponent
            quadrant={QuadrantEnum.PLAN}
            tasks={tasksByQuadrant[QuadrantEnum.PLAN]}
            onTaskMove={handleTaskMove}
            onTaskEdit={handleTaskEdit}
            onTaskComplete={handleTaskComplete}
            onBrainstorm={onBrainstorm}
          />
          <QuadrantComponent
            quadrant={QuadrantEnum.DELEGATE}
            tasks={tasksByQuadrant[QuadrantEnum.DELEGATE]}
            onTaskMove={handleTaskMove}
            onTaskEdit={handleTaskEdit}
            onTaskComplete={handleTaskComplete}
            onBrainstorm={onBrainstorm}
          />
          <QuadrantComponent
            quadrant={QuadrantEnum.ELIMINATE}
            tasks={tasksByQuadrant[QuadrantEnum.ELIMINATE]}
            onTaskMove={handleTaskMove}
            onTaskEdit={handleTaskEdit}
            onTaskComplete={handleTaskComplete}
            onBrainstorm={onBrainstorm}
          />
        </div>
        {editingTask && (
          <TaskEditDialog
            task={editingTask}
            onSave={handleTaskSave}
            onClose={() => setEditingTask(null)}
          />
        )}
      </div>
    </DndProvider>
  );
};
