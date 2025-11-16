import { useState, useEffect } from 'react';
import { ProfileSelector } from './components/profile/ProfileSelector';
import { AddProfileDialog } from './components/profile/AddProfileDialog';
import { BraindumpInput } from './components/braindump/BraindumpInput';
import { TaskReview } from './components/braindump/TaskReview';
import { TaskBoard } from './components/task-board/TaskBoard';
import { ArchivedTasks } from './components/task-board/ArchivedTasks';
import { BrainstormMode } from './components/mind-map/BrainstormMode';
import { APIKeyConfig } from './components/shared/APIKeyConfig';
import { ProfileProvider, useProfile } from './utils/ProfileContext';
import { LocalProfileService } from './services/profile-manager/ProfileService';
import { StorageService } from './services/storage/StorageService';
import { AIService } from './services/ai/AIService';
import { TaskService } from './services/task-manager/TaskService';
import { MindMapService } from './services/mind-map/MindMapService';
import type { Task } from './models/Task';
import type { ExtractedTasksResult, DuplicateMatch } from './services/ai/AIService';

const storage = new StorageService();
const profileService = new LocalProfileService(storage);
const taskService = new TaskService(storage);
const aiService = new AIService();
const mindMapService = new MindMapService(storage);

type AppMode = 'braindump' | 'task-board' | 'brainstorm';

function AppContent() {
  const { activeProfile, refreshProfiles, switchProfile } = useProfile();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [mode, setMode] = useState<AppMode>('braindump');
  const [showArchive, setShowArchive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [extractedResult, setExtractedResult] = useState<ExtractedTasksResult | null>(null);
  const [brainstormTask, setBrainstormTask] = useState<Task | null>(null);

  useEffect(() => {
    if (activeProfile) {
      taskService.loadTasks().catch(console.error);
      mindMapService.setProfile(activeProfile.name);
    }
  }, [activeProfile]);

  const handleApiKeySet = (apiKey: string) => {
    aiService.setApiKey(apiKey);
  };

  const handleProfileSwitch = async (profile: Profile | null) => {
    if (profile) {
      await switchProfile(profile.id);
    }
  };

  const handleBraindumpSubmit = async (text: string) => {
    if (!aiService.isReady()) {
      setError('Please configure your OpenAI API key first');
      return;
    }

    if (!activeProfile) {
      setError('Please select or create a profile first');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const existingTasks = await taskService.getAllTasks();
      const result = await aiService.extractTasksFromBraindump(text, existingTasks);
      setExtractedResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to extract tasks');
      console.error('Braindump extraction error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTasksConfirm = async (
    tasksToCreate: Partial<Task>[],
    duplicatesToMerge: DuplicateMatch[]
  ) => {
    try {
      // Merge duplicates first
      for (const duplicate of duplicatesToMerge) {
        await taskService.mergeDuplicate(
          duplicate.existingTask.id,
          duplicate.extractedTask
        );
      }

      // Create new tasks
      for (const taskData of tasksToCreate) {
        await taskService.createTask({
          ...taskData,
          quadrant: taskService.calculateQuadrant(
            taskData.urgency as 'urgent' | 'not-urgent',
            taskData.businessImpact as 'high' | 'low'
          ),
          status: 'active',
          dueDate: taskData.dueDate ? new Date(taskData.dueDate) : undefined,
        });
      }

      // Reset state and switch to task board
      setExtractedResult(null);
      setMode('task-board');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create tasks');
      console.error('Task creation error:', err);
    }
  };

  const handleProfileCreated = () => {
    refreshProfiles();
  };

  const handleBrainstormTask = (task: Task) => {
    setBrainstormTask(task);
    setMode('brainstorm');
  };

  const handleCloseBrainstorm = () => {
    setBrainstormTask(null);
    setMode('task-board');
  };

  if (!activeProfile) {
    return (
      <div className="app">
        <APIKeyConfig onKeySet={handleApiKeySet} />
        <ProfileSelector
          profileService={profileService}
          onProfileChange={handleProfileSwitch}
          onAddProfile={() => setShowAddDialog(true)}
        />
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <p>Please select or create a profile to get started</p>
        </div>
        {showAddDialog && (
          <AddProfileDialog
            profileService={profileService}
            onClose={() => setShowAddDialog(false)}
            onProfileCreated={handleProfileCreated}
          />
        )}
      </div>
    );
  }

  return (
    <div className="app">
      {mode === 'braindump' && <APIKeyConfig onKeySet={handleApiKeySet} />}
      
      {mode === 'braindump' && (
        <ProfileSelector
          profileService={profileService}
          onProfileChange={handleProfileSwitch}
          onAddProfile={() => setShowAddDialog(true)}
        />
      )}
      
      <main>
        {mode === 'braindump' && !extractedResult ? (
          <>
            <BraindumpInput
              onSubmit={handleBraindumpSubmit}
              isProcessing={isProcessing}
              error={error}
            />
            <div style={{ textAlign: 'center', marginTop: '2rem' }}>
              <button
                onClick={() => setMode('task-board')}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '1rem',
                  cursor: 'pointer',
                }}
              >
                📋 View Task Board
              </button>
            </div>
          </>
        ) : mode === 'braindump' && extractedResult ? (
          <TaskReview
            tasks={extractedResult.tasks}
            duplicates={extractedResult.duplicates}
            onConfirm={handleTasksConfirm}
            onCancel={() => setExtractedResult(null)}
          />
        ) : mode === 'brainstorm' && brainstormTask ? (
          <BrainstormMode
            task={brainstormTask}
            mindMapService={mindMapService}
            onClose={handleCloseBrainstorm}
          />
        ) : (
          <TaskBoard
            taskService={taskService}
            onShowArchive={() => setShowArchive(true)}
            onBrainstorm={handleBrainstormTask}
          />
        )}
      </main>

      {mode === 'task-board' && (
        <button
          onClick={() => setMode('braindump')}
          style={{
            position: 'fixed',
            top: '1rem',
            right: '1rem',
            padding: '0.75rem 1.5rem',
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '1rem',
            cursor: 'pointer',
            zIndex: 100,
          }}
        >
          ✍️ Braindump Mode
        </button>
      )}

      {showArchive && (
        <ArchivedTasks
          taskService={taskService}
          onClose={() => setShowArchive(false)}
        />
      )}

      {showAddDialog && (
        <AddProfileDialog
          profileService={profileService}
          onClose={() => setShowAddDialog(false)}
          onProfileCreated={handleProfileCreated}
        />
      )}
    </div>
  );
}

function App() {
  const [storageReady, setStorageReady] = useState(false);
  const [storageError, setStorageError] = useState<string | null>(null);

  useEffect(() => {
    initializeStorage();
  }, []);

  const initializeStorage = async () => {
    try {
      await storage.initialize();
      setStorageReady(true);
    } catch (err) {
      setStorageError(err instanceof Error ? err.message : 'Failed to initialize storage');
    }
  };

  if (storageError) {
    return (
      <div style={{ 
        padding: '2rem', 
        textAlign: 'center',
        maxWidth: '600px',
        margin: '2rem auto'
      }}>
        <h2>Storage Initialization Required</h2>
        <p style={{ color: '#dc2626', marginBottom: '1rem' }}>{storageError}</p>
        <p style={{ marginBottom: '1.5rem' }}>
          This app needs access to store your data locally. Please grant directory access when prompted.
        </p>
        <button
          onClick={() => {
            setStorageError(null);
            initializeStorage();
          }}
          style={{
            padding: '0.75rem 1.5rem',
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '1rem',
            cursor: 'pointer',
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  if (!storageReady) {
    return (
      <div style={{ 
        padding: '2rem', 
        textAlign: 'center',
        maxWidth: '600px',
        margin: '2rem auto'
      }}>
        <h2>Initializing Storage...</h2>
        <p>Please grant directory access when prompted.</p>
      </div>
    );
  }

  return (
    <ProfileProvider profileService={profileService} storage={storage}>
      <AppContent />
    </ProfileProvider>
  );
}

export default App;
