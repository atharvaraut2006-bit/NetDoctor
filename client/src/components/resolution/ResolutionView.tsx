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
  ServerIcon,
  CopyIcon,
  CheckCheckIcon
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
  const [copiedHandoff, setCopiedHandoff] = React.useState(false);

  const handleCopyHandoff = () => {
    if (!finalReport?.escalation) return;
    const content = [
      `NetDoctor Technical Handoff Summary`,
      `Target: ${finalReport.escalation.escalateTo}`,
      `Subject: ${finalReport.escalation.title}`,
      `Reason: ${finalReport.escalation.reason}`,
      `\nVerified Test Evidence:`,
      ...finalReport.escalation.evidenceSummary.map((e) => `- ${e}`),
      `\nTechnical Diagnostics Notes:`,
      ...finalReport.escalation.technicalHandoffNotes.map((n) => `- ${n}`),
      `\nRecommended Questions for Support:`,
      ...finalReport.escalation.recommendedQuestions.map((q) => `- ${q}`)
    ].join('\n');

    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(content);
      setCopiedHandoff(true);
      setTimeout(() => setCopiedHandoff(false), 2500);
    }
  };

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
      <div
        className="card"
        style={{
          padding: '28px',
          marginBottom: '20px',
          borderLeft: finalReport.escalation ? '5px solid #D97706' : '5px solid var(--primary-blue)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              {finalReport.escalation ? (
                <span className="badge" style={{ backgroundColor: '#FEF3C7', color: '#92400E', border: '1px solid #FCD34D' }}>
                  Diagnosis Complete • External Escalation Required ({finalReport.escalation.escalateTo.replace('_', ' ')})
                </span>
              ) : (
                <span className="badge badge-teal">Diagnosis Complete • Problem Resolved</span>
              )}
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                {new Date(finalReport.resolvedAt).toLocaleTimeString()}
              </span>
            </div>
            <h1 style={{ fontSize: '22px', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 6px 0' }}>
              {finalReport.escalation ? 'Technical Escalation & Diagnostic Report' : 'Final Network Diagnostic Report'}
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

      {/* Structured Technical Escalation Section (Phase 5) */}
      {finalReport.escalation && (
        <div
          className="card"
          style={{
            padding: '24px',
            marginBottom: '20px',
            borderLeft: '5px solid #D97706',
            backgroundColor: '#FFFBEB'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '14px' }}>
            <div>
              <span className="badge" style={{ backgroundColor: '#FDE68A', color: '#78350F', marginBottom: '6px', display: 'inline-block' }}>
                Handoff Target: {finalReport.escalation.escalateTo.replace('_', ' ')}
              </span>
              <h3 style={{ fontSize: '17px', fontWeight: 600, color: '#92400E', margin: 0 }}>
                {finalReport.escalation.title}
              </h3>
            </div>

            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={handleCopyHandoff}
              style={{
                backgroundColor: copiedHandoff ? '#ECFDF5' : '#FFFFFF',
                borderColor: copiedHandoff ? '#059669' : '#D97706',
                color: copiedHandoff ? '#059669' : '#92400E',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              {copiedHandoff ? <CheckCheckIcon size={14} color="#059669" /> : <CopyIcon size={14} color="#92400E" />}
              <span>{copiedHandoff ? 'Copied Handoff Note!' : 'Copy Handoff Notes'}</span>
            </button>
          </div>

          <p style={{ fontSize: '14px', color: '#78350F', lineHeight: 1.5, marginBottom: '16px' }}>
            {finalReport.escalation.reason}
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
            <div style={{ padding: '16px', backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #FDE68A' }}>
              <h4 style={{ fontSize: '13.5px', fontWeight: 600, color: '#92400E', margin: '0 0 10px 0' }}>
                Technical Handoff Notes:
              </h4>
              <ul style={{ paddingLeft: '18px', margin: 0 }}>
                {finalReport.escalation.technicalHandoffNotes.map((note, idx) => (
                  <li key={idx} style={{ fontSize: '13px', color: 'var(--text-primary)', marginBottom: '6px', lineHeight: 1.4 }}>
                    {note}
                  </li>
                ))}
              </ul>
            </div>

            <div style={{ padding: '16px', backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #FDE68A' }}>
              <h4 style={{ fontSize: '13.5px', fontWeight: 600, color: '#92400E', margin: '0 0 10px 0' }}>
                Questions to Ask Support:
              </h4>
              <ul style={{ paddingLeft: '18px', margin: 0 }}>
                {finalReport.escalation.recommendedQuestions.map((q, idx) => (
                  <li key={idx} style={{ fontSize: '13px', color: 'var(--text-primary)', marginBottom: '6px', lineHeight: 1.4 }}>
                    {q}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

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
