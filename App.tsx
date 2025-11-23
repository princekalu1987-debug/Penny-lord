import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Mic, MicOff, MapPin, Square, Info } from 'lucide-react';
import { sendMessageToGemini } from './services/geminiService';
import { ChatMessage, Role, GeoLocation } from './types';
import MessageBubble from './components/MessageBubble';
import ThinkingIndicator from './components/ThinkingIndicator';
import HelpfulResources from './components/HelpfulResources';
import { APP_NAME } from './constants';

// Declare global for SpeechRecognition
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

const App: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [location, setLocation] = useState<GeoLocation | undefined>(undefined);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [isResourcesOpen, setIsResourcesOpen] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Scroll to bottom effect
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  // Initial Greeting
  useEffect(() => {
    setMessages([{
      id: 'init-1',
      role: Role.MODEL,
      text: "Hello! I'm A.R.A. I can help you find places, look up information, and answer your questions. How can I help you today?",
      timestamp: Date.now()
    }]);
    
    // Attempt to get location quietly on load, or let user trigger it later
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude
        });
      },
      (err) => {
        console.log("Location auto-fetch failed (expected if permission not granted yet):", err.message);
      }
    );
  }, []);

  // Initialize Speech Recognition
  useEffect(() => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result) => result.transcript)
          .join('');
        setInputValue(transcript);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
      };
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) return;
    
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      setInputValue('');
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const requestLocation = () => {
    setLocationError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude
        });
      },
      (err) => {
        setLocationError("Permission denied.");
        setTimeout(() => setLocationError(null), 3000);
      }
    );
  };

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userText = inputValue.trim();
    setInputValue('');
    
    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: Role.USER,
      text: userText,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsThinking(true);

    try {
      const response = await sendMessageToGemini(messages, userText, location);
      
      const modelText = response.text || "I'm sorry, I couldn't generate a response.";
      const metadata = response.candidates?.[0]?.groundingMetadata;

      const modelMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: Role.MODEL,
        text: modelText,
        timestamp: Date.now(),
        groundingMetadata: metadata
      };

      setMessages(prev => [...prev, modelMessage]);
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: Role.MODEL,
        text: "I encountered an error connecting to my services. Please try again.",
        timestamp: Date.now(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsThinking(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Handle rating and feedback
  const handleFeedback = (messageId: string, rating: number, comment?: string) => {
    setMessages(prev => prev.map(msg => {
      if (msg.id === messageId) {
        return {
          ...msg,
          feedbackRating: rating,
          feedbackComment: comment,
          isFeedbackSubmitted: comment !== undefined // If comment is passed (even empty), mark submitted
        };
      }
      return msg;
    }));
    
    // In a real app, you would send this to your backend here
    if (comment !== undefined) {
        console.log(`Feedback collected for msg ${messageId}: ${rating} stars, Comment: ${comment}`);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-900 text-slate-100 overflow-hidden font-sans">
      
      {/* Resources Modal */}
      <HelpfulResources isOpen={isResourcesOpen} onClose={() => setIsResourcesOpen(false)} />

      {/* Header */}
      <header className="flex-shrink-0 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 p-4 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
             <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-ara-500 to-ara-accent flex items-center justify-center">
                <span className="font-bold text-white text-lg">A</span>
             </div>
             <div>
               <h1 className="font-bold text-lg tracking-tight">{APP_NAME}</h1>
               <p className="text-[10px] text-slate-400 uppercase tracking-widest">Augmented Responsive Assistant</p>
             </div>
          </div>
          
          <div className="flex items-center gap-2">
             <button 
               onClick={requestLocation}
               className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                 location 
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                  : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'
               }`}
             >
               <MapPin size={12} />
               {location ? "Location Active" : "Enable Location"}
             </button>
             {locationError && (
               <span className="text-red-400 text-xs animate-pulse">{locationError}</span>
             )}
             
             <button
               onClick={() => setIsResourcesOpen(true)}
               className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-full transition-colors border border-slate-700"
               title="Help & Resources"
             >
                <Info size={16} />
             </button>
          </div>
        </div>
      </header>

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto p-4 md:p-6 scroll-smooth">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.map((msg) => (
            <MessageBubble 
              key={msg.id} 
              message={msg} 
              onFeedback={handleFeedback}
            />
          ))}
          {isThinking && <ThinkingIndicator />}
          <div ref={messagesEndRef} className="h-4" />
        </div>
      </main>

      {/* Input Area */}
      <footer className="flex-shrink-0 bg-slate-900 border-t border-slate-800 p-4 md:p-6 pb-8 md:pb-8">
        <div className="max-w-4xl mx-auto relative">
          <div className="relative flex items-center bg-slate-800/50 border border-slate-700 rounded-2xl shadow-lg ring-1 ring-white/5 focus-within:ring-ara-500/50 focus-within:border-ara-500/50 transition-all overflow-hidden">
            
            {/* Mic Button */}
            <button 
              onClick={toggleListening}
              className={`p-4 transition-colors ${isListening ? 'text-red-400 animate-pulse' : 'text-slate-400 hover:text-white'}`}
              title={isListening ? "Stop Listening" : "Start Listening"}
            >
              {isListening ? <Square size={20} fill="currentColor" /> : <Mic size={20} />}
            </button>

            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask A.R.A. anything..."
              className="flex-1 bg-transparent text-slate-100 placeholder-slate-500 p-4 outline-none resize-none h-[56px] leading-[24px]"
              rows={1}
            />

            <button
              onClick={handleSend}
              disabled={!inputValue.trim() || isThinking}
              className={`p-4 transition-all ${
                inputValue.trim() && !isThinking
                  ? 'text-ara-500 hover:text-ara-400' 
                  : 'text-slate-600 cursor-not-allowed'
              }`}
            >
              <Send size={20} />
            </button>
          </div>
          <p className="text-center text-xs text-slate-600 mt-3">
            Powered by Gemini 2.5 Flash. A.R.A. may use your location for accurate info.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;