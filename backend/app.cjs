const express = require('express');
const cors = require('cors');
const { OpenAI } = require('openai');
require('dotenv').config();

const app = express();

// --- API Clients Initialization ---
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

// Middleware
app.use(cors());
app.use(express.json());

// --- Safety Protocol (Moderation) ---
const SAFE_RESPONSE_GENERIC = "부적절한 내용이 감지되었습니다. 주제를 변경해 주세요.";
const SAFE_RESPONSE_SELF_HARM = "혹시라도 힘든 상황에 계시다면, 혼자 고민하지 마세요. 전문가의 도움을 받을 수 있습니다. 보건복지부 희망의 전화 1393에 연락해 보세요. 24시간 언제든 익명으로 상담이 가능합니다.";

async function getModerationResult(text) {
    if (!text || text.trim() === '') return null;
    try {
        console.log(`[Moderation] Checking: "${text.substring(0, 50)}"...`);
        const moderation = await openai.moderations.create({ input: text });
        return moderation.results[0];
    } catch (error) {
        console.error('[Moderation API Error]', error);
        return { flagged: true, categories: { 'self-harm': false } }; 
    }
}

// --- API Endpoints ---

app.post('/api/chat/completion', async (req, res) => {
    const { history, mode } = req.body;
    if (!history || !Array.isArray(history) || !mode) {
        return res.status(400).json({ error: '요청 형식이 올바르지 않습니다.' });
    }

    const lastUserMessage = history[history.length - 1];
    if (lastUserMessage.from === 'user') {
        const moderationResult = await getModerationResult(lastUserMessage.text);
        if (moderationResult?.flagged) {
            const responseText = moderationResult.categories['self-harm'] ? SAFE_RESPONSE_SELF_HARM : SAFE_RESPONSE_GENERIC;
            console.warn(`[Moderation] Unsafe user input detected. Category: ${Object.keys(moderationResult.categories).filter(k => moderationResult.categories[k]).join(', ')}`);
            return res.json({ responseText });
        }
    }

    const systemMessages = {
        child: "너는 7살 아이의 눈높이에 맞춰서 다정하고 귀여운 말투로 대답해주는 친구야. 반말로 응답해야 해.",
        teen: "너는 고민이 많은 10대 청소년의 비밀 친구야. 편안하고 공감해주는 말투를 사용하고, 때로는 현실적인 조언도 해줘.",
        adult: "너는 사용자의 감정적인 고민을 들어주는 전문 심리 상담가야. 차분하고 성숙한 톤으로 깊이 있는 질문을 던지며, 사용자가 스스로 답을 찾도록 도와줘.",
        senior: "너는 어르신의 말동무가 되어주는 손주 혹은 자녀야. 공손하고 따뜻한 말투로 어르신의 이야기를 경청하고, 과거의 경험이나 회상에 대한 대화를 유도하며 긍정적인 반응을 보여줘."
    };
    const systemMessage = { role: 'system', content: systemMessages[mode] || systemMessages['adult'] };
    const messages = [systemMessage, ...history.map(msg => ({ role: msg.from === 'user' ? 'user' : 'assistant', content: msg.text }))].map(msg => ({...msg, content: msg.content.replace(/[“”]/g, '"').replace(/[‘’]/g, "'")}));

    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: messages,
            temperature: 0.7,
        });

        const aiResponse = completion.choices[0].message.content || "";
        console.log(`[Chat Completion] AI Response: ${aiResponse.substring(0, 50)}...`);

        const moderationResult = await getModerationResult(aiResponse);
        if (moderationResult?.flagged) {
            const responseText = moderationResult.categories['self-harm'] ? SAFE_RESPONSE_SELF_HARM : SAFE_RESPONSE_GENERIC;
            console.warn(`[Moderation] Unsafe AI response detected. Category: ${Object.keys(moderationResult.categories).filter(k => moderationResult.categories[k]).join(', ')}`);
            return res.json({ responseText });
        }

        res.json({ responseText: aiResponse });

    } catch (error) {
        console.error('[Chat Completion Error]', error.message);
        res.status(500).json({ error: 'AI 대화 응답 생성 중 오류가 발생했습니다.', details: error.message });
    }
});

app.get('/api/books/recommend', async (req, res) => {
    const { query: category, mode, exclude } = req.query;

    if (!category) {
        return res.status(400).json({ error: '카테고리(query)가 필요합니다.' });
    }

    const moderationResult = await getModerationResult(category);
    if (moderationResult?.flagged) {
        return res.status(400).json({ error: '부적절한 카테고리입니다.' });
    }

    console.log(`[AI Book Recommendation] Category: ${category}, Mode: ${mode}, Exclude: ${exclude}`);
    const audienceInstruction = mode === 'child' ? "어린이에게 적합한 동화책으로" : "사용자에게 도움이 될 만한";
    const excludeInstruction = exclude ? `단, '${exclude}'(은)는 제외하고 추천해주세요.` : "";

    const recommendationPrompt = `
        사용자가 '${category}' 주제와 관련된 감정을 느끼고 있습니다.
        이 ${audienceInstruction} 실제 한국 출판 시장에 존재하는 책을 한 권 추천해주세요.
        너무 뻔하거나 유명한 베스트셀러만 추천하지 말고, 사용자에게 정말 도움이 될 만한 다양한 관점의 책을 추천해주세요.
        ${excludeInstruction}
        응답은 다른 말 없이, 오직 다음의 JSON 형식만을 따라야 합니다:
        {
          "title": "책 제목",
          "author": "저자",
          "publisher": "출판사",
          "pubYear": "출판 연도 (YYYY 형식)",
          "excerpt": "책의 핵심 내용이나 인상적인 구절 1~2 문장"
        }
    `;

    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo-1106",
            messages: [{ role: "user", content: recommendationPrompt }],
            temperature: 0.9,
            response_format: { type: "json_object" },
        });

        const content = completion.choices[0].message.content;
        if (!content) throw new Error("AI의 응답이 비어있습니다.");
        
        const bookData = JSON.parse(content);
        const recommendedBook = {
            id: `ai-${Date.now()}`,
            title: bookData.title,
            author: bookData.author,
            publisher: bookData.publisher,
            pubYear: bookData.pubYear,
            description: bookData.excerpt,
            coverImage: null
        };

        res.json([recommendedBook]);

    } catch (error) {
        console.error(`[AI Book Recommendation Error] Category: "${category}" failed.`, error);
        res.status(500).json({ error: 'AI 도서 추천 중 오류가 발생했습니다.', details: error.message });
    }
});

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Backend server is running' });
});

module.exports = app;
