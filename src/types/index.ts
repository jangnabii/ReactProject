// src/types/index.ts

export interface Book {
  id: string;
  title: string;
  author?: string;
  publisher?: string;
  pubYear?: string;
  isbn?: string;
  coverImage?: string | null;
  description?: string;
}

export interface BookLog {
  logId: string;
  bookId: string;
  userId: string; // Assuming a userId will be available later
  aiSummary: {
    emotion: string;
    keywords: string[];
    reason: string;
    quote: string;
  };
  userReview: string;
  createdAt: string;
  updatedAt: string;
}
