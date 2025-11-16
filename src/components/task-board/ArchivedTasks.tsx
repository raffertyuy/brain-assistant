import React, { useState, useEffect } from 'react';
import type { Task } from '../../models/Task';
import type { TaskService } from '../../services/task-manager/TaskService';
import { SearchBar } from '../shared/SearchBar';
import styles from './ArchivedTasks.module.css';

interface ArchivedTasksProps {
  taskService: TaskService;
  onClose: () => void;
}

export const ArchivedTasks: React.FC<ArchivedTasksProps> = ({ taskService, onClose }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArea, setSelectedArea] = useState<string>('all');

  useEffect(() => {
    loadArchivedTasks();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [tasks, searchQuery, selectedArea]);

  const loadArchivedTasks = async () => {
    setLoading(true);
    try {
      const archived = await taskService.getArchivedTasks();
      setTasks(archived);
    } catch (error) {
      console.error('Failed to load archived tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = tasks;

    if (selectedArea !== 'all') {
      filtered = filtered.filter((t) => t.area === selectedArea);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.title.toLowerCase().includes(query) ||
          t.description.toLowerCase().includes(query)
      );
    }

    setFilteredTasks(filtered);
  };

  const areas = Array.from(new Set(tasks.map((t) => t.area).filter(Boolean)));

  const formatDate = (date?: Date) => {
    if (!date) return 'N/A';
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('en-US', { 
      year: 'numeric',
      month: 'short', 
      day: 'numeric' 
    });
  };

  const groupTasksByArea = (tasks: Task[]) => {
    const grouped: Record<string, Task[]> = {};
    tasks.forEach((task) => {
      const area = task.area || 'Uncategorized';
      if (!grouped[area]) {
        grouped[area] = [];
      }
      grouped[area].push(task);
    });
    return grouped;
  };

  const groupedTasks = groupTasksByArea(filteredTasks);

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.container} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h1 className={styles.title}>Archived Tasks</h1>
          <button
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close archive"
          >
            ✕
          </button>
        </div>

        <div className={styles.filters}>
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search archived tasks..."
          />
          <select
            className={styles.areaFilter}
            value={selectedArea}
            onChange={(e) => setSelectedArea(e.target.value)}
          >
            <option value="all">All Areas</option>
            {areas.map((area) => (
              <option key={area} value={area}>
                {area}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className={styles.loading}>Loading archived tasks...</div>
        ) : filteredTasks.length === 0 ? (
          <div className={styles.empty}>
            {searchQuery || selectedArea !== 'all'
              ? 'No tasks match your filters'
              : 'No archived tasks yet'}
          </div>
        ) : (
          <div className={styles.content}>
            {Object.entries(groupedTasks).map(([area, areaTasks]) => (
              <div key={area} className={styles.areaGroup}>
                <h2 className={styles.areaTitle}>
                  {area} <span className={styles.count}>({areaTasks.length})</span>
                </h2>
                <div className={styles.taskList}>
                  {areaTasks.map((task) => (
                    <div key={task.id} className={styles.taskCard}>
                      <div className={styles.taskHeader}>
                        <h3 className={styles.taskTitle}>{task.title}</h3>
                        <span className={styles.completedDate}>
                          ✓ {formatDate(task.completedAt)}
                        </span>
                      </div>
                      {task.description && (
                        <p className={styles.taskDescription}>{task.description}</p>
                      )}
                      <div className={styles.taskMeta}>
                        <span className={styles.quadrant}>{task.quadrant}</span>
                        {task.businessImpact && (
                          <span className={styles.impact}>
                            {task.businessImpact === 'high' ? '🔥 High Impact' : '💡 Low Impact'}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
