// src/api/ai.ts
import { Book } from '../types';
import { MOCK_BOOKS_FOR_CHAT } from './mockChat';

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

// --- Greatly Expanded and Diversified Templates for Adult Mode ---
const responsePairs: { [mode: string]: { [topic: string]: ResponsePair[] } } = {
  senior: {
    // ... senior pairs remain as they were
    positive: [{ ack: "정말 즐거운 경험이셨네요.", followUp: "그때의 기분을 조금 더 자세히 들려주시겠어요?" }],
    default: [{ ack: "그렇게 생각하고 계셨군요.", followUp: "그 시절에 기억나는 다른 일이 있으시다면 편하게 들려주세요." }]
  },
  adult: {
    positive: [
        { ack: "듣기만 해도 에너지가 느껴지는 이야기네요.", followUp: "가장 성취감이 컸던 순간은 언제였나요?"},
        { ack: "그런 즐거운 일이 있으셨다니, 저도 기분이 좋아지네요.", followUp: "그 경험이 자신에게 어떤 의미였다고 생각하세요?"}
    ],
    burnout: [
        { ack: "말씀하신 상황을 들으니 마음이 많이 쓰이셨을 것 같아요.", followUp: "혹시 어떤 순간에 가장 번아웃을 느끼시는지 여쭤봐도 될까요?"},
        { ack: "에너지가 많이 소진된 상태시군요.", followUp: "그 상황을 벗어나기 위해 어떤 노력을 해보셨나요?"},
        { ack: "매일 반복되는 일상에 지치셨군요.", followUp: "최근에 자신에게 작은 행복을 준 일이 있었다면 무엇인가요?"}
    ],
    conflict: [
        { ack: "관계라는 게 참 마음처럼 되지 않을 때가 많죠.", followUp: "그 상황에서 가장 힘들게 하는 부분은 무엇인가요?"},
        { ack: "그 사람의 말이나 행동이 계속 마음에 남으셨군요.", followUp: "혹시 그 갈등이 어떻게 해결되기를 바라시나요?"}
    ],
    recommendation_accepted: [
      { ack: "탁월한 선택입니다.", followUp: "독서가 즐거운 시간이 되길 바랍니다. 책을 읽고 난 후의 감상도 언제든 들려주세요." },
      { ack: "분명 도움이 될 거예요.", followUp: "그럼 이제 또 어떤 이야기를 해볼까요?" }
    ],
    default: [
        { ack: "그 점에 대해 계속 생각하고 계셨군요.", followUp: "혹시 더 얘기해주실 부분이 있다면 편하게 말씀해 주세요."},
        { ack: "흥미로운 관점이네요.", followUp: "그 생각에 대해 조금 더 설명해 주실 수 있을까요?"},
        { ack: "그렇군요.", followUp: "그때 어떤 마음이 드셨는지 궁금하네요."}
    ]
  },
  teen: {
    // ... teen pairs
    default: [{ ack: "그랬구�