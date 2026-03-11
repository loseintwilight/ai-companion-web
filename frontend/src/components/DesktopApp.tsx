import React from 'react';

interface DesktopAppProps {
  className?: string;
}

const DesktopApp: React.FC<DesktopAppProps> = ({ className }) => {
  return (
    <div className={`desktop-app ${className || ''}`}>
      <h2>Desktop App</h2>
      <p>桌面模式已启用</p>
    </div>
  );
};

export default DesktopApp;
