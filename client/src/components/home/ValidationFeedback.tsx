import React from 'react';
import { AlertTriangleIcon, ArrowRightIcon } from '../common/Icons';

interface ValidationFeedbackProps {
  rejectionReason: string;
  onSelectSuggestion?: (text: string) => void;
  onDismiss?: () => void;
}

export const ValidationFeedback: React.FC<ValidationFeedbackProps> = ({
  rejectionReason,
  onSelectSuggestion
}) => {
  const suggestions = [
    'My Wi-Fi keeps disconnecting every few minutes',
    'Internet is connected but websites refuse to load',
    'High ping and latency during gaming or calls',
    'My computer is not receiving an IP address from DHCP'
  ];

  return (
    <div
      className="card"
      style={{
        backgroundColor: 'var(--color-error-bg)',
        borderColor: 'var(--color-error-border)',
        borderLeft: '4px solid var(--color-error)',
        padding: '18px 20px',
        marginBottom: '20px',
        animation: 'fadeIn 0.2s ease-in-out'
      }}
      role="alert"
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
        <div style={{ color: 'var(--color-error)', marginTop: '2px', flexShrink: 0 }}>
          <AlertTriangleIcon size={20} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
          <div>
            <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-error)' }}>
              Non-Networking Problem Detected
            </div>
            <p style={{ fontSize: '14px', color: 'var(--text-primary)', marginTop: '4px', lineHeight: 1.5 }}>
              {rejectionReason}
            </p>
          </div>

          {onSelectSuggestion && (
            <div style={{ marginTop: '6px', paddingTop: '10px', borderTop: '1px solid rgba(220, 38, 38, 0.15)' }}>
              <div style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Try one of these supported networking descriptions:
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {suggestions.map((sug, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => onSelectSuggestion(sug)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '6px 10px',
                      borderRadius: '6px',
                      backgroundColor: 'rgba(255, 255, 255, 0.8)',
                      border: '1px solid var(--color-error-border)',
                      fontSize: '13px',
                      color: 'var(--text-primary)',
                      textAlign: 'left'
                    }}
                    className="btn-ghost"
                  >
                    <span>{sug}</span>
                    <ArrowRightIcon size={14} color="var(--primary-blue)" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
