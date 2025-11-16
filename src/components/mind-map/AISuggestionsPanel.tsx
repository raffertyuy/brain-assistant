import React, { useState } from 'react';
import type { BrainstormSuggestion } from '../../services/ai/AIService';
import styles from './AISuggestionsPanel.module.css';

interface AISuggestionsPanelProps {
  suggestions: BrainstormSuggestion[];
  questions: string[];
  simplifications: string[];
  isLoading: boolean;
  onRefineApproach?: (suggestion: BrainstormSuggestion, userInput: string) => void;
  onApplySuggestion?: (suggestion: BrainstormSuggestion) => void;
}

export const AISuggestionsPanel: React.FC<AISuggestionsPanelProps> = ({
  suggestions,
  questions,
  simplifications,
  isLoading,
  onRefineApproach,
  onApplySuggestion,
}) => {
  const [editingSuggestion, setEditingSuggestion] = useState<string | null>(null);
  const [refinementText, setRefinementText] = useState('');

  const handleRefineClick = (suggestion: BrainstormSuggestion) => {
    setEditingSuggestion(suggestion.id);
    setRefinementText(suggestion.text);
  };

  const handleSubmitRefinement = (suggestion: BrainstormSuggestion) => {
    if (onRefineApproach && refinementText.trim()) {
      onRefineApproach(suggestion, refinementText);
      setEditingSuggestion(null);
      setRefinementText('');
    }
  };

  const handleCancelRefinement = () => {
    setEditingSuggestion(null);
    setRefinementText('');
  };

  const getSuggestionIcon = (type: BrainstormSuggestion['type']) => {
    switch (type) {
      case 'approach':
        return '🎯';
      case 'consideration':
        return '💡';
      case 'question':
        return '❓';
      case 'simplification':
        return '✂️';
      default:
        return '•';
    }
  };

  if (isLoading) {
    return (
      <div className={styles.panel}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>AI is thinking...</p>
        </div>
      </div>
    );
  }

  const hasSuggestions = suggestions.length > 0 || questions.length > 0 || simplifications.length > 0;

  if (!hasSuggestions) {
    return (
      <div className={styles.panel}>
        <div className={styles.empty}>
          <p>Click "AI Suggestions" to get brainstorming help</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <h3>AI Suggestions</h3>
      </div>

      <div className={styles.content}>
        {/* Main suggestions */}
        {suggestions.length > 0 && (
          <div className={styles.section}>
            <h4>Ideas & Approaches</h4>
            <div className={styles.suggestionList}>
              {suggestions.map((suggestion) => (
                <div key={suggestion.id} className={`${styles.suggestion} ${styles[suggestion.type]}`}>
                  <div className={styles.suggestionHeader}>
                    <span className={styles.icon}>{getSuggestionIcon(suggestion.type)}</span>
                    <span className={styles.type}>{suggestion.type}</span>
                  </div>
                  
                  {editingSuggestion === suggestion.id ? (
                    <div className={styles.editMode}>
                      <textarea
                        className={styles.refinementInput}
                        value={refinementText}
                        onChange={(e) => setRefinementText(e.target.value)}
                        placeholder="Modify this suggestion..."
                        rows={3}
                      />
                      <div className={styles.editActions}>
                        <button
                          className={styles.saveButton}
                          onClick={() => handleSubmitRefinement(suggestion)}
                          disabled={!refinementText.trim()}
                        >
                          Refine with AI
                        </button>
                        <button
                          className={styles.cancelButton}
                          onClick={handleCancelRefinement}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className={styles.suggestionText}>{suggestion.text}</p>
                      <div className={styles.suggestionActions}>
                        {onApplySuggestion && (
                          <button
                            className={styles.applyButton}
                            onClick={() => onApplySuggestion(suggestion)}
                          >
                            Apply
                          </button>
                        )}
                        {onRefineApproach && (
                          <button
                            className={styles.refineButton}
                            onClick={() => handleRefineClick(suggestion)}
                          >
                            Refine
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Probing questions */}
        {questions.length > 0 && (
          <div className={styles.section}>
            <h4>Questions to Consider</h4>
            <div className={styles.questionList}>
              {questions.map((question, index) => (
                <div key={index} className={styles.question}>
                  <span className={styles.questionIcon}>🤔</span>
                  <p>{question}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Simplification suggestions */}
        {simplifications.length > 0 && (
          <div className={styles.section}>
            <h4>Simplification Ideas</h4>
            <div className={styles.simplificationList}>
              {simplifications.map((simplification, index) => (
                <div key={index} className={styles.simplification}>
                  <span className={styles.simplificationIcon}>✂️</span>
                  <p>{simplification}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
