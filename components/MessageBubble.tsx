import React, { useState } from 'react';
import { ChatMessage, Role } from '../types';
import GroundingChip from './GroundingChip';
import { User, Sparkles, Star, Check } from 'lucide-react';

interface MessageBubbleProps {
  message: ChatMessage;
  onFeedback?: (messageId: string, rating: number, comment?: string) => void;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, onFeedback }) => {
  const isUser = message.role === Role.USER;
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');

  // Function to process formatting (simple replacement for demo, ideally use a markdown lib)
  const formatText = (text: string) => {
    return text.split('\n').map((line, i) => (
      <React.Fragment key={i}>
        {line}
        <br />
      </React.Fragment>
    ));
  };

  const hasGrounding = message.groundingMetadata?.groundingChunks && message.groundingMetadata.groundingChunks.length > 0;

  const handleRate = (rating: number) => {
    if (message.isFeedbackSubmitted || !onFeedback) return;
    onFeedback(message.id, rating, message.feedbackComment);
  };

  const handleSubmitComment = () => {
    if (!onFeedback) return;
    onFeedback(message.id, message.feedbackRating || 0, comment);
  };

  return (
    <div className={`flex w-full mb-6 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-[85%] md:max-w-[75%] gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        
        {/* Avatar */}
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-1 ${
          isUser ? 'bg-indigo-600' : 'bg-ara-600'
        }`}>
          {isUser ? <User size={16} className="text-white" /> : <Sparkles size={16} className="text-white" />}
        </div>

        {/* Content */}
        <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} w-full`}>
          <div className={`px-4 py-3 rounded-2xl text-sm md:text-base leading-relaxed shadow-md w-full ${
            isUser 
              ? 'bg-indigo-600 text-white rounded-tr-sm' 
              : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-tl-sm'
          }`}>
            {message.isError ? (
              <span className="text-red-300">Error: {message.text}</span>
            ) : (
              formatText(message.text)
            )}
          </div>

          {/* Grounding/Sources Section */}
          {!isUser && hasGrounding && (
            <div className="mt-3 w-full animate-fade-in-up">
              <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider pl-1">Sources & Locations</p>
              <div className="flex flex-wrap gap-2">
                {message.groundingMetadata!.groundingChunks!.map((chunk, index) => (
                  <GroundingChip key={index} chunk={chunk} />
                ))}
              </div>
            </div>
          )}
          
          <div className="flex items-center justify-between w-full mt-1 px-1">
            <span className="text-[10px] text-slate-500">
              {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>

            {/* Feedback UI - Only for Model */}
            {!isUser && !message.isError && onFeedback && (
               <div className="flex flex-col items-end">
                  {!message.isFeedbackSubmitted ? (
                    <div className="flex flex-col items-end gap-2">
                        <div className="flex items-center gap-1">
                            <span className="text-[10px] text-slate-600 mr-1">Rate this answer:</span>
                            {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                className="focus:outline-none transition-transform hover:scale-110"
                                onMouseEnter={() => setHoverRating(star)}
                                onMouseLeave={() => setHoverRating(0)}
                                onClick={() => handleRate(star)}
                            >
                                <Star
                                size={14}
                                className={`transition-colors ${
                                    star <= (hoverRating || message.feedbackRating || 0)
                                    ? 'fill-amber-400 text-amber-400'
                                    : 'text-slate-600'
                                }`}
                                />
                            </button>
                            ))}
                        </div>
                        
                        {/* Comment Input (Visible only if rated but not submitted) */}
                        {message.feedbackRating && message.feedbackRating > 0 && (
                            <div className="flex items-center gap-2 mt-1 animate-fade-in">
                                <input 
                                    type="text" 
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    placeholder="Add a comment (optional)..."
                                    className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-ara-500 w-48"
                                />
                                <button 
                                    onClick={handleSubmitComment}
                                    className="bg-ara-600 hover:bg-ara-500 text-white text-xs px-2 py-1 rounded-lg font-medium transition-colors"
                                >
                                    Submit
                                </button>
                            </div>
                        )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-emerald-400 animate-fade-in">
                        <Check size={12} />
                        <span className="text-[10px] font-medium">Thanks for your feedback!</span>
                    </div>
                  )}
               </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;