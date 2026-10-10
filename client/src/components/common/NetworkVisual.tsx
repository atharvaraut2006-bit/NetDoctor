import React from 'react';
import { LaptopIcon, WifiIcon, ServerIcon, GlobeIcon } from './Icons';

interface NetworkVisualProps {
  activeStage?: 'DEVICE' | 'GATEWAY' | 'DNS' | 'INTERNET' | 'ALL';
}

export const NetworkVisual: React.FC<NetworkVisualProps> = ({ activeStage = 'ALL' }) => {
  return (
    <div className="card" style={{ padding: '18px 24px', backgroundColor: '#FFFFFF' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
        <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Diagnostic Pipeline & Topology
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', padding: '6px 12px' }}>
        {/* Step 1: Device */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', zIndex: 2 }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '8px',
            backgroundColor: activeStage === 'DEVICE' || activeStage === 'ALL' ? 'var(--primary-blue-subtle)' : 'var(--bg-card-subtle)',
            border: `1.5px solid ${activeStage === 'DEVICE' || activeStage === 'ALL' ? 'var(--primary-blue)' : 'var(--color-border)'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: activeStage === 'DEVICE' || activeStage === 'ALL' ? 'var(--primary-blue)' : 'var(--text-muted)'
          }}>
            <LaptopIcon size={20} />
          </div>
          <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-primary)' }}>Your Device</span>
          <span style={{ fontSize: '10.5px', color: 'var(--text-secondary)' }}>Adapter / IP</span>
        </div>

        {/* Connector 1 */}
        <div style={{ flex: 1, height: '2px', backgroundColor: 'var(--color-border)', margin: '0 8px', position: 'relative' }}>
          <div style={{ position: 'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%)', backgroundColor: '#FFFFFF', padding: '0 4px', color: 'var(--text-muted)', fontSize: '11px' }}>
            Local
          </div>
        </div>

        {/* Step 2: Gateway */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', zIndex: 2 }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '8px',
            backgroundColor: activeStage === 'GATEWAY' || activeStage === 'ALL' ? 'var(--primary-blue-subtle)' : 'var(--bg-card-subtle)',
            border: `1.5px solid ${activeStage === 'GATEWAY' || activeStage === 'ALL' ? 'var(--primary-blue)' : 'var(--color-border)'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: activeStage === 'GATEWAY' || activeStage === 'ALL' ? 'var(--primary-blue)' : 'var(--text-muted)'
          }}>
            <WifiIcon size={20} />
          </div>
          <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-primary)' }}>Router / Gateway</span>
          <span style={{ fontSize: '10.5px', color: 'var(--text-secondary)' }}>192.168.1.1</span>
        </div>

        {/* Connector 2 */}
        <div style={{ flex: 1, height: '2px', backgroundColor: 'var(--color-border)', margin: '0 8px', position: 'relative' }}>
          <div style={{ position: 'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%)', backgroundColor: '#FFFFFF', padding: '0 4px', color: 'var(--text-muted)', fontSize: '11px' }}>
            Routing
          </div>
        </div>

        {/* Step 3: DNS */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', zIndex: 2 }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '8px',
            backgroundColor: activeStage === 'DNS' || activeStage === 'ALL' ? 'var(--secondary-teal-subtle)' : 'var(--bg-card-subtle)',
            border: `1.5px solid ${activeStage === 'DNS' || activeStage === 'ALL' ? 'var(--secondary-teal)' : 'var(--color-border)'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: activeStage === 'DNS' || activeStage === 'ALL' ? 'var(--secondary-teal)' : 'var(--text-muted)'
          }}>
            <ServerIcon size={20} />
          </div>
          <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-primary)' }}>DNS Resolver</span>
          <span style={{ fontSize: '10.5px', color: 'var(--text-secondary)' }}>Domain Lookup</span>
        </div>

        {/* Connector 3 */}
        <div style={{ flex: 1, height: '2px', backgroundColor: 'var(--color-border)', margin: '0 8px', position: 'relative' }}>
          <div style={{ position: 'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%)', backgroundColor: '#FFFFFF', padding: '0 4px', color: 'var(--text-muted)', fontSize: '11px' }}>
            WAN
          </div>
        </div>

        {/* Step 4: Internet */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', zIndex: 2 }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '8px',
            backgroundColor: activeStage === 'INTERNET' || activeStage === 'ALL' ? 'var(--primary-blue-subtle)' : 'var(--bg-card-subtle)',
            border: `1.5px solid ${activeStage === 'INTERNET' || activeStage === 'ALL' ? 'var(--primary-blue)' : 'var(--color-border)'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: activeStage === 'INTERNET' || activeStage === 'ALL' ? 'var(--primary-blue)' : 'var(--text-muted)'
          }}>
            <GlobeIcon size={20} />
          </div>
          <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-primary)' }}>Internet (WAN)</span>
          <span style={{ fontSize: '10.5px', color: 'var(--text-secondary)' }}>Global Access</span>
        </div>
      </div>
    </div>
  );
};
