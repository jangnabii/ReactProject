// src/types/index.ts

export interface Book {
  bookId: string;
  title: string;
  author: string;
  coverImageUrl: string;
  isbn?: string;
  publisher?: string;
  addedAt: string;
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
