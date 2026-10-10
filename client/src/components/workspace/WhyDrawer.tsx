import React from 'react';
import type { DiagnosticStep } from '../../types/diagnostic';
import { HelpCircleIcon, XIcon, InfoIcon } from '../common/Icons';

interface WhyDrawerProps {
  step: DiagnosticStep;
  isOpen: boolean;
  onClose: () => void;
}

export const WhyDrawer: React.FC<WhyDrawerProps> = ({ step, isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-card drawer-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ color: 'var(--primary-blue)', display: 'flex' }}>
              <HelpCircleIcon size={20} />
            </div>
            <span className="modal-title">Why are we performing this step?</span>
          </div>
          <button type="button" className="btn btn-ghost btn-sm" onClick={onClose} aria-label="Close why dialog">
            <XIcon size={18} />
          </button>
        </div>

        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <span className="step-number-tag">Step {step.stepNumber} • {step.category}</span>
            <h3 style={{ fontSize: '18px', marginTop: '4px', color: 'var(--text-primary)' }}>{step.title}</h3>
          </div>

          <div style={{ padding: '14px', borderRadius: '8px', backgroundColor: 'var(--primary-blue-subtle)', border: '1px solid #BFDBFE' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: 'var(--primary-blue)', marginBottom: '4px' }}>
              <InfoIcon size={15} />
              <span>Diagnostic Purpose</span>
            </div>
            <p style={{ fontSize: '14.5px', color: 'var(--text-primary)', lineHeight: 1.5 }}>
              {step.whyNeeded}
            </p>
          </div>

          <div>
            <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
              Technical Rationale
            </h4>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
              {step.detailedWhy}
            </p>
          </div>

          <div style={{ padding: '12px', borderRadius: '8px', backgroundColor: '#F8FAFC', border: '1px solid var(--color-border)', fontSize: '13px', color: 'var(--text-secondary)' }}>
            <strong>Evidence Isolation:</strong> NetDoctor isolates one network layer at a time to prevent unnecessary router resets or risky configuration adjustments.
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-primary" onClick={onClose}>
            Got it, Return to Diagnosis
          </button>
        </div>
      </div>
    </div>
  );
};
