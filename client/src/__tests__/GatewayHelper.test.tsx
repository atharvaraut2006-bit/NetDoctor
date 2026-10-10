import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { GatewayHelper } from '../components/workspace/GatewayHelper';

describe('GatewayHelper Component', () => {
  it('renders target gateway input and status badge', () => {
    const handleUpdate = vi.fn();
    render(
      <GatewayHelper
        selectedOS="windows"
        activeGateway="192.168.1.1"
        onUpdateGateway={handleUpdate}
      />
    );

    const input = screen.getByLabelText(/Target Gateway IP:/i) as HTMLInputElement;
    expect(input.value).toBe('192.168.1.1');
    expect(screen.getByText('Configured')).toBeInTheDocument();
  });

  it('allows clicking quick presets to update gateway', () => {
    const handleUpdate = vi.fn();
    render(
      <GatewayHelper
        selectedOS="windows"
        activeGateway=""
        onUpdateGateway={handleUpdate}
      />
    );

    expect(screen.getByText('Defaults to 192.168.1.1')).toBeInTheDocument();

    // Click 192.168.0.1 preset
    const presetBtn = screen.getByRole('button', { name: '192.168.0.1' });
    fireEvent.click(presetBtn);

    expect(handleUpdate).toHaveBeenCalledWith('192.168.0.1');
  });

  it('toggles the gateway helper panel with cross-platform commands', () => {
    const handleUpdate = vi.fn();
    render(
      <GatewayHelper
        selectedOS="windows"
        activeGateway="192.168.1.1"
        onUpdateGateway={handleUpdate}
      />
    );

    // Helper panel starts collapsed
    expect(screen.queryByText('Commands to Identify Your Default Gateway')).not.toBeInTheDocument();

    // Click toggle button
    const toggleBtn = screen.getByRole('button', { name: /Don't know your Gateway\? Find it/i });
    fireEvent.click(toggleBtn);

    // Helper panel opens
    expect(screen.getByText('Commands to Identify Your Default Gateway')).toBeInTheDocument();
    expect(screen.getByText('ipconfig | findstr /i "Gateway"')).toBeInTheDocument();

    // Switch to macOS
    const macPill = screen.getByRole('button', { name: 'macOS' });
    fireEvent.click(macPill);
    expect(screen.getByText('route -n get default | grep gateway')).toBeInTheDocument();

    // Switch to Linux
    const linuxPill = screen.getByRole('button', { name: 'Linux' });
    fireEvent.click(linuxPill);
    expect(screen.getByText('ip route show default')).toBeInTheDocument();
  });

  it('extracts IP from pasted terminal line and updates gateway', () => {
    const handleUpdate = vi.fn();
    render(
      <GatewayHelper
        selectedOS="windows"
        activeGateway=""
        onUpdateGateway={handleUpdate}
      />
    );

    // Open helper
    fireEvent.click(screen.getByRole('button', { name: /Don't know your Gateway\? Find it/i }));

    const pasteInput = screen.getByPlaceholderText(/E.g.,/i);
    fireEvent.change(pasteInput, {
      target: { value: '   Default Gateway . . . . . . . . . : 192.168.1.254' }
    });

    const extractBtn = screen.getByRole('button', { name: /Extract IP/i });
    fireEvent.click(extractBtn);

    expect(handleUpdate).toHaveBeenCalledWith('192.168.1.254');
    expect(screen.getByText(/Extracted and saved: 192.168.1.254/i)).toBeInTheDocument();
  });
});
