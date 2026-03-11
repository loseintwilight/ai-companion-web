import React from 'react';

interface LoadingIndicatorProps {
  className?: string;
}

const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({ className = '' }) => {
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-sm">
        <div className="flex items-center space-x-2">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-typing"></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-typing" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-typing" style={{ animationDelay: '0.4s' }}></div>
          </div>
          <span className="text-sm text-gray-500">AI正在思考...</span>
        </div>
      </div>
    </div>
  );
};

export default LoadingIndicator;