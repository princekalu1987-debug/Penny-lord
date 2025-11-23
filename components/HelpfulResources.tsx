import React from 'react';
import { Book, FileText, Users, X, ExternalLink } from 'lucide-react';

interface HelpfulResourcesProps {
  isOpen: boolean;
  onClose: () => void;
}

const resources = [
  {
    category: "Official Documentation",
    icon: <Book size={20} className="text-ara-500" />,
    items: [
      { title: "Gemini API Overview", url: "https://ai.google.dev/gemini-api/docs" },
      { title: "Prompt Engineering Guide", url: "https://ai.google.dev/gemini-api/docs/prompt-design-strategies" },
      { title: "Safety Settings", url: "https://ai.google.dev/gemini-api/docs/safety-settings" }
    ]
  },
  {
    category: "User Guides",
    icon: <FileText size={20} className="text-emerald-500" />,
    items: [
      { title: "Getting Started with A.R.A.", url: "#" },
      { title: "Using Location Features", url: "#" },
      { title: "Understanding Search Results", url: "#" }
    ]
  },
  {
    category: "Community Forums",
    icon: <Users size={20} className="text-amber-500" />,
    items: [
      { title: "Google AI Developer Forum", url: "https://discuss.ai.google.dev/" },
      { title: "A.R.A. User Community", url: "#" },
      { title: "Feature Requests", url: "#" }
    ]
  }
];

const HelpfulResources: React.FC<HelpfulResourcesProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <div>
            <h2 className="text-xl font-bold text-white">Helpful Resources</h2>
            <p className="text-sm text-slate-400 mt-1">Guides, documentation, and community.</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 bg-slate-800 hover:bg-slate-700 rounded-full text-slate-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-6 space-y-8">
          {resources.map((section, idx) => (
            <div key={idx}>
              <div className="flex items-center gap-2 mb-4">
                {section.icon}
                <h3 className="font-semibold text-slate-200">{section.category}</h3>
              </div>
              <div className="grid gap-3">
                {section.items.map((item, itemIdx) => (
                  <a 
                    key={itemIdx}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-4 bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 hover:border-slate-600 rounded-xl transition-all group"
                  >
                    <span className="text-sm text-slate-300 font-medium group-hover:text-white transition-colors">
                      {item.title}
                    </span>
                    <ExternalLink size={14} className="text-slate-500 group-hover:text-ara-400" />
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/50 rounded-b-2xl">
            <button 
                onClick={onClose}
                className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-xl transition-colors"
            >
                Close
            </button>
        </div>
      </div>
    </div>
  );
};

export default HelpfulResources;