import React from 'react';
import type { StepSafetyConfig } from '../../knowledge/types';
import { AlertTriangleIcon, CheckIcon, ShieldIcon } from '../common/Icons';

interface SafetyConfirmationModalProps {
  isOpen: boolean;
  stepTitle: string;
  warningMessage?: string;
  safetyConfig: StepSafetyConfig;
  onConfirm: () => void;
  onCancel: () => void;
}

export const SafetyConfirmationModal: React.FC<SafetyConfirmationModalProps> = ({
  isOpen,
  stepTitle,
  warningMessage,
  safetyConfig,
  onConfirm,
  onCancel
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="safety-modal-title"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.55)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '16px'
      }}
    >
      <div
        className="card"
        style={{
          maxWidth: '560px',
          width: '100%',
          backgroundColor: '#FFFFFF',
          borderRadius: '10px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          border: '1px solid #E2E8F0',
          padding: '24px',
          position: 'relative'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', marginBottom: '16px' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '8px',
              backgroundColor: '#FEF3C7',
              color: '#D97706',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <AlertTriangleIcon size={22} />
          </div>
          <div>
            <span
              className="badge"
              style={{
                backgroundColor: '#FEF3C7',
                color: '#92400E',
                border: '1px solid #FDE68A',
                fontSize: '11px',
                marginBottom: '4px'
              }}
            >
              Safety Notice • Potentially Disruptive Action
            </span>
            <h2
              id="safety-modal-title"
              style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}
            >
              Disruptive Diagnostic Action
            </h2>
            <div style={{ fontSize: '13.5px', fontWeight: 500, color: 'var(--text-secondary)', marginTop: '2px' }}>
              Confirm Before Running: {stepTitle}
            </div>
          </div>
        </div>

        {/* Action Description & Why Recommended */}
        <div style={{ marginBottom: '14px' }}>
          <div style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
            Why This Action is Recommended:
          </div>
          <p style={{ fontSize: '13.5px', color: 'var(--text-primary)', margin: 0, lineHeight: 1.5 }}>
            {safetyConfig.confirmationReason}
          </p>
        </div>

        {/* Potential Consequences Warning Card */}
        <div
          style={{
            padding: '12px 14px',
            backgroundColor: '#FFFBEB',
            borderRadius: '6px',
            border: '1px solid #FDE68A',
            marginBottom: '14px'
          }}
        >
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#B45309', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShieldIcon size={14} />
            <span>Expected Effects & Consequences:</span>
          </div>
          <p style={{ fontSize: '13px', color: '#78350F', margin: 0, lineHeight: 1.45 }}>
            {warningMessage || safetyConfig.potentialConsequences}
          </p>
          {safetyConfig.requiresAdminPrivileges && (
            <div style={{ fontSize: '12px', color: '#B45309', marginTop: '6px', fontWeight: 500 }}>
              • Requires Administrator / Superuser privileges in your terminal.
            </div>
          )}
        </div>

        {/* Recovery / Reversal Guidance */}
        {safetyConfig.recoveryGuidance && (
          <div
            style={{
              padding: '10px 14px',
              backgroundColor: '#F8FAFC',
              borderRadius: '6px',
              border: '1px solid #E2E8F0',
              marginBottom: '20px'
            }}
          >
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '2px' }}>
              Recovery Guidance (if needed):
            </div>
            <p style={{ fontSize: '12.5px', color: 'var(--text-primary)', margin: 0, lineHeight: 1.45 }}>
              {safetyConfig.recoveryGuidance}
            </p>
          </div>
        )}

        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '18px', fontStyle: 'italic' }}>
          Note: NetDoctor never executes terminal commands automatically on your machine. Continuing displays the command instructions for you to review and run in your own terminal.
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button
            type="button"
            className="btn btn-outline"
            onClick={onCancel}
            style={{ padding: '8px 16px' }}
          >
            Cancel (Keep Safe)
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={onConfirm}
            style={{
              backgroundColor: '#D97706',
              borderColor: '#B45309',
              color: '#FFFFFF',
              padding: '8px 18px',
              fontWeight: 600
            }}
          >
            <CheckIcon size={15} />
            <span>Continue Test</span>
          </button>
        </div>
      </div>
    </div>
  );
};
