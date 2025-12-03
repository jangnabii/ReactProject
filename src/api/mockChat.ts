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
    { id: 'child-1', name: '피카츄 목소리' },
    { id: 'child-2', name: '씩씩한 어린이 목소리' },
  ],
  teen: [
    { id: 'teen-1', name: '아이돌 (남)' },
    { id: 'teen-2', name: '하이틴 여주인공' },
  ],
  adult: [
    { id: 'adult-1', name: '차분한 아나운서' },
    { id: 'adult-2', name: '다정한 선배' },
  ],
  senior: [
    { id: 'senior-1', name: '구수한 트로트 가수' },
    { id: 'senior-2', name: '자상한 할머니' },
  ],
};
