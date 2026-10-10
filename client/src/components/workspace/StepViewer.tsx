import React from 'react';
import type { DiagnosticStep, OperatingSystem, QuickResultOption } from '../../types/diagnostic';
import { CommandBox } from './CommandBox';
import { ResultSubmission } from './ResultSubmission';
import { GatewayHelper } from './GatewayHelper';
import { VisualGuidance } from './VisualGuidance';
import { HelpCircleIcon, ChevronLeftIcon, ChevronRightIcon, InfoIcon, CheckIcon, ServerIcon, AlertTriangleIcon } from '../common/Icons';
import { useDiagnostic } from '../../context/DiagnosticContext';

interface StepViewerProps {
  step: DiagnosticStep;
  selectedOS: OperatingSystem;
  totalSteps: number;
  onOpenWhy: () => void;
  onSubmitQuickResult: (option: QuickResultOption, clarification?: string) => void;
  onSubmitPastedOutput: (output: string) => void;
  onSubmitScreenshot?: (fileName: string, option: QuickResultOption, userDescription?: string) => void;
  onPreviousStep: () => void;
  onSkipStep: () => void;
  canGoBack: boolean;
  canGoForward: boolean;
  onNextStep: () => void;
  lastInterpretation: string | null;
}

export const StepViewer: React.FC<StepViewerProps> = ({
  step,
  selectedOS,
  totalSteps,
  onOpenWhy,
  onSubmitQuickResult,
  onSubmitPastedOutput,
  onSubmitScreenshot,
  onPreviousStep,
  onSkipStep,
  canGoBack,
  canGoForward,
  onNextStep,
  lastInterpretation
}) => {
  const { discoveredConfig, updateDiscoveredConfig, submissions, roadmap, verifyResolution } = useDiagnostic();

  const osKey = selectedOS === 'other' ? 'windows' : selectedOS;
  let rawInstructions = step.instructions[osKey] || step.instructions.windows;
  let currentCommand = step.command[osKey] || step.command.windows;
  let expectedSummary = step.expectedResult.summary;
  let expectedSample = step.expectedResult.sampleOutput;

  // Requirement 2: Dynamically substitute Default Gateway and IP in command and instructions
  const activeGateway = discoveredConfig.defaultGateway || '192.168.1.1';

  if (step.id === 'step_gateway_ping') {
    currentCommand = currentCommand.replace(/192\.168\.1\.1/g, activeGateway);
    rawInstructions = rawInstructions.map((inst) =>
      inst.replace(/192\.168\.1\.1/g, activeGateway).replace(/192\.168\.0\.1/g, activeGateway)
    );
    expectedSummary = expectedSummary.replace(/192\.168\.1\.1/g, activeGateway);
    expectedSample = expectedSample.replace(/192\.168\.1\.1/g, activeGateway);
  }

  // Get previous pasted submission if user backtracks
  const existingSubmission = submissions[step.id]?.rawInput;

  return (
    <div className="workspace-main">
      {/* Active Step Container Card */}
      <div className="card step-panel">
        <div className="step-header-area">
          <div className="step-title-group">
            <span className="step-number-tag">
              Step {step.stepNumber} of {totalSteps} • {step.category}
            </span>
            <h2 className="step-main-title">{step.title}</h2>
          </div>

          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={onOpenWhy}
            title="Learn why this step is performed"
            style={{ color: 'var(--primary-blue)', borderColor: '#BFDBFE' }}
          >
            <HelpCircleIcon size={15} />
            <span>Why this step?</span>
          </button>
        </div>

        {/* Objective summary highlight bar */}
        <div className="why-highlight-box">
          <div className="why-content">
            <div className="why-heading">
              <InfoIcon size={14} />
              <span>Objective</span>
            </div>
            <p className="why-text">{step.whyNeeded}</p>
          </div>
        </div>

        {/* Visual Guidance Diagram (when step metadata specifies a visual guide) */}
        {step.visualGuidance && (
          <VisualGuidance visual={step.visualGuidance} selectedOS={selectedOS} />
        )}

        {/* Safety Warning Card for Disruptive Actions */}
        {step.safety?.isDisruptive && (
          <div
            style={{
              padding: '12px 16px',
              backgroundColor: '#FFFBEB',
              border: '1px solid #FDE68A',
              borderRadius: '8px',
              marginBottom: '16px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#B45309', fontWeight: 600, fontSize: '13px', marginBottom: '4px' }}>
              <AlertTriangleIcon size={16} />
              <span>Safety Warning: Potentially Disruptive Action</span>
            </div>
            <p style={{ fontSize: '13px', color: '#78350F', margin: '0 0 6px 0', lineHeight: 1.45 }}>
              {step.safety.potentialConsequences}
            </p>
            {step.safety.requiresAdminPrivileges && (
              <div style={{ fontSize: '12px', color: '#92400E', fontWeight: 500 }}>
                • Administrator privileges required in terminal.
              </div>
            )}
            {step.safety.recoveryGuidance && (
              <div style={{ fontSize: '12px', color: '#92400E', marginTop: '4px' }}>
                • Recovery: {step.safety.recoveryGuidance}
              </div>
            )}
          </div>
        )}

        {/* Discovered Configuration Banner (when gateway or IP has been discovered) */}
        {discoveredConfig.ipv4 && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 14px',
            backgroundColor: '#F0FDFA',
            border: '1px solid #CCFBF1',
            borderRadius: '6px',
            marginBottom: '14px',
            fontSize: '12.5px',
            color: 'var(--text-primary)',
            flexWrap: 'wrap',
            gap: '8px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ServerIcon size={15} color="var(--secondary-teal)" />
              <span>
                <b>Discovered Configuration:</b> IP: <code>{discoveredConfig.ipv4}</code>
                {discoveredConfig.defaultGateway && <> • Gateway: <code>{discoveredConfig.defaultGateway}</code></>}
                {discoveredConfig.subnetMask && <> • Subnet: <code>{discoveredConfig.subnetMask}</code></>}
              </span>
            </div>
            <span className="badge badge-teal" style={{ fontSize: '10.5px' }}>Active Session Evidence</span>
          </div>
        )}

        {/* Step-by-Step Instructions */}
        <div className="instructions-box">
          <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>
            Instructions for {selectedOS.toUpperCase()}:
          </h3>
          <ol className="instruction-list">
            {rawInstructions.map((instruction, idx) => (
              <li key={idx} className="instruction-item">
                <span>{instruction}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Default Gateway IP Identification & Helper */}
        {(step.id === 'step_gateway_ping' || step.title.toLowerCase().includes('default gateway')) && (
          <GatewayHelper
            selectedOS={selectedOS}
            activeGateway={discoveredConfig.defaultGateway || ''}
            onUpdateGateway={(gw) => updateDiscoveredConfig({ defaultGateway: gw })}
          />
        )}

        {/* Command Box with Dynamic Command String */}
        <CommandBox command={currentCommand} osName={selectedOS} />

        {/* Expected Result Explanation */}
        <div className="expected-result-box">
          <div className="expected-result-title">
            <InfoIcon size={15} color="var(--primary-blue)" />
            <span>Expected Result:</span>
          </div>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
            {expectedSummary}
          </p>
          <div className="sample-code-box">
            <code style={{ fontSize: '12.5px', color: '#334155' }}>
              {expectedSample}
            </code>
          </div>
        </div>
      </div>

      {/* Interpreted Feedback Notice (when result is submitted) */}
      {lastInterpretation && (() => {
        const currentRoadmapItem = roadmap.find((r) => r.id === step.id);
        const isFailed = currentRoadmapItem?.status === 'FAILED';
        const isUnrecognized = lastInterpretation.toLowerCase().includes('unrecognized');
        const isTerminalNotice = !isUnrecognized && (lastInterpretation.includes('All diagnostic steps in the procedure roadmap have been evaluated') || !canGoForward);

        const borderCol = isUnrecognized
          ? 'var(--color-warning)'
          : isFailed
          ? 'var(--color-error)'
          : 'var(--secondary-teal)';

        const bgCol = isUnrecognized ? '#FFFBEB' : isFailed ? '#FEF2F2' : '#F0FDFA';
        const iconCol = isUnrecognized ? 'var(--color-warning)' : isFailed ? 'var(--color-error)' : 'var(--secondary-teal)';
        const headerTitle = isUnrecognized
          ? 'Input Validation • Unrecognized Command Output'
          : isFailed
          ? 'Diagnostic Finding • Issue Identified'
          : 'Result Interpretation & Diagnostic Findings';

        return (
          <div
            className="card"
            style={{
              borderLeft: `4px solid ${borderCol}`,
              backgroundColor: bgCol
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', flex: 1, minWidth: '240px' }}>
                <div style={{ color: iconCol, marginTop: '2px' }}>
                  {isFailed || isUnrecognized ? <AlertTriangleIcon size={20} /> : <CheckIcon size={20} />}
                </div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: isUnrecognized ? 'var(--color-warning)' : isFailed ? 'var(--color-error)' : 'var(--text-primary)' }}>
                    {headerTitle}
                  </div>
                  <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    {lastInterpretation}
                  </p>
                </div>
              </div>

              {isTerminalNotice && (
                <button
                  type="button"
                  className="btn btn-sm"
                  onClick={() => verifyResolution(true)}
                  style={{
                    backgroundColor: 'var(--color-success)',
                    color: '#FFFFFF',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: 'var(--radius-sm)',
                    fontWeight: 600,
                    fontSize: '13px',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    boxShadow: '0 2px 6px rgba(5, 150, 105, 0.25)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                  title="Conclude diagnosis and view final report"
                >
                  <CheckIcon size={14} />
                  <span>Problem Solved • View Report</span>
                </button>
              )}
            </div>
          </div>
        );
      })()}

      {/* Result Submission Tabs Card (Requirement 1: reset on step change) */}
      <ResultSubmission
        key={step.id}
        stepId={step.id}
        initialOutput={existingSubmission}
        onSubmitQuickResult={onSubmitQuickResult}
        onSubmitPastedOutput={onSubmitPastedOutput}
        onSubmitScreenshot={onSubmitScreenshot}
      />

      {/* Navigation Controls */}
      <div className="step-actions-footer">
        <button
          type="button"
          className="btn btn-outline"
          onClick={onPreviousStep}
          disabled={!canGoBack}
        >
          <ChevronLeftIcon size={16} />
          <span>Previous Step</span>
        </button>

        <div style={{ display: 'flex', gap: '10px' }}>
          {canGoForward && (
            <button
              type="button"
              className="btn btn-ghost"
              onClick={onSkipStep}
              title="Skip this step if already verified"
            >
              <span>Skip Step</span>
            </button>
          )}

          {canGoForward ? (
            <button
              type="button"
              className="btn btn-primary"
              onClick={onNextStep}
            >
              <span>Next Step</span>
              <ChevronRightIcon size={16} />
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => verifyResolution(true)}
              style={{
                backgroundColor: 'var(--color-success)',
                borderColor: 'var(--color-success)',
                color: '#FFFFFF',
                boxShadow: '0 2px 8px rgba(5, 150, 105, 0.3)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                fontWeight: 600
              }}
              title="Conclude diagnosis and verify resolution"
            >
              <CheckIcon size={16} />
              <span>Problem Solved / Finish</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
