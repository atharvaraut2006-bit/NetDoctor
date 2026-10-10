import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../App';
import { DiagnosticProvider } from '../context/DiagnosticContext';


const renderApp = () => {
  return render(
    <DiagnosticProvider>
      <App />
    </DiagnosticProvider>
  );
};

describe('Phase 4 — UI & Interactive Diagnosis Verification', () => {
  it('transitions to Verification Prompt when Root Cause is identified, then generates Final Report on Yes', () => {
    renderApp();

    // 1. Select preset problem "Internet not working"
    fireEvent.click(screen.getByText('Internet not working'));
    expect(screen.getByRole('heading', { level: 2, name: /Check Network Adapter & Physical Connection/i })).toBeInTheDocument();

    // Step 1: Adapter -> Pass
    fireEvent.click(screen.getByText('Command Worked as Expected'));
    fireEvent.click(screen.getByRole('button', { name: /Next Step/i }));

    // Step 2: IP Config -> Pass
    fireEvent.click(screen.getByText('Command Worked as Expected'));
    fireEvent.click(screen.getByRole('button', { name: /Next Step/i }));

    // Step 3: Gateway Ping -> FAIL (100% loss / Unreachable)
    fireEvent.click(screen.getByText('Command Failed / Timed Out'));

    // Verify transition to Verification Prompt view
    expect(screen.getByText('Is your problem fixed?')).toBeInTheDocument();
    expect(screen.getByText('Local Router / Default Gateway Unreachable')).toBeInTheDocument();
    expect(screen.getByText(/Recommended Solution Steps/i)).toBeInTheDocument();

    // Click "Yes, Problem Fixed"
    const yesBtn = screen.getByRole('button', { name: /Yes, Problem Fixed/i });
    fireEvent.click(yesBtn);

    // Verify Final Diagnostic Report is displayed
    expect(screen.getByRole('heading', { level: 1, name: /Final Network Diagnostic Report/i })).toBeInTheDocument();
    expect(screen.getByText('Root Cause')).toBeInTheDocument();
    expect(screen.getByText('What Happened')).toBeInTheDocument();
    expect(screen.getByText('Verified Test Evidence')).toBeInTheDocument();
    expect(screen.getByText('Troubleshooting Steps & Solution Applied')).toBeInTheDocument();
    expect(screen.getByText('Prevention Recommendations')).toBeInTheDocument();
  });

  it('clicking "No, Still Not Working" on verification prompt returns to workspace to continue diagnosis', () => {
    renderApp();

    fireEvent.click(screen.getByText('Internet not working'));
    fireEvent.click(screen.getByText('Command Worked as Expected'));
    fireEvent.click(screen.getByRole('button', { name: /Next Step/i }));
    fireEvent.click(screen.getByText('Command Worked as Expected'));
    fireEvent.click(screen.getByRole('button', { name: /Next Step/i }));

    // Fail gateway ping
    fireEvent.click(screen.getByText('Command Failed / Timed Out'));
    expect(screen.getByText('Is your problem fixed?')).toBeInTheDocument();

    // Click "No, Still Not Working"
    const noBtn = screen.getByRole('button', { name: /No, Still Not Working/i });
    fireEvent.click(noBtn);

    // Workspace should be active again
    expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
    expect(screen.getByText(/Diagnostic Roadmap/i)).toBeInTheDocument();
  });

  it('displays Disruptive Diagnostic Action modal when attempting a disruptive step', () => {
    renderApp();

    // Start with IP & DHCP problem via Natural Language input
    const input = screen.getByLabelText(/Describe your network issue/i);
    fireEvent.change(input, { target: { value: 'My IP configuration is failing with APIPA 169.254' } });
    fireEvent.click(screen.getByRole('button', { name: /Start Diagnosis/i }));


    expect(screen.getByRole('heading', { level: 2, name: /Check Network Adapter/i })).toBeInTheDocument();


    // Step 1: Pass -> Step 2: IP Config
    fireEvent.click(screen.getByText('Command Worked as Expected'));
    fireEvent.click(screen.getByRole('button', { name: /Next Step/i }));

    // Step 2: Pass -> Step 3: Gateway Ping
    fireEvent.click(screen.getByText('Command Worked as Expected'));
    fireEvent.click(screen.getByRole('button', { name: /Next Step/i }));

    // Step 3: Pass -> Step 4: IP Release & Renew (Disruptive)
    fireEvent.click(screen.getByText('Command Worked as Expected'));
    fireEvent.click(screen.getByRole('button', { name: /Next Step/i }));

    expect(screen.getByRole('heading', { level: 2, name: /Release and Renew DHCP IP Lease/i })).toBeInTheDocument();

    // Submit outcome on disruptive step
    fireEvent.click(screen.getByText('Command Worked as Expected'));

    // Verify Disruptive Warning Modal is prompted
    expect(screen.getByRole('heading', { level: 2, name: 'Disruptive Diagnostic Action' })).toBeInTheDocument();
    expect(screen.getByText(/temporarily reset network sockets or release IP configuration/i)).toBeInTheDocument();

    // Confirm disruptive action
    const continueBtn = screen.getByRole('button', { name: /Continue Test/i });
    fireEvent.click(continueBtn);

    // Modal should close and interpretation is processed
    expect(screen.queryByRole('heading', { level: 2, name: 'Disruptive Diagnostic Action' })).not.toBeInTheDocument();
  });
});
