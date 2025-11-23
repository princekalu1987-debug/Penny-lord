export enum Role {
  USER = 'user',
  MODEL = 'model'
}

export interface GroundingChunk {
  web?: {
    uri?: string;
    title?: string;
  };
  maps?: {
    uri?: string;
    title?: string;
    placeId?: string;
  };
}

export interface GroundingMetadata {
  groundingChunks?: GroundingChunk[];
  searchEntryPoint?: {
    renderedContent?: string;
  };
  webSearchQueries?: string[];
}

export interface ChatMessage {
  id: string;
  role: Role;
  text: string;
  timestamp: number;
  isError?: boolean;
  groundingMetadata?: GroundingMetadata;
  // UI specific state
  isStreaming?: boolean;
  // Feedback specific state
  feedbackRating?: number;
  feedbackComment?: string;
  isFeedbackSubmitted?: boolean;
}

export interface GeoLocation {
  latitude: number;
  longitude: number;
}