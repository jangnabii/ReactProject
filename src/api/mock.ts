// src/api/mock.ts
import { Book, BookLog } from '../types';

const MOCK_BOOKS: Book[] = [
  {
    bookId: '1',
    title: '어린 왕자',
    author: '앙투안 드 생텍쥐페리',
    coverImageUrl: 'https://via.placeholder.com/150/FFC0CB/000000?Text=The+Little+Prince',
    addedAt: '2025-11-20T10:00:00Z',
  },
  {
    bookId: '2',
    title: '데미안',
    author: '헤르만 헤세',
    coverImageUrl: 'https://via.placeholder.com/150/ADD8E6/000000?Text=Demian',
    addedAt: '2025-11-18T15:30:00Z',
  },
  {
    bookId: '3',
    title: '연금술사',
    author: '파울로 코엘료',
    coverImageUrl: 'https://via.placeholder.com/150/90EE90/000000?Text=The+Alchemist',
    addedAt: '2025-11-15T11:45:00Z',
  },
  {
    bookId: '4',
    title: '노인과 바다',
    author: '어니스트 헤밍웨이',
    coverImageUrl: 'https://via.placeholder.com/150/D3D3D3/000000?Text=Old+Man+and+the+Sea',
    addedAt: '2025-11-12T09:00:00Z',
  },
  {
    bookId: '5',
    title: '1984',
    author: '조지 오웰',
    coverImageUrl: 'https://via.placeholder.com/150/FFA07A/000000?Text=1984',
    addedAt: '2025-11-10T14:20:00Z',
  },
];

const MOCK_LOGS: BookLog[] = [
  {
    logId: 'log1',
    bookId: '1',
    userId: 'user123',
    aiSummary: {
      emotion: '불안 72%',
      keywords: ['선택', '지침', '불안'],
      reason: '안정감을 주는 서사가 있어 심리적 회복에 도움됩니다.',
      quote: '나는 요즘 선택이 너무 어렵다...',
    },
    userReview: '이 책을 읽고 마음이 한결 편안해졌어요. 어린 왕자의 순수한 시선이 저를 위로해 주었습니다.',
    createdAt: '2025-11-20T10:00:00Z',
    updatedAt: '2025-11-21T14:00:00Z',
  },
  {
    logId: 'log2',
    bookId: '2',
    userId: 'user123',
    aiSummary: {
      emotion: '혼란 65%',
      keywords: ['자아', '성장', '정체성'],
      reason: '자아를 찾아가는 과정의 어려움에 공감하고 방향성을 제시합니다.',
      quote: '내 안의 나를 찾는 것이 이렇게 힘들 줄이야...',
    },
    userReview: '',
    createdAt: '2025-11-18T15:30:00Z',
    updatedAt: '2025-11-18T15:30:00Z',
  },
  {
    logId: 'log3',
    bookId: '3',
    userId: 'user123',
    aiSummary: {
        emotion: '무기력 80%',
        keywords: ['꿈', '여정', '의미'],
        reason: '자신의 꿈을 좇는 여정을 통해 삶의 의미를 되새길 수 있습니다.',
        quote: '요즘 모든 게 의미 없게 느껴져요.',
    },
    userReview: '산티아고의 여정을 따라가며 제 자신의 꿈에 대해 다시 생각해보게 되었습니다.',
    createdAt: '2025-11-15T11:45:00Z',
    updatedAt: '2025-11-16T18:00:00Z',
  },
];


// Simulate API calls using localStorage
export const getBookshelf = (): Promise<Book[]> => {
  return new Promise((resolve) => {
    // In a real app, this would be an API call.
    setTimeout(() => resolve(MOCK_BOOKS), 500);
  });
};

export const getBookLog = (bookId: string): Promise<{ book: Book; log: BookLog } | null> => {
  return new Promise((resolve) => {
    const book = MOCK_BOOKS.find(b => b.bookId === bookId);
    
    // Use localStorage to get the latest review
    const allLogs: BookLog[] = JSON.parse(localStorage.getItem('bookLogs') || JSON.stringify(MOCK_LOGS));
    const log = allLogs.find(l => l.bookId === bookId);

    setTimeout(() => {
      if (book && log) {
        resolve({ book, log });
      } else {
        resolve(null);
      }
    }, 500);
  });
};

export const saveUserReview = (bookId: string, review: string): Promise<BookLog> => {
    return new Promise((resolve, reject) => {
        const allLogs: BookLog[] = JSON.parse(localStorage.getItem('bookLogs') || JSON.stringify(MOCK_LOGS));
        const logIndex = allLogs.findIndex(l => l.bookId === bookId);

        if (logIndex > -1) {
            allLogs[logIndex].userReview = review;
            allLogs[logIndex].updatedAt = new Date().toISOString();
            localStorage.setItem('bookLogs', JSON.stringify(allLogs));
            setTimeout(() => resolve(allLogs[logIndex]), 300);
        } else {
            reject(new Error('Log not found'));
        }
    });
};

// Initialize localStorage if it's empty
if (!localStorage.getItem('bookLogs')) {
    localStorage.setItem('bookLogs', JSON.stringify(MOCK_LOGS));
}
