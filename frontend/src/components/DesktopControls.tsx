import React from 'react';

interface DesktopControlsProps {
  visible: boolean;
  onToggle: () => void;
}

const DesktopControls: React.FC<DesktopControlsProps> = ({ visible, onToggle }) => {
  if (!visible) {
    return (
      <button
        onClick={onToggle}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          padding: '10px 20px',
          background: 'rgba(0, 0, 0, 0.5)',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          zIndex: 1000
        }}
      >
        ☰
      </button>
    );
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        padding: '20px',
        background: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
        zIndex: 1000,
        minWidth: '200px'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
        <h3 style={{ margin: 0 }}>控制面板</h3>
        <button onClick={onToggle} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '18px' }}>
          ✕
        </button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <button style={buttonStyle}>调整大小</button>
        <button style={buttonStyle}>切换模型</button>
        <button style={buttonStyle}>设置</button>
      </div>
    </div>
  );
};

const buttonStyle: React.CSSProperties = {
  padding: '10px 15px',
  background: '#4F46E5',
  color: 'white',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  transition: 'background 0.2s'
};

export default DesktopControls;
