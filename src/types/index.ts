// src/types/index.ts

// Represents the core, static information about a book
export interface Book {
  id: string;
  title: string;
  author: string;
  publisher: string;
  pubYear: string;
  description: string; // The excerpt from the AI
  coverImage: string | null;
}

// Represents the user's log and context for a recommended book
export interface BookLog {
  id: string; // Should match the corresponding Book's id
  userId: string;
  aiSummary: {
    emotion: string; // The topic detected when recommending
    userConcern: string; // The user's message that triggered the recommendation
    recommendationReason: string; // The AI's conversational text when recommending
  };
  userReview: string; // The user's own review, can be empty
  recommendedDate: string;
  lastUpdated: string;
}
