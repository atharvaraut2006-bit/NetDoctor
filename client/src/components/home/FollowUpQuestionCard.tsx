import React from 'react';
import type { FollowUpOption, FollowUpQuestion } from '../../engine/types';
import { HelpCircleIcon, InfoIcon, ArrowRightIcon } from '../common/Icons';

interface FollowUpQuestionCardProps {
  question: FollowUpQuestion;
  onSelectOption: (option: FollowUpOption) => void;
  onCancel: () => void;
  originalDescription: string;
}

export const FollowUpQuestionCard: React.FC<FollowUpQuestionCardProps> = ({
  question,
  onSelectOption,
  onCancel,
  originalDescription
}) => {
  return (
    <div
      className="card"
      style={{
        borderLeft: '4px solid var(--primary-blue)',
        backgroundColor: '#FFFFFF',
        padding: '24px',
        animation: 'fadeIn 0.25s ease-in-out'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div className="badge badge-blue">
          <HelpCircleIcon size={13} />
          <span>Clarification Needed</span>
        </div>
        <button type="button" className="btn btn-ghost btn-sm" onClick={onCancel} style={{ fontSize: '13px' }}>
          Cancel & Rephrase
        </button>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
          Regarding your issue: <em>"{originalDescription}"</em>
        </div>
        <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.35 }}>
          {question.question}
        </h3>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', borderRadius: '6px', backgroundColor: 'var(--bg-card-subtle)', border: '1px solid var(--color-border)', marginBottom: '18px' }}>
        <InfoIcon size={15} color="var(--primary-blue)" style={{ flexShrink: 0 }} />
        <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
          {question.whyNeeded}
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {question.options.map((option) => (
          <button
            key={option.id}
            type="button"
            className="problem-card"
            onClick={() => onSelectOption(option)}
            style={{
              padding: '14px 16px',
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              textAlign: 'left',
              gap: '12px'
            }}
          >
            <div>
              <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>
                {option.label}
              </div>
              {option.description && (
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  {option.description}
                </div>
              )}
            </div>
            <ArrowRightIcon size={16} color="var(--primary-blue)" />
          </button>
        ))}
      </div>
    </div>
  );
};
