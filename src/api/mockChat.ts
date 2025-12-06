// src/api/mockChat.ts
import { Book } from '../types';

export const MOCK_BOOKS_FOR_CHAT: Book[] = [
  {
    bookId: '101',
    title: '마음의 안정',
    author: '닥터 힐링',
    coverImageUrl: 'https://via.placeholder.com/150/87CEEB/000000?Text=Peace+of+Mind',
    addedAt: new Date().toISOString(),
  },
  {
    bookId: '102',
    title: '용기를 내는 법',
    author: '인생 코치',
    coverImageUrl: 'https://via.placeholder.com/150/FFA07A/000000?Text=Courage',
    addedAt: new Date().toISOString(),
  },
];

interface Voice {
  id: string;
  name: string;
}

interface MockVoices {
    [key: string]: Voice[];
}

export const MOCK_VOICES: MockVoices = {
  child: [
    { id: 'child-1', name: '티니핑 목소리' },
    { id: 'child-2', name: '뽀로로 목소리' },
    { id: 'child-3', name: '핑크퐁 목소리' },
  ],
  teen: [
    { id: 'teen-1', name: '장원영 목소리' },
    { id: 'teen-2', name: '원빈 목소리' },
    { id: 'teen-3', name: '타잔 목소리' },
  ],
  adult: [
    { id: 'adult-1', name: '박효신 목소리' },
    { id: 'adult-2', name: '아이유 목소리' },
    { id: 'adult-3', name: '이재훈 목소리' },
    { id: 'adult-4', name: '나문희 목소리' },
  ],
  senior: [
    { id: 'senior-1', name: '나훈아 목소리' },
    { id: 'senior-2', name: '임영웅 목소리' },
    { id: 'senior-3', name: '이찬원 목소리' },
    { id: 'senior-4', name: '장윤정 목소리' },
  ],
};
