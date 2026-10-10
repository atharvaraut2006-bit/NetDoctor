import React from 'react';
import type { VisualGuidanceConfig } from '../../knowledge/types';
import type { OperatingSystem } from '../../types/diagnostic';
import { LaptopIcon, WifiIcon, ServerIcon, GlobeIcon, ArrowRightIcon, InfoIcon } from '../common/Icons';

interface VisualGuidanceProps {
  visual: VisualGuidanceConfig;
  selectedOS?: OperatingSystem;
}

export const VisualGuidance: React.FC<VisualGuidanceProps> = ({ visual, selectedOS = 'windows' }) => {
  return (
    <div
      className="card"
      style={{
        backgroundColor: '#F8FAFC',
        border: '1px solid #E2E8F0',
        borderRadius: '8px',
        padding: '16px 20px',
        marginBottom: '16px'
      }}
      role="region"
      aria-label={`Visual Network Guide: ${visual.title}`}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: 'var(--primary-blue)', display: 'flex', alignItems: 'center' }}>
            <InfoIcon size={16} />
          </span>
          <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
            {visual.title}
          </h4>
        </div>
        <span className="badge badge-blue" style={{ fontSize: '11px', textTransform: 'uppercase' }}>
          Visual Guide
        </span>
      </div>

      <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '14px', lineHeight: 1.5 }}>
        {visual.description}
      </p>

      {/* Render Diagram Based on Visual Type */}
      {visual.type === 'gateway_path' && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-around',
            backgroundColor: '#FFFFFF',
            padding: '14px',
            borderRadius: '6px',
            border: '1px solid #E2E8F0',
            flexWrap: 'wrap',
            gap: '12px'
          }}
          aria-label={visual.altText}
        >
          {/* Node 1: Computer */}
          <div style={{ textAlign: 'center', minWidth: '90px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '8px', backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 6px auto', color: 'var(--primary-blue)' }}>
              <LaptopIcon size={20} />
            </div>
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>Your Device</div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Local Host</div>
          </div>

          {/* Segment 1 Arrow: Local Link */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '80px' }}>
            <span style={{ fontSize: '11px', color: 'var(--secondary-teal)', fontWeight: 600, marginBottom: '2px' }}>
              Local Wi-Fi / Cable
            </span>
            <div style={{ display: 'flex', alignItems: 'center', color: 'var(--secondary-teal)' }}>
              <div style={{ width: '40px', height: '2px', backgroundColor: 'var(--secondary-teal)' }} />
              <ArrowRightIcon size={14} />
            </div>
            <span style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Active Test Target
            </span>
          </div>

          {/* Node 2: Gateway Router */}
          <div style={{ textAlign: 'center', minWidth: '90px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '8px', backgroundColor: '#F0FDFA', border: '1px solid #99F6E4', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 6px auto', color: 'var(--secondary-teal)' }}>
              <WifiIcon size={20} />
            </div>
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>Default Gateway</div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Local Router</div>
          </div>

          {/* Segment 2 Arrow: WAN Route */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '80px' }}>
            <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 500, marginBottom: '2px' }}>
              ISP Broadband (WAN)
            </span>
            <div style={{ display: 'flex', alignItems: 'center', color: '#94A3B8' }}>
              <div style={{ width: '40px', height: '2px', backgroundColor: '#CBD5E1' }} />
              <ArrowRightIcon size={14} />
            </div>
            <span style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: '2px' }}>
              External Link
            </span>
          </div>

          {/* Node 3: Internet */}
          <div style={{ textAlign: 'center', minWidth: '90px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '8px', backgroundColor: '#FAF5FF', border: '1px solid #E9D5FF', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 6px auto', color: '#7C3AED' }}>
              <GlobeIcon size={20} />
            </div>
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>Public Internet</div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Global WAN</div>
          </div>
        </div>
      )}

      {visual.type === 'dns_flow' && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-around',
            backgroundColor: '#FFFFFF',
            padding: '14px',
            borderRadius: '6px',
            border: '1px solid #E2E8F0',
            flexWrap: 'wrap',
            gap: '12px'
          }}
          aria-label={visual.altText}
        >
          {/* Step 1: Domain Name */}
          <div style={{ textAlign: 'center', minWidth: '90px' }}>
            <div style={{ padding: '6px 10px', backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '6px', fontSize: '12px', fontFamily: 'monospace', color: 'var(--primary-blue)', marginBottom: '6px' }}>
              google.com
            </div>
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>1. Domain Name</div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>User Query</div>
          </div>

          <div style={{ color: 'var(--primary-blue)', display: 'flex', alignItems: 'center' }}>
            <ArrowRightIcon size={16} />
          </div>

          {/* Step 2: DNS Resolver */}
          <div style={{ textAlign: 'center', minWidth: '90px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '8px', backgroundColor: '#F0FDFA', border: '1px solid #99F6E4', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 6px auto', color: 'var(--secondary-teal)' }}>
              <ServerIcon size={20} />
            </div>
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>2. DNS Server</div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Translates Name</div>
          </div>

          <div style={{ color: 'var(--secondary-teal)', display: 'flex', alignItems: 'center' }}>
            <ArrowRightIcon size={16} />
          </div>

          {/* Step 3: IP Address */}
          <div style={{ textAlign: 'center', minWidth: '90px' }}>
            <div style={{ padding: '6px 10px', backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '6px', fontSize: '12px', fontFamily: 'monospace', color: '#16A34A', marginBottom: '6px' }}>
              142.250.190.46
            </div>
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>3. Numerical IP</div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Routable Address</div>
          </div>

          <div style={{ color: '#16A34A', display: 'flex', alignItems: 'center' }}>
            <ArrowRightIcon size={16} />
          </div>

          {/* Step 4: Web Server */}
          <div style={{ textAlign: 'center', minWidth: '90px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '8px', backgroundColor: '#FAF5FF', border: '1px solid #E9D5FF', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 6px auto', color: '#7C3AED' }}>
              <GlobeIcon size={20} />
            </div>
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>4. Destination</div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Loads Page</div>
          </div>
        </div>
      )}

      {visual.type === 'packet_loss_comparison' && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            backgroundColor: '#FFFFFF',
            padding: '14px',
            borderRadius: '6px',
            border: '1px solid #E2E8F0'
          }}
          aria-label={visual.altText}
        >
          {/* Track A */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', backgroundColor: '#F8FAFC', borderRadius: '6px', border: '1px solid #E2E8F0', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <LaptopIcon size={16} color="var(--primary-blue)" />
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>Local Track:</span>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Computer ➔ Local Gateway Router (192.168.1.1)</span>
            </div>
            <span style={{ fontSize: '11.5px', color: 'var(--color-success)', fontWeight: 600 }}>
              Expected: &lt;5ms Latency • 0% Packet Loss
            </span>
          </div>

          {/* Track B */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', backgroundColor: '#F8FAFC', borderRadius: '6px', border: '1px solid #E2E8F0', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <GlobeIcon size={16} color="#7C3AED" />
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>External Track:</span>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Computer ➔ Public Internet Server (8.8.8.8)</span>
            </div>
            <span style={{ fontSize: '11.5px', color: 'var(--primary-blue)', fontWeight: 600 }}>
              Expected: &lt;50ms Latency • Steady Response
            </span>
          </div>

          <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)', fontStyle: 'italic', marginTop: '2px' }}>
            Diagnostic Rule: If the Local Track passes (0% loss) while the External Track fails or spikes, the fault is located at your ISP or upstream transit lines, not your local router or Wi-Fi.
          </div>
        </div>
      )}

      {visual.type === 'device_connection' && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-around',
            backgroundColor: '#FFFFFF',
            padding: '14px',
            borderRadius: '6px',
            border: '1px solid #E2E8F0',
            flexWrap: 'wrap',
            gap: '12px'
          }}
          aria-label={visual.altText}
        >
          {/* Interface Card */}
          <div style={{ textAlign: 'center', minWidth: '110px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '8px', backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 6px auto', color: 'var(--primary-blue)' }}>
              <LaptopIcon size={20} />
            </div>
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>Network Adapter</div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Wi-Fi / Ethernet NIC</div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '100px' }}>
            <span style={{ fontSize: '11px', color: 'var(--secondary-teal)', fontWeight: 600 }}>
              Layer 1 Physical Link
            </span>
            <div style={{ display: 'flex', alignItems: 'center', color: 'var(--secondary-teal)', margin: '4px 0' }}>
              <div style={{ width: '50px', height: '2px', backgroundColor: 'var(--secondary-teal)' }} />
              <ArrowRightIcon size={14} />
            </div>
            <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>
              Status: Connected / Enabled
            </span>
          </div>

          {/* Access Point */}
          <div style={{ textAlign: 'center', minWidth: '110px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '8px', backgroundColor: '#F0FDFA', border: '1px solid #99F6E4', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 6px auto', color: 'var(--secondary-teal)' }}>
              <WifiIcon size={20} />
            </div>
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>Access Point / Switch</div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Wireless Radio / LAN Port</div>
          </div>
        </div>
      )}

      {visual.type === 'terminal_guide' && (
        <div
          style={{
            backgroundColor: '#FFFFFF',
            padding: '12px 16px',
            borderRadius: '6px',
            border: '1px solid #E2E8F0',
            fontSize: '12.5px',
            color: 'var(--text-primary)'
          }}
          aria-label={visual.altText}
        >
          <div style={{ fontWeight: 600, marginBottom: '6px', color: 'var(--primary-blue)' }}>
            Quick Terminal Access ({selectedOS.toUpperCase()}):
          </div>
          {selectedOS === 'windows' && (
            <div>Press <b>Windows Key + R</b>, type <code>cmd</code>, right-click and select <b>"Run as administrator"</b>.</div>
          )}
          {selectedOS === 'macos' && (
            <div>Press <b>Command + Space</b>, type <code>Terminal</code>, and press <b>Return</b>.</div>
          )}
          {selectedOS === 'linux' && (
            <div>Press <b>Ctrl + Alt + T</b> to open your default terminal emulator.</div>
          )}
          {selectedOS === 'other' && (
            <div>Open your system command-line interface or shell window.</div>
          )}
        </div>
      )}
    </div>
  );
};
