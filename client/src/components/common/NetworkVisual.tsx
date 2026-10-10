import React from 'react';
import { LaptopIcon, WifiIcon, ServerIcon, GlobeIcon } from './Icons';

interface NetworkVisualProps {
  activeStage?: 'DEVICE' | 'GATEWAY' | 'DNS' | 'INTERNET' | 'ALL';
}

export const NetworkVisual: React.FC<NetworkVisualProps> = ({ activeStage = 'ALL' }) => {
  const stages = [
    {
      id: 'DEVICE' as const,
      layer: 'Layer 1–2',
      name: 'Local Interface',
      subtext: 'Adapter, Link & IP',
      icon: <LaptopIcon size={20} />,
      colorClass: 'node-blue',
      badge: 'L1/L2'
    },
    {
      id: 'GATEWAY' as const,
      layer: 'Layer 3',
      name: 'Router Gateway',
      subtext: 'Default Gateway & ARP',
      icon: <WifiIcon size={20} />,
      colorClass: 'node-teal',
      badge: 'L3 Subnet'
    },
    {
      id: 'DNS' as const,
      layer: 'Layer 7',
      name: 'DNS Resolver',
      subtext: 'Domain Translation',
      icon: <ServerIcon size={20} />,
      colorClass: 'node-indigo',
      badge: 'L7 Name'
    },
    {
      id: 'INTERNET' as const,
      layer: 'WAN',
      name: 'Public Internet',
      subtext: 'WAN Route & Latency',
      icon: <GlobeIcon size={20} />,
      colorClass: 'node-purple',
      badge: 'Global WAN'
    }
  ];

  return (
    <div className="card pipeline-card">
      <div className="pipeline-header">
        <div>
          <span className="pipeline-tag">Diagnostic Verification Architecture</span>
          <h3 className="pipeline-title">Structured 4-Stage OSI Isolation</h3>
        </div>
        <div className="pipeline-status-indicator">
          <span className="pipeline-pulse-dot" aria-hidden="true" />
          <span>Sequential Verification Path</span>
        </div>
      </div>

      <div className="pipeline-flow">
        {stages.map((stage, idx) => {
          const isActive = activeStage === 'ALL' || activeStage === stage.id;
          return (
            <React.Fragment key={stage.id}>
              <div className={`pipeline-node ${isActive ? 'active' : ''} ${stage.colorClass}`}>
                <div className="node-icon-wrapper" aria-hidden="true">
                  {stage.icon}
                  <span className="node-badge">{stage.badge}</span>
                </div>
                <div className="node-info">
                  <span className="node-layer">{stage.layer}</span>
                  <span className="node-name">{stage.name}</span>
                  <span className="node-subtext">{stage.subtext}</span>
                </div>
              </div>

              {idx < stages.length - 1 && (
                <div className="pipeline-connector" aria-hidden="true">
                  <div className="connector-line">
                    <span className="connector-dot" />
                  </div>
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
