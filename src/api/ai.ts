// src/api/ai.ts
import type { Book } from '../types';
// MOCK_BOOKS_FOR_CHAT is no longer needed
// import { MOCK_BOOKS_FOR_CHAT } from './mockChat';

interface Message {
  from: 'user' | 'ai';
  text: string;
}

export interface AiResponse {
  responseText: string;
  recommendedBook?: Book | null;
}

interface ResponsePair {
  ack: string;
  followUp: string;
}

const responsePairs: { [mode: string]: { [topic: string]: ResponsePair[] } } = {
  // ... (responsePairs content remains the same)
  senior: {
    positive: [{ ack: "정말 즐거운 경험이셨네요.", followUp: "그때의 기분을 조금 더 자세히 들려주시겠어요?" }],
    default: [{ ack: "그렇게 생각하고 계셨군요.", followUp: "그 시절에 기억나는 다른 일이 있으시다면 편하게 들려주세요." }]
  },
  adult: {
    positive: [
      { ack: "듣기만 해도 에너지가 느껴지는 이야기네요.", followUp: "가장 성취감이 컸던 순간은 언제였나요?" },
      { ack: "그런 즐거운 일이 있으셨다니, 저도 기분이 좋아지네요.", followUp: "그 경험이 자신에게 어떤 의미였다고 생각하세요?" }
    ],
    burnout: [
      { ack: "말씀하신 상황을 들으니 마음이 많이 쓰이셨을 것 같아요.", followUp: "혹시 어떤 순간에 가장 번아웃을 느끼시는지 여쭤봐도 될까요?" },
      { ack: "에너지가 많이 소진된 상태시군요.", followUp: "그 상황을 벗어나기 위해 어떤 노력을 해보셨나요?" },
      { ack: "매일 반복되는 일상에 지치셨군요.", followUp: "최근에 자신에게 작은 행복을 준 일이 있었다면 무엇인가요?" }
    ],
    conflict: [
      { ack: "관계라는 게 참 마음처럼 되지 않을 때가 많죠.", followUp: "그 상황에서 가장 힘들게 하는 부분은 무엇인가요?" },
      { ack: "그 사람의 말이나 행동이 계속 마음에 남으셨군요.", followUp: "혹시 그 갈등이 어떻게 해결되기를 바라시나요?" }
    ],
    recommendation_accepted: [
      { ack: "탁월한 선택입니다.", followUp: "독서가 즐거운 시간이 되길 바랍니다. 책을 읽고 난 후의 감상도 언제든 들려주세요." },
      { ack: "분명 도움이 될 거예요.", followUp: "그럼 이제 또 어떤 이야기를 해볼까요?" }
    ],
    default: [
      { ack: "그 점에 대해 계속 생각하고 계셨군요.", followUp: "혹시 더 얘기해주실 부분이 있다면 편하게 말씀해 주세요." },
      { ack: "흥미로운 관점이네요.", followUp: "그 생각에 대해 조금 더 설명해 주실 수 있을까요?" },
      { ack: "그렇군요.", followUp: "그때 어떤 마음이 드셨는지 궁금하네요." }
    ]
  },
  teen: {
    default: [{ ack: "그랬구나, 완전 공감돼요.", followUp: "그때 기분이 어땠는지 좀 더 말해줄 수 있어요?" }]
  },
  child: {
    positive: [{ ack: "정말 신나는 일이었겠다!", followUp: "또 어떤 재미있는 일이 있었어?" }],
    default: [{ ack: "그랬구나!", followUp: "마음이 어땠는지 조금 더 이야기해 줄 수 있어?" }]
  }
};
responsePairs.teen = { ...responsePairs.adult, ...responsePairs.teen };
responsePairs.senior = { ...responsePairs.adult, ...responsePairs.senior };
responsePairs.child = { ...responsePairs.adult, ...responsePairs.child };


const pickRandomPair = (pairs: ResponsePair[] | undefined) => {
  if (!pairs || pairs.length === 0) {
    return { ack: "그렇군요.", followUp: "조금 더 자세히 이야기해주실 수 있을까요?" };
  }
  return pairs[Math.floor(Math.random() * pairs.length)];
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


const isAffirmative = (userInput: string) => {
  const affirmativeWords = ['응', '좋아', '고마워', '그래', '추천해줘', '부탁해', '네'];
  return affirmativeWords.some(word => userInput.includes(word));
}

// Keep track of the last topic that prompted a recommendation question
let lastRecommendationTopic: string | null = null;

export const getAiResponse = async (
  userInput: string,
  history: Message[],
  mode: string
): Promise<AiResponse> => {
  const lastAiMessage = [...history].reverse().find((m: Message) => m.from === 'ai');
  const wasLastAiARecQuestion = lastAiMessage?.text.includes('추천') && lastAiMessage.text.includes('까요?');

  if (wasLastAiARecQuestion && isAffirmative(userInput) && lastRecommendationTopic) {
    const intro = "좋아요. 지금 마음에 힘을 줄 수 있는 책을 찾아봤어요.";
    try {
      const response = await fetch(`/api/books/recommend?query=${encodeURIComponent(lastRecommendationTopic)}`);
      if (!response.ok) throw new Error('추천 도서 정보를 가져오는 데 실패했습니다.');

      const books: Book[] = await response.json();
      if (books.length > 0) {
        // Return the first book found by the API
        return {
          responseText: `${intro} 이 책이 마음에 조금이나마 도움이 되면 좋겠습니다.`,
          recommendedBook: books[0],
        };
      } else {
        return { responseText: `죄송합니다. '${lastRecommendationTopic}'에 대한 책을 찾지 못했어요. 다른 이야기를 해볼까요?` };
      }
    } catch (error) {
      console.error("Book recommendation API error:", error);
      return { responseText: "죄송합니다, 추천 도서를 검색하는 중에 오류가 발생했어요." };
    }
  }

  const topic = detectTopic(userInput);
  const turnCount = history.filter((m: Message) => m.from === 'user').length;

  // Ask for recommendation permission after 2 user messages on any emotional topic
  if (turnCount >= 2 && !wasLastAiARecQuestion && topic !== '자기계발') {
    const recPermissionPrompt = `혹시 지금의 마음에 도움이 될 만한 책을 한 권 추천드려도 괜찮을까요?`;
    lastRecommendationTopic = topic; // Store the topic that triggered this question
    return { responseText: recPermissionPrompt };
  }

  const modePairs = responsePairs[mode];
  // Fallback to 'default' topic if the detected topic has no specific pairs
  const topicPairs = modePairs[topic] || modePairs['default'];

  const { ack, followUp } = pickRandomPair(topicPairs);
  const responseText = `${ack} ${followUp}`;

  return { responseText, recommendedBook: null };
};
