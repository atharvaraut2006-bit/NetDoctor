import React, { useState } from 'react';
import type { CommonProblem, OperatingSystem } from '../../types/diagnostic';
import type { FollowUpOption, FollowUpQuestion, ProblemCategoryKey } from '../../engine/types';
import { OSSelector } from './OSSelector';
import { CommonProblemsGrid } from './CommonProblemsGrid';
import { ValidationFeedback } from './ValidationFeedback';
import { FollowUpQuestionCard } from './FollowUpQuestionCard';
import { AboutSection } from './AboutSection';
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

  const QUICK_SYMPTOMS = [
    { label: 'Connected, no web access', text: 'My Wi-Fi shows connected with full signal but web pages will not load' },
    { label: 'Websites not loading (DNS)', text: 'Websites fail to open with DNS probe finished or server not found error' },
    { label: 'High ping in online games', text: 'My latency and ping are spiking over 200ms with jitter during online gaming' },
    { label: 'Intermittent packet drops', text: 'Frequent connection drops and packet loss during calls or streaming' }
  ];

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

  const handleQuickSymptomClick = (text: string) => {
    setProblemText(text);
    setValidationError(null);
    if (rejectionReason) onClearRejection();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      if (problemText.trim()) {
        handleFormSubmit(e);
      }
    }
  };

  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="home-hero">
        <div className="home-badge">
          <NetworkIcon size={14} />
          <span>Structured Diagnostic System</span>
        </div>
        <h1 className="home-title">What's wrong with your network?</h1>
        <p className="home-description">
          Describe the problem in your own words. NetDoctor understands your description and validates the network scope to guide you through systematic, safe troubleshooting.
        </p>
      </section>

      {/* Non-Networking Validation Rejection Alert */}
      {rejectionReason && (
        <section style={{ width: '100%', marginBottom: '24px' }}>
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
        /* Main Diagnostic Command Center Card (Placed Directly Below Hero) */
        <section className="home-input-card">
          <div className="card home-command-card">
            <form onSubmit={handleFormSubmit} className="problem-input-container">
              <div className="input-header-row">
                <label htmlFor="network-problem-input" className="input-label-primary">
                  Describe your network issue:
                </label>
                <span className="input-hint-badge">Plain Language Network Input</span>
              </div>

              {/* Quick Symptom Chips */}
              <div className="quick-symptoms-bar" aria-label="Common Symptom Examples">
                <span className="quick-symptoms-label">Quick examples:</span>
                <div className="quick-chips-list">
                  {QUICK_SYMPTOMS.map((chip, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className="quick-chip-btn"
                      onClick={() => handleQuickSymptomClick(chip.text)}
                      title={`Use example: "${chip.text}"`}
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="textarea-wrapper">
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
                  onKeyDown={handleKeyDown}
                  rows={4}
                />
              </div>

              {validationError && (
                <div className="input-error-msg" role="alert">
                  {validationError}
                </div>
              )}

              <div className="input-footer">
                <OSSelector selectedOS={selectedOS} onSelectOS={setSelectedOS} />

                <div className="input-actions-right">
                  <span className="input-shortcut-hint">Ctrl + Enter to run</span>
                  <button
                    type="submit"
                    className="btn btn-primary btn-lg start-diagnosis-btn"
                    disabled={!problemText.trim()}
                  >
                    <span>Start Diagnosis</span>
                    <ArrowRightIcon size={18} />
                  </button>
                </div>
              </div>
            </form>
          </div>
        </section>
      )}

      {/* Common Problems Grid */}
      <section className="home-common-problems">
        <CommonProblemsGrid onSelectProblem={handleCommonProblemSelect} />
      </section>

      {/* About NetDoctor Section */}
      <AboutSection />
    </div>
  );
};
