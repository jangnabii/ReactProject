// src/api/ai.ts
import type { Book } from '../types';

interface Message {
  from: 'user' | 'ai';
  text: string;
}

export interface AiResponse {
  responseText: string;
  recommendedBook?: Book | null;
  lastRecommendationTopic?: string | null;
}

const detectTopic = (userInput: string): string => {
  const burnoutWords = ['힘들', '지친', '번아웃', '피곤', '우울', '스트레스', '지쳐'];
  const conflictWords = ['싸웠', '다퉜', '짜증', '화나', '관계', '갈등', '오해'];
  const positiveWords = ['즐거웠', '좋았', '행복', '기뻤', '신났', '기쁨', '설레'];
  const anxietyWords = ['불안', '걱정', '두려', '무서', '초조'];
  const lonelyWords = ['외로', '쓸쓸', '혼자', '고독'];

  if (burnoutWords.some(word => userInput.includes(word))) return '힐링';
  if (conflictWords.some(word => userInput.includes(word))) return '인간관계';
  if (positiveWords.some(word => userInput.includes(word))) return '성장';
  if (anxietyWords.some(word => userInput.includes(word))) return '위로';
  if (lonelyWords.some(word => userInput.includes(word))) return '공감';
  return '자기계발'; // Default topic
};

export const getAiResponse = async (
  userInput: string,
  history: Message[],
  mode: string
): Promise<AiResponse> => {
  const turnCount = history.filter((m: Message) => m.from === 'user').length;

  // Flow 1: Unconditional book recommendation on the 3rd user turn
  if (turnCount === 3) {
    const topic = detectTopic(userInput);
    try {
      const response = await fetch(`/api/books/recommend?query=${encodeURIComponent(topic)}&mode=${mode}`);
      if (!response.ok) throw new Error('추천 도서 정보를 가져오는 데 실패했습니다.');

      const books: Book[] = await response.json();
      
      if (books.length > 0) {
        const book = books[0];
        // Create a response that introduces the book and continues conversation
        const responseText = `대화에 도움이 될 것 같아서 '${book.title}'(이)라는 책을 한번 찾아봤어요. 한번 살펴보시고, 우리는 계속 이야기 나누면 좋겠어요.`;
        return {
          responseText: responseText,
          recommendedBook: book,
          lastRecommendationTopic: topic,
        };
      }
    } catch (error) {
      console.error("Book recommendation API error:", error);
      // If recommendation fails, just fall through to the normal chat response
    }
  }

  // Flow 2: Standard chat completion (default case)
  try {
    const response = await fetch('/api/chat/completion', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      // Send the full history including the latest user message
      body: JSON.stringify({ history: [...history, { from: 'user', text: userInput }], mode }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'AI 응답을 가져오는 데 실패했습니다.');
    }

    const data: { responseText: string } = await response.json();
    return { responseText: data.responseText, recommendedBook: null };

  } catch (error) {
    console.error("Chat completion API error:", error);
    return { responseText: "죄송합니다, 대화 응답을 생성하는 중에 오류가 발생했어요." };
  }
};
