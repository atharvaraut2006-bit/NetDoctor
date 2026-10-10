import React, { useState, useEffect } from 'react';
import type { QuickResultOption } from '../../types/diagnostic';
import { CheckIcon, AlertTriangleIcon, TerminalIcon, InfoIcon, ArrowRightIcon } from '../common/Icons';

interface ResultSubmissionProps {
  stepId: string;
  initialOutput?: string;
  onSubmitQuickResult: (option: QuickResultOption) => void;
  onSubmitPastedOutput: (output: string) => void;
}

export const ResultSubmission: React.FC<ResultSubmissionProps> = ({
  stepId,
  initialOutput,
  onSubmitQuickResult,
  onSubmitPastedOutput
}) => {
  const [activeTab, setActiveTab] = useState<'QUICK' | 'OUTPUT'>('QUICK');
  const [pastedOutput, setPastedOutput] = useState(initialOutput || '');

  // Reset textarea when moving to a different step
  useEffect(() => {
    setPastedOutput(initialOutput || '');
  }, [stepId, initialOutput]);

  const handlePasteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pastedOutput.trim()) return;
    onSubmitPastedOutput(pastedOutput.trim());
  };

  return (
    <div className="card submission-card">
      <div className="card-header" style={{ marginBottom: 0, paddingBottom: 0, borderBottom: 'none' }}>
        <span className="card-title" style={{ fontSize: '16px' }}>Submit Test Outcome</span>
      </div>

      <div className="submission-tabs" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'QUICK'}
          className={`tab-btn ${activeTab === 'QUICK' ? 'active' : ''}`}
          onClick={() => setActiveTab('QUICK')}
        >
          <CheckIcon size={15} />
          <span>Quick Outcome</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'OUTPUT'}
          className={`tab-btn ${activeTab === 'OUTPUT' ? 'active' : ''}`}
          onClick={() => setActiveTab('OUTPUT')}
        >
          <TerminalIcon size={15} />
          <span>Paste Output</span>
        </button>
      </div>

      {/* Tab 1: Quick Option Buttons */}
      {activeTab === 'QUICK' && (
        <div className="quick-options-grid">
          <button
            type="button"
            className="quick-btn success-option"
            onClick={() => onSubmitQuickResult('SUCCESS')}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-success)' }}>
              <CheckIcon size={18} />
              <span className="quick-btn-title">Command Worked as Expected</span>
            </div>
            <span className="quick-btn-desc">Output matches the sample expected result with no errors.</span>
          </button>

          <button
            type="button"
            className="quick-btn failure-option"
            onClick={() => onSubmitQuickResult('FAILURE')}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-error)' }}>
              <AlertTriangleIcon size={18} />
              <span className="quick-btn-title">Command Failed / Timed Out</span>
            </div>
            <span className="quick-btn-desc">Received errors, 100% packet loss, or request timeout.</span>
          </button>

          <button
            type="button"
            className="quick-btn"
            onClick={() => onSubmitQuickResult('DIFFERENT')}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary-blue)' }}>
              <InfoIcon size={18} />
              <span className="quick-btn-title">Different / Inconclusive Result</span>
            </div>
            <span className="quick-btn-desc">Partial response or unexpected network behavior observed.</span>
          </button>
        </div>
      )}

      {/* Tab 2: Paste Output */}
      {activeTab === 'OUTPUT' && (
        <form onSubmit={handlePasteSubmit} className="paste-output-form">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <label htmlFor="terminal-output-area" style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              Paste the raw output copied from your Command Prompt or Terminal:
            </label>
          </div>
          <textarea
            id="terminal-output-area"
            className="terminal-textarea"
            placeholder="Paste your command output here... (e.g. Reply from 8.8.8.8: bytes=32 time=11ms TTL=113...)"
            value={pastedOutput}
            onChange={(e) => setPastedOutput(e.target.value)}
            rows={5}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              NetDoctor automatically extracts IP addresses, gateways, packet loss %, and response latency.
            </span>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={!pastedOutput.trim()}
            >
              <span>Submit & Analyze Result</span>
              <ArrowRightIcon size={15} />
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
