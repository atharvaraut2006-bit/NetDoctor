import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../App';
import { DiagnosticProvider } from '../context/DiagnosticContext';

describe('NetDoctor Phase 1 — UI & Project Foundation', () => {
  const renderApp = () => {
    return render(
      <DiagnosticProvider>
        <App />
      </DiagnosticProvider>
    );
  };

  it('renders NetDoctor branding and adheres strictly to no-AI policy', () => {
    renderApp();

    // Verify Master Brand Titles
    expect(screen.getByText('NetDoctor')).toBeInTheDocument();
    expect(screen.getByText('Network Diagnostic System')).toBeInTheDocument();
    expect(screen.getByText("What's wrong with your network?")).toBeInTheDocument();

    // Verify strictly NO AI references exist in the rendered DOM
    const bodyText = document.body.textContent || '';
    expect(bodyText).not.toMatch(/AI-powered/i);
    expect(bodyText).not.toMatch(/AI diagnosis/i);
    expect(bodyText).not.toMatch(/AI assistant/i);
    expect(bodyText).not.toMatch(/Powered by AI/i);
    expect(bodyText).not.toMatch(/Ask AI/i);
    expect(bodyText).not.toMatch(/Confidence:\s*\d+%/i);
    expect(bodyText).not.toMatch(/Probability:\s*0\.\d+/i);
  });

  it('renders OS Selector and 5 common problems presets', () => {
    renderApp();

    // Verify OS Pills (Windows, macOS, Linux only)
    expect(screen.getByRole('radio', { name: 'Windows' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'macOS' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Linux' })).toBeInTheDocument();
    expect(screen.queryByRole('radio', { name: 'Other' })).not.toBeInTheDocument();

    // Verify Common Problems
    expect(screen.getByText('Wi-Fi connected but no internet')).toBeInTheDocument();
    expect(screen.getByText('Internet not working')).toBeInTheDocument();
    expect(screen.getByText('Slow Internet & High Latency')).toBeInTheDocument();
    expect(screen.getByText('DNS / Website resolution failure')).toBeInTheDocument();
    expect(screen.getByText('Frequent Disconnections / Packet Loss')).toBeInTheDocument();
  });

  it('allows starting a diagnostic session from a common problem card', () => {
    renderApp();

    // Click on Wi-Fi preset
    const wifiCard = screen.getByText('Wi-Fi connected but no internet');
    fireEvent.click(wifiCard);

    // Verify Workspace transitions
    expect(screen.getByText('Diagnostic Roadmap')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: /Check Network Adapter & Physical Connection/i })).toBeInTheDocument();
    expect(screen.getByText('Why this step?')).toBeInTheDocument();
  });

  it('demonstrates step navigation, roadmap tracking, and result submissions', () => {
    renderApp();

    // Start with natural language input
    const textarea = screen.getByLabelText(/Describe your network issue/i);
    fireEvent.change(textarea, { target: { value: 'My websites will not load' } });

    const startBtn = screen.getByRole('button', { name: /Start Diagnosis/i });
    fireEvent.click(startBtn);

    // Verify Step 1 is rendered
    expect(screen.getByRole('heading', { level: 2, name: /Check Network Adapter & Physical Connection/i })).toBeInTheDocument();

    // Submit quick outcome
    const successBtn = screen.getByText('Command Worked as Expected');
    fireEvent.click(successBtn);

    // Verify interpretation feedback notice appears
    expect(screen.getByText(/Result Interpretation/i)).toBeInTheDocument();

    // Advance to Step 2
    const nextBtn = screen.getByRole('button', { name: /Next Step/i });
    fireEvent.click(nextBtn);
    expect(screen.getByRole('heading', { level: 2, name: /Check IP Address & DHCP Configuration/i })).toBeInTheDocument();

    // Backtrack to Step 1
    const prevBtn = screen.getByRole('button', { name: /Previous Step/i });
    fireEvent.click(prevBtn);
    expect(screen.getByRole('heading', { level: 2, name: /Check Network Adapter & Physical Connection/i })).toBeInTheDocument();
  });

  it('displays the "Why are we doing this?" modal explanation without losing progress', () => {
    renderApp();

    // Launch workspace
    fireEvent.click(screen.getByText('Internet not working'));

    // Open Why drawer
    const whyBtn = screen.getByRole('button', { name: /Why this step\?/i });
    fireEvent.click(whyBtn);

    // Verify modal contents
    expect(screen.getByText('Why are we performing this step?')).toBeInTheDocument();
    expect(screen.getByText('Diagnostic Purpose')).toBeInTheDocument();
    expect(screen.getByText('Technical Rationale')).toBeInTheDocument();

    // Close modal
    const closeBtn = screen.getByRole('button', { name: /Got it, Return to Diagnosis/i });
    fireEvent.click(closeBtn);

    expect(screen.queryByText('Why are we performing this step?')).not.toBeInTheDocument();
  });

  it('shows confirmation dialogs for Stop Diagnosis and Start Over', () => {
    renderApp();

    // Launch workspace
    fireEvent.click(screen.getByText('Slow Internet & High Latency'));

    // Test Stop Diagnosis
    const stopBtn = screen.getByRole('button', { name: /Stop Diagnosis/i });
    fireEvent.click(stopBtn);
    expect(screen.getByText('Stop Diagnosis?')).toBeInTheDocument();

    // Cancel modal
    fireEvent.click(screen.getByRole('button', { name: 'Continue Troubleshooting' }));
    expect(screen.queryByText('Stop Diagnosis?')).not.toBeInTheDocument();

    // Test Start Over / Reset
    const startOverBtn = screen.getByTitle('Start a new diagnosis');
    fireEvent.click(startOverBtn);
    expect(screen.getByText('Start New Diagnosis?')).toBeInTheDocument();

    // Confirm Start Over -> Returns to Home Screen
    fireEvent.click(screen.getByRole('button', { name: 'Start New Diagnosis' }));
    expect(screen.getByText("What's wrong with your network?")).toBeInTheDocument();
  });
});
