# Book Search 기능 구현 완료 ✅

## 구현 내용

### 1. Backend API 서버 (`backend/server.js`)
- **국립중앙도서관 Open API** 연동
- 감정/키워드 기반 도서 추천 엔드포인트: `GET /api/books/recommend?query={keyword}`
- XML 응답을 JSON으로 변환
- 책 표지 이미지 지원 (API에서 제공 시)

### 2. Frontend 개선
- **감정 분석 강화** (`src/api/ai.ts`)
  - 5가지 감정 카테고리로 확장: 힐링, 인간관계, 성장, 위로, 공감
  - 감정별 적절한 도서 검색 키워드 매핑
  - 2턴 대화 후 자동으로 책 추천 제안

- **Book 타입 확장** (`src/types/index.ts`)
  - `coverImage`, `isbn`, `description` 필드 추가

- **Chat UI 개선** (`src/pages/Chat.tsx`)
  - 책 표지 이미지 표시 (있을 경우)
  - 표지 이미지 없을 시 📚 이모지 폴백

## 설정 방법

### 1. Backend 환경 변수 설정

`backend/.env` 파일을 생성하고 다음 내용을 추가하세요:

\`\`\`env
# 국립중앙도서관 API Key
NLK_API_KEY=35cd282b36930a4ab9e6d6cdc360b269df5f6b160965a6982cc14abb82db57c6

# Server Port
PORT=3001
\`\`\`

### 2. Backend 서버 실행

\`\`\`bash
cd backend
npm start
\`\`\`

서버가 `http://localhost:3001`에서 실행됩니다.

### 3. Frontend 실행

새 터미널에서:

\`\`\`bash
pnpm dev
\`\`\`

Frontend가 `http://localhost:5173`에서 실행됩니다.

## 사용 방법

1. **로그인** → **모드 선택** → **홈**
2. **대화하기** 버튼 클릭
3. AI와 대화하면서 감정 표현 (예: "요즘 너무 힘들어", "불안해")
4. 2~3턴 대화 후 AI가 책 추천 제안
5. "응", "좋아", "추천해줘" 등으로 동의
6. AI가 감정에 맞는 책 1권 추천
7. **"이 책 읽어볼게요"** 버튼으로 서재에 추가
8. **"다시 추천"** 버튼으로 다른 책 추천받기

## API 엔드포인트

### GET /api/books/recommend
**Query Parameters:**
- `query` (required): 검색 키워드 (예: "힐링", "인간관계", "위로")

**Response:**
\`\`\`json
[
  {
    "id": "ISBN or control_no",
    "title": "책 제목",
    "author": "저자",
    "publisher": "출판사",
    "pubYear": "2023",
    "isbn": "978-...",
    "coverImage": "http://...",
    "description": "책 설명"
  }
]
\`\`\`

## 주요 기능

✅ 감정 기반 도서 추천  
✅ 국립중앙도서관 API 연동  
✅ 책 표지 이미지 표시  
✅ 서재에 책 추가  
✅ 다시 추천 기능  
✅ 모드별 대화 스타일 유지  

## 문제 해결

### Backend 서버가 시작되지 않는 경우
1. `backend/.env` 파일이 존재하는지 확인
2. API 키가 올바른지 확인
3. 포트 3001이 사용 중인지 확인

### 책 추천이 작동하지 않는 경우
1. Backend 서버가 실행 중인지 확인 (`http://localhost:3001/api/health`)
2. 브라우저 콘솔에서 네트워크 오류 확인
3. 감정 표현 키워드 사용 (힘들, 불안, 외로, 행복 등)
