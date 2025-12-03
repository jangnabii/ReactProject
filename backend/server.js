const express = require('express');
const cors = require('cors');
const axios = require('axios');
const xml2js = require('xml2js');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// 국립중앙도서관 API 설정
const NLK_API_KEY = process.env.NLK_API_KEY;
const NLK_API_URL = 'https://www.nl.go.kr/NL/search/openApi/search.do';

/**
 * 감정/키워드 기반 도서 추천 엔드포인트
 * GET /api/books/recommend?query={keyword}
 */
app.get('/api/books/recommend', async (req, res) => {
    try {
        const { query } = req.query;

        if (!query) {
            return res.status(400).json({ error: '검색어(query)가 필요합니다.' });
        }

        console.log(`[Book Recommendation] Query: ${query}`);

        // 국립중앙도서관 API 호출
        const response = await axios.get(NLK_API_URL, {
            params: {
                key: NLK_API_KEY,
                kwd: query,
            },
            responseType: 'text',
            headers: {
                'Accept-Charset': 'utf-8'
            }
        });

        console.log('[Book Recommendation] API Response received, length:', response.data.length);

        // XML을 JSON으로 파싱
        const parser = new xml2js.Parser({ explicitArray: false });
        const result = await parser.parseStringPromise(response.data);

        console.log('[Book Recommendation] Parsed result structure:', JSON.stringify(result, null, 2).substring(0, 500));

        // 응답 데이터 확인
        if (!result || !result.rss || !result.rss.channel || !result.rss.channel.item) {
            console.log('[Book Recommendation] No results found');
            return res.json([]);
        }

        // item이 배열이 아닐 경우 배열로 변환
        let items = result.rss.channel.item;
        if (!Array.isArray(items)) {
            items = [items];
        }

        // 책 데이터 변환
        const books = items.map((item, index) => ({
            id: item.isbn || item.control_no || `book-${Date.now()}-${index}`,
            title: item.title_info || item.title || '제목 없음',
            author: item.author_info || item.author || '저자 미상',
            publisher: item.pub_info || item.publisher || '출판사 미상',
            pubYear: item.pub_year_info || item.pub_year || '',
            isbn: item.isbn || '',
            coverImage: item.image_url || null,
            description: item.description || '',
        }));

        console.log(`[Book Recommendation] Found ${books.length} books`);
        res.json(books);
    } catch (error) {
        console.error('[Book Recommendation Error]', error.message);
        if (error.response) {
            console.error('[API Response Error]', error.response.status, error.response.data);
        }
        res.status(500).json({
            error: '도서 추천 중 오류가 발생했습니다.',
            details: error.message
        });
    }
});

/**
 * 헬스 체크 엔드포인트
 */
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Backend server is running' });
});

// 서버 시작
app.listen(PORT, () => {
    console.log(`✅ Backend server is running on http://localhost:${PORT}`);
    console.log(`📚 Book recommendation API: http://localhost:${PORT}/api/books/recommend`);
});
