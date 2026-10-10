/**
 * NetDoctor — Resolution & Final Diagnosis View (Phase 4)
 * Displays closed-loop fix verification prompt ("Is your problem fixed?")
 * and the complete, evidence-based Final Diagnosis Summary Report.
 */

import React from 'react';
import type { FinalDiagnosticReport } from '../../engine/diagnostic/types';
import type { RootCauseRecord } from '../../knowledge/types';
import {
  CheckIcon,
  AlertTriangleIcon,
  ShieldIcon,
  ActivityIcon,
  InfoIcon,
  RotateCcwIcon,
  ArrowRightIcon,
  ServerIcon
} from '../common/Icons';


interface ResolutionViewProps {
  status: 'AWAITING_VERIFICATION' | 'RESOLVED';
  identifiedRootCause: RootCauseRecord | null;
  finalReport: FinalDiagnosticReport | null;
  onVerifyFixed: (isFixed: boolean) => void;
  onStartNewDiagnosis: () => void;
  onBackToWorkspace: () => void;
}

export const ResolutionView: React.FC<ResolutionViewProps> = ({
  status,
  identifiedRootCause,
  finalReport,
  onVerifyFixed,
  onStartNewDiagnosis,
  onBackToWorkspace
}) => {
  // 1. Verification Prompt State (When a diagnosis has been reached and user needs to test the fix)
  if (status === 'AWAITING_VERIFICATION' && identifiedRootCause) {
    return (
      <div className="resolution-container" style={{ maxWidth: '840px', margin: '0 auto', padding: '24px 16px' }}>
        {/* Verification Card */}
        <div className="card" style={{ padding: '28px', borderLeft: '5px solid var(--secondary-teal)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                backgroundColor: '#CCFBF1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--secondary-teal)'
              }}
            >
              <CheckIcon size={22} />
            </div>
            <div>
              <span className="badge badge-teal" style={{ marginBottom: '4px' }}>
                Diagnostic Finding • Solution Recommended
              </span>
              <h2 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                {identifiedRootCause.problemTitle}
              </h2>
            </div>
          </div>

          {/* Root Cause Technical Explanation */}
          <div
            style={{
              padding: '16px',
              backgroundColor: '#F8FAFC',
              borderRadius: '8px',
              border: '1px solid var(--color-border)',
              marginBottom: '20px'
            }}
          >
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
              Identified Root Cause:
            </div>
            <p style={{ fontSize: '15px', color: 'var(--text-primary)', fontWeight: 500, margin: '0 0 8px 0' }}>
              {identifiedRootCause.rootCause}
            </p>
            <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
              {identifiedRootCause.technicalExplanation}
            </p>
          </div>

          {/* Recommended Solution Steps */}
          <div style={{ marginBottom: '28px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '12px' }}>
              Recommended Solution Steps:
            </h3>
            <ol style={{ paddingLeft: '20px', margin: 0 }}>
              {identifiedRootCause.solutionSteps.map((step, idx) => (
                <li key={idx} style={{ fontSize: '14px', color: 'var(--text-primary)', marginBottom: '8px', lineHeight: 1.5 }}>
                  {step}
                </li>
              ))}
            </ol>
          </div>

          {/* Explicit Verification Prompt: Is your problem fixed? */}
          <div
            style={{
              padding: '20px',
              backgroundColor: '#F0FDFA',
              borderRadius: '8px',
              border: '1px solid #99F6E4',
              textAlign: 'center'
            }}
          >
            <h3 style={{ fontSize: '17px', fontWeight: 600, color: '#0F766E', marginBottom: '8px' }}>
              Is your problem fixed?
            </h3>
            <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', maxWidth: '520px', margin: '0 auto 18px auto' }}>
              Please apply the recommended steps above and test your network connection. Let NetDoctor know if this resolved your issue.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => onVerifyFixed(true)}
                style={{ backgroundColor: 'var(--secondary-teal)', borderColor: 'var(--secondary-teal)', padding: '10px 24px' }}
              >
                <CheckIcon size={16} />
                <span>Yes, Problem Fixed</span>
              </button>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => onVerifyFixed(false)}
                style={{ padding: '10px 20px' }}
              >
                <span>No, Still Not Working (Continue)</span>
                <ArrowRightIcon size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. Final Diagnosis Summary Report State
  if (!finalReport) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <p>No active final diagnosis report found.</p>
        <button type="button" className="btn btn-primary" onClick={onStartNewDiagnosis}>
          Start New Diagnosis
        </button>
      </div>
    );
  }

  return (
    <div className="resolution-container" style={{ maxWidth: '880px', margin: '0 auto', padding: '24px 16px' }}>
      {/* Final Summary Card Header */}
      <div className="card" style={{ padding: '28px', marginBottom: '20px', borderLeft: '5px solid var(--primary-blue)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span className="badge badge-teal">Diagnosis Complete • Problem Resolved</span>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                {new Date(finalReport.resolvedAt).toLocaleTimeString()}
              </span>
            </div>
            <h1 style={{ fontSize: '22px', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 6px 0' }}>
              Final Network Diagnostic Report
            </h1>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: 0 }}>
              Initial Issue: <b>"{finalReport.problemIdentified}"</b>
            </p>
          </div>

          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={onStartNewDiagnosis}
            title="Start a fresh troubleshooting session"
          >
            <RotateCcwIcon size={14} />
            <span>Start New Diagnosis</span>
          </button>
        </div>
      </div>

      {/* Grid: Root Cause & What Happened */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '20px', marginBottom: '20px' }}>
        {/* Root Cause Card */}
        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <AlertTriangleIcon size={18} color="var(--primary-blue)" />
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
              Root Cause
            </h3>
          </div>
          <p style={{ fontSize: '14.5px', color: 'var(--text-primary)', fontWeight: 500, lineHeight: 1.5, marginBottom: '8px' }}>
            {finalReport.rootCause}
          </p>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
            {finalReport.technicalExplanation}
          </p>
        </div>

        {/* What Happened Card */}
        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <InfoIcon size={18} color="var(--secondary-teal)" />
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
              What Happened
            </h3>
          </div>
          <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
            {finalReport.whatHappened}
          </p>
        </div>
      </div>

      {/* Verified Evidence Log */}
      <div className="card" style={{ padding: '20px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
          <ServerIcon size={18} color="var(--primary-blue)" />
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
            Verified Test Evidence
          </h3>
        </div>
        {finalReport.evidenceSummary.length > 0 ? (
          <ul style={{ paddingLeft: '20px', margin: 0 }}>
            {finalReport.evidenceSummary.map((item, idx) => (
              <li key={idx} style={{ fontSize: '13.5px', color: 'var(--text-primary)', marginBottom: '6px' }}>
                {item}
              </li>
            ))}
          </ul>
        ) : (
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
            All standard interface and routing checks completed.
          </p>
        )}
      </div>

      {/* Steps That Fixed It & Solution */}
      <div className="card" style={{ padding: '20px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
          <ActivityIcon size={18} color="var(--secondary-teal)" />
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
            Troubleshooting Steps & Solution Applied
          </h3>
        </div>
        <ol style={{ paddingLeft: '20px', margin: '0 0 14px 0' }}>
          {finalReport.solutionSteps.map((step, idx) => (
            <li key={idx} style={{ fontSize: '13.5px', color: 'var(--text-primary)', marginBottom: '6px' }}>
              {step}
            </li>
          ))}
        </ol>
      </div>

      {/* Prevention Recommendations */}
      {finalReport.preventionRecommendations.length > 0 && (
        <div className="card" style={{ padding: '20px', marginBottom: '24px', backgroundColor: '#F8FAFC' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <ShieldIcon size={18} color="#D97706" />
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
              Prevention Recommendations
            </h3>
          </div>
          <ul style={{ paddingLeft: '20px', margin: 0 }}>
            {finalReport.preventionRecommendations.map((rec, idx) => (
              <li key={idx} style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                {rec}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Bottom Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <button
          type="button"
          className="btn btn-outline"
          onClick={onBackToWorkspace}
        >
          <span>Review Completed Workspace</span>
        </button>

        <button
          type="button"
          className="btn btn-primary"
          onClick={onStartNewDiagnosis}
          style={{ padding: '10px 24px' }}
        >
          <RotateCcwIcon size={15} />

          <span>Start New Diagnosis</span>
        </button>
      </div>
    </div>
  );
};
