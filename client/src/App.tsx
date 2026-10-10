import React from 'react';
import { useDiagnostic } from './context/DiagnosticContext';
import { Header } from './components/common/Header';
import { HomeScreen } from './components/home/HomeScreen';
import { DiagnosticWorkspace } from './components/workspace/DiagnosticWorkspace';
import { ResolutionView } from './components/resolution/ResolutionView';
import { Modal } from './components/common/Modal';

export const AppContent: React.FC = () => {
  const {
    view,
    activeCategory,
    selectedOS,
    steps,
    roadmap,
    currentStepIndex,
    lastInterpretation,
    isStopModalOpen,
    isStartOverModalOpen,
    isDisruptiveModalOpen,
    disruptiveModalWarning,
    identifiedRootCause,
    finalReport,
    resolutionStatus,
    rejectionReason,
    activeFollowUp,
    startDiagnosis,
    answerFollowUp,
    cancelFollowUp,
    clearRejection,
    selectStep,
    nextStep,
    previousStep,
    skipStep,
    submitResult,
    confirmDisruptiveAction,
    cancelDisruptiveAction,
    verifyResolution,
    openStopModal,
    confirmStop,
    openStartOverModal,
    confirmStartOver,
    closeModals,
    navigateToHome
  } = useDiagnostic();

  return (
    <div className="app-container">
      {/* Header */}
      <Header
        currentView={view}
        onBrandClick={navigateToHome}
        onStartOverClick={openStartOverModal}
        categoryName={activeCategory}
      />

      {/* Main Views */}
      <main className="main-content" role="main">
        {view === 'HOME' && (
          <HomeScreen
            onStartDiagnosis={startDiagnosis}
            rejectionReason={rejectionReason}
            activeFollowUp={activeFollowUp}
            onAnswerFollowUp={answerFollowUp}
            onCancelFollowUp={cancelFollowUp}
            onClearRejection={clearRejection}
          />
        )}

        {view === 'WORKSPACE' && (
          <DiagnosticWorkspace
            category={activeCategory}
            selectedOS={selectedOS}
            steps={steps}
            roadmap={roadmap}
            currentStepIndex={currentStepIndex}
            onSelectStep={selectStep}
            onPreviousStep={previousStep}
            onNextStep={nextStep}
            onSkipStep={skipStep}
            onSubmitResult={submitResult}
            onStopDiagnosis={openStopModal}
            onStartOver={openStartOverModal}
            lastInterpretation={lastInterpretation}
          />
        )}

        {view === 'RESOLUTION' && (
          <ResolutionView
            status={resolutionStatus}
            identifiedRootCause={identifiedRootCause}
            finalReport={finalReport}
            onVerifyFixed={verifyResolution}
            onStartNewDiagnosis={openStartOverModal}
            onBackToWorkspace={() => selectStep(steps[0]?.id || 'step_network_adapter')}
          />
        )}
      </main>

      {/* Confirmation Modal: Disruptive Action Safety Check */}
      <Modal
        isOpen={isDisruptiveModalOpen}
        title="Disruptive Diagnostic Action"
        message={
          disruptiveModalWarning ||
          'Running this step will temporarily disconnect your network interface or release IP leases. Do you want to proceed?'
        }
        confirmLabel="Continue Test"
        cancelLabel="Cancel"
        variant="primary"
        iconType="warning"
        onConfirm={confirmDisruptiveAction}
        onCancel={cancelDisruptiveAction}
      />

      {/* Confirmation Modal: Stop Diagnosis */}
      <Modal
        isOpen={isStopModalOpen}
        title="Stop Diagnosis?"
        message="Are you sure you want to exit the current diagnostic session? Any unrecorded test results will be discarded."
        confirmLabel="Stop Diagnosis"
        cancelLabel="Continue Troubleshooting"
        variant="danger"
        iconType="stop"
        onConfirm={confirmStop}
        onCancel={closeModals}
      />

      {/* Confirmation Modal: Start Over / New Diagnosis */}
      <Modal
        isOpen={isStartOverModalOpen}
        title="Start New Diagnosis?"
        message="Starting a new diagnosis will clear your current diagnostic progress and roadmap. Do you want to continue?"
        confirmLabel="Start New Diagnosis"
        cancelLabel="Cancel"
        variant="primary"
        iconType="reset"
        onConfirm={confirmStartOver}
        onCancel={closeModals}
      />
    </div>
  );
};

export default function App() {
  return <AppContent />;
}
