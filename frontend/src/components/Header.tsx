import React from 'react';
import { ChatBubbleLeftRightIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';

const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-4 py-3">
      <div className="flex items-center justify-between">
        {/* 左侧：应用标题和图标 */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg">
            <ChatBubbleLeftRightIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">AI伴侣</h1>
            <p className="text-sm text-gray-500">智能对话助手</p>
          </div>
        </div>
        
        {/* 右侧：设置按钮 */}
        <div className="flex items-center space-x-2">
          <button
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="设置"
          >
            <Cog6ToothIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;