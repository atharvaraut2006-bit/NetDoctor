import React, { useState } from 'react';
import type { CommonProblem, OperatingSystem } from '../../types/diagnostic';
import type { FollowUpOption, FollowUpQuestion, ProblemCategoryKey } from '../../engine/types';
import { OSSelector } from './OSSelector';
import { CommonProblemsGrid } from './CommonProblemsGrid';
import { ValidationFeedback } from './ValidationFeedback';
import { FollowUpQuestionCard } from './FollowUpQuestionCard';
import { NetworkVisual } from '../common/NetworkVisual';
import { NetworkIcon, ArrowRightIcon } from '../common/Icons';

interface HomeScreenProps {
  onStartDiagnosis: (problemText: string, os: OperatingSystem, presetCategoryKey?: ProblemCategoryKey) => void;
  rejectionReason: string | null;
  activeFollowUp: FollowUpQuestion | null;
  onAnswerFollowUp: (option: FollowUpOption) => void;
  onCancelFollowUp: () => void;
  onClearRejection: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onStartDiagnosis,
  rejectionReason,
  activeFollowUp,
  onAnswerFollowUp,
  onCancelFollowUp,
  onClearRejection
}) => {
  const [problemText, setProblemText] = useState('');
  const [selectedOS, setSelectedOS] = useState<OperatingSystem>('windows');
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!problemText.trim()) {
      setValidationError('Please describe your network problem to start diagnosis.');
      return;
    }
    setValidationError(null);
    onClearRejection();
    onStartDiagnosis(problemText.trim(), selectedOS);
  };

  const handleCommonProblemSelect = (problem: CommonProblem) => {
    setProblemText(problem.title);
    onClearRejection();
    onStartDiagnosis(problem.title, selectedOS, problem.defaultCategoryKey);
  };

  const handleSuggestionSelect = (text: string) => {
    setProblemText(text);
    onClearRejection();
    onStartDiagnosis(text, selectedOS);
  };

  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="home-hero">
        <div className="home-badge">
          <NetworkIcon size={15} />
          <span>Structured Diagnostic System</span>
        </div>
        <h1 className="home-title">What's wrong with your network?</h1>
        <p className="home-description">
          Describe the problem in your own words. NetDoctor understands your description and validates the network scope.
        </p>
      </section>

      {/* Subtle Network Pipeline Visual */}
      <section className="home-visual-section" aria-label="Network Diagnostic Visual">
        <NetworkVisual activeStage="ALL" />
      </section>

      {/* Non-Networking Validation Rejection Alert */}
      {rejectionReason && (
        <section style={{ width: '100%' }}>
          <ValidationFeedback
            rejectionReason={rejectionReason}
            onSelectSuggestion={handleSuggestionSelect}
            onDismiss={onClearRejection}
          />
        </section>
      )}

      {/* Vague Query Targeted Follow-Up Question Card */}
      {activeFollowUp ? (
        <section style={{ width: '100%', marginBottom: '36px' }}>
          <FollowUpQuestionCard
            question={activeFollowUp}
            originalDescription={problemText}
            onSelectOption={onAnswerFollowUp}
            onCancel={onCancelFollowUp}
          />
        </section>
      ) : (
        /* Main Natural Language Input Card */
        <section className="home-input-card">
          <div className="card">
            <form onSubmit={handleFormSubmit} className="problem-input-container">
              <label htmlFor="network-problem-input" style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>
                Describe your network issue:
              </label>
              <textarea
                id="network-problem-input"
                className="problem-textarea"
                placeholder="E.g., My Wi-Fi is connected with full signal but web pages won't open, or my ping in online games is suddenly very high..."
                value={problemText}
                onChange={(e) => {
                  setProblemText(e.target.value);
                  if (validationError) setValidationError(null);
                  if (rejectionReason) onClearRejection();
                }}
                rows={4}
              />

              {validationError && (
                <div style={{ color: 'var(--color-error)', fontSize: '13px', fontWeight: 500 }}>
                  {validationError}
                </div>
              )}

              <div className="input-footer">
                <OSSelector selectedOS={selectedOS} onSelectOS={setSelectedOS} />

                <button
                  type="submit"
                  className="btn btn-primary btn-lg"
                  disabled={!problemText.trim()}
                >
                  <span>Start Diagnosis</span>
                  <ArrowRightIcon size={18} />
                </button>
              </div>
            </form>
          </div>
        </section>
      )}

      {/* Common Problems Grid */}
      <section className="home-common-problems">
        <CommonProblemsGrid onSelectProblem={handleCommonProblemSelect} />
      </section>
    </div>
  );
};
