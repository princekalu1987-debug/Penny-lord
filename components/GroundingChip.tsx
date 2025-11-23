import React from 'react';
import { GroundingChunk } from '../types';
import { MapPin, Globe, ExternalLink } from 'lucide-react';

interface GroundingChipProps {
  chunk: GroundingChunk;
}

const GroundingChip: React.FC<GroundingChipProps> = ({ chunk }) => {
  // Handle Google Maps Grounding
  if (chunk.maps) {
    return (
      <a 
        href={chunk.maps.uri} 
        target="_blank" 
        rel="noopener noreferrer"
        className="flex items-center gap-3 p-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-all group w-full sm:w-auto"
      >
        <div className="bg-red-500/20 p-2 rounded-full text-red-400">
          <MapPin size={18} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white truncate">{chunk.maps.title || "Location"}</p>
          <p className="text-xs text-slate-400">View on Google Maps</p>
        </div>
        <ExternalLink size={14} className="text-slate-500 group-hover:text-white transition-colors" />
      </a>
    );
  }

  // Handle Web Grounding (Search Results)
  if (chunk.web) {
    return (
      <a 
        href={chunk.web.uri} 
        target="_blank" 
        rel="noopener noreferrer"
        className="flex items-center gap-3 p-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-all group w-full sm:w-auto"
      >
        <div className="bg-blue-500/20 p-2 rounded-full text-blue-400">
          <Globe size={18} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white truncate">{chunk.web.title || "Web Result"}</p>
          <p className="text-xs text-slate-400 truncate">{chunk.web.uri}</p>
        </div>
        <ExternalLink size={14} className="text-slate-500 group-hover:text-white transition-colors" />
      </a>
    );
  }

  return null;
};

export default GroundingChip;