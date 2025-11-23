import React from 'react';

const ThinkingIndicator: React.FC = () => {
  return (
    <div className="flex items-center space-x-2 p-4 rounded-2xl bg-slate-800/50 w-fit animate-pulse border border-slate-700">
      <div className="w-2 h-2 bg-ara-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
      <div className="w-2 h-2 bg-ara-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
      <div className="w-2 h-2 bg-ara-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
      <span className="text-xs text-slate-400 font-medium ml-2">A.R.A. is thinking...</span>
    </div>
  );
};

export default ThinkingIndicator;