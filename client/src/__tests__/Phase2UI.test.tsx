import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../App';
import { DiagnosticProvider } from '../context/DiagnosticContext';

describe('NetDoctor Phase 2 — UI Integration & Validation Flow', () => {
  const renderApp = () => {
    return render(
      <DiagnosticProvider>
        <App />
      </DiagnosticProvider>
    );
  };

  it('rejects non-networking input in the UI without entering the workspace', () => {
    renderApp();

    const textarea = screen.getByLabelText(/Describe your network issue/i);
    fireEvent.change(textarea, { target: { value: 'My Java code has an error when compiling' } });

    const startBtn = screen.getByRole('button', { name: /Start Diagnosis/i });
    fireEvent.click(startBtn);

    // Verify rejection alert appears on the home screen
    expect(screen.getByText('Non-Networking Problem Detected')).toBeInTheDocument();
    expect(screen.getByText(/This problem does not appear to be related to networking/i)).toBeInTheDocument();

    // Verify workspace is NOT entered
    expect(screen.queryByText('Diagnostic Roadmap')).not.toBeInTheDocument();
  });

  it('handles vague query by presenting follow-up question card', () => {
    renderApp();

    const textarea = screen.getByLabelText(/Describe your network issue/i);
    fireEvent.change(textarea, { target: { value: "My internet isn't working" } });

    const startBtn = screen.getByRole('button', { name: /Start Diagnosis/i });
    fireEvent.click(startBtn);

    // Verify follow-up card appears
    expect(screen.getByText('Clarification Needed')).toBeInTheDocument();
    expect(screen.getByText(/Is the problem occurring on only one device or all devices/i)).toBeInTheDocument();

    // Select follow-up option
    const singleDeviceOption = screen.getByText('Only on this device');
    fireEvent.click(singleDeviceOption);

    // Now enters diagnostic workspace
    expect(screen.getByText('Diagnostic Roadmap')).toBeInTheDocument();
  });

  it('accepts typo-containing networking input and proceeds to workspace', () => {
    renderApp();

    const textarea = screen.getByLabelText(/Describe your network issue/i);
    fireEvent.change(textarea, { target: { value: 'wifi keeps disconecting frequently' } });

    const startBtn = screen.getByRole('button', { name: /Start Diagnosis/i });
    fireEvent.click(startBtn);

    // Enters workspace with Wi-Fi connection diagnosis
    expect(screen.getByText('Diagnostic Roadmap')).toBeInTheDocument();
    expect(screen.getAllByText(/Wi-Fi Connection Problems/i).length).toBeGreaterThanOrEqual(1);
  });
});
