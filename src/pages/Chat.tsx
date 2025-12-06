import { useState, useEffect, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import { FaPlay, FaPause, FaStop, FaPaperPlane } from 'react-icons/fa';
import styles from './Chat.module.css';
import type { Book, BookLog } from '../types';
import { MOCK_VOICES } from '../api/mockChat';
import { getAiResponse } from '../api/ai';
import type { AiResponse } from '../api/ai';
import HomeBackButton from '../components/HomeBackButton.tsx';

interface Message {
  from: 'user' | 'ai';
  text: string;
}

function Chat() {
  const { currentUser } = useOutletContext<{ currentUser: string | null }>();
  const [userInput, setUserInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [userMode, setUserMode] = useState('adult');
  const [recommendedBook, setRecommendedBook] = useState<Book | null>(null);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [emotionKeyword, setEmotionKeyword] = useState<string | null>(null);

  // --- TTS (Audiobook) State ---
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const messageListRef = useRef<HTMLDivElement>(null);

  // --- Effects ---

  useEffect(() => {
    const mode = localStorage.getItem('userMode') || 'adult';
    const initialGreeting = {
      child: '안녕! 오늘 어떤 신나는 이야기를 해볼까?',
      teen: '안녕하세요! 어떤 이야기든 편하게 털어놓아도 괜찮아요.',
      adult: '안녕하세요. 오늘 어떤 이야기를 나누고 싶으신가요?',
      senior: '안녕하세요, 어르신. 오늘 하루는 어떠셨나요?'
    }[mode];

    setUserMode(mode);
    setMessages([{ from: 'ai', text: initialGreeting }]);

    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      if (availableVoices.length > 0) {
        const koreanVoices = availableVoices.filter(v => v.lang.startsWith('ko'));
        setVoices(koreanVoices);
        if (koreanVoices.length > 0) {
          setSelectedVoiceURI(koreanVoices[0].voiceURI);
        }
      }
    };
    
    window.speechSynthesis.onvoiceschanged = loadVoices;
    loadVoices();

    return () => { window.speechSynthesis.cancel(); };
  }, []);

  useEffect(() => {
    if (messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }
  }, [messages]);

  // --- Data Saving Logic ---

  const saveRecommendation = (book: Book, userConcern: string, recommendationReason: string, emotion: string) => {
    if (!currentUser) return;

    // 1. Save the Book to the bookshelf
    const bookshelfKey = `bookshelf_${currentUser}`;
    const storedBooks: Book[] = JSON.parse(localStorage.getItem(bookshelfKey) || '[]');
    if (!storedBooks.some(b => b.id === book.id)) {
      localStorage.setItem(bookshelfKey, JSON.stringify([...storedBooks, book]));
    }

    // 2. Save the BookLog
    const bookLogKey = `booklogs_${currentUser}`;
    const storedBookLogs: BookLog[] = JSON.parse(localStorage.getItem(bookLogKey) || '[]');
    
    if (!storedBookLogs.some(log => log.id === book.id)) {
      const newLog: BookLog = {
        id: book.id,
        userId: currentUser,
        aiSummary: {
          emotion: emotion,
          userConcern: userConcern,
          recommendationReason: recommendationReason,
        },
        userReview: '',
        recommendedDate: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
      };
      localStorage.setItem(bookLogKey, JSON.stringify([...storedBookLogs, newLog]));
    }
  };


  // --- Handlers ---

  const handleSendMessage = async () => {
    if (userInput.trim() === '' || isAiThinking) return;

    const currentInput = userInput;
    const newMessages: Message[] = [...messages, { from: 'user', text: currentInput }];
    setMessages(newMessages);
    setUserInput('');
    setIsAiThinking(true);
    setFeedback('');

    setTimeout(async () => {
      const aiResponse: AiResponse = await getAiResponse(currentInput, newMessages, userMode);

      setMessages(prev => [...prev, { from: 'ai', text: aiResponse.responseText }]);

      if (aiResponse.lastRecommendationTopic) {
        setEmotionKeyword(aiResponse.lastRecommendationTopic);
      }
      
      if (aiResponse.recommendedBook && aiResponse.lastRecommendationTopic) {
        setRecommendedBook(aiResponse.recommendedBook);
        saveRecommendation(
          aiResponse.recommendedBook,
          currentInput,
          aiResponse.responseText,
          aiResponse.lastRecommendationTopic
        );
        setFeedback(`'${aiResponse.recommendedBook.title}'을(를) 서재에 추가했습니다!`);
      } else if (aiResponse.recommendedBook === null) {
        setRecommendedBook(null);
        setEmotionKeyword(null);
      }
      setIsAiThinking(false);
    }, 500);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSendMessage();
  };

  const handleRetryRecommendation = async () => {
    if (isAiThinking || !emotionKeyword || !recommendedBook) return;

    setIsAiThinking(true);
    setFeedback('다른 책을 찾아보는 중...');

    try {
      const queryParams = new URLSearchParams({
        query: emotionKeyword,
        mode: userMode,
        exclude: recommendedBook.title,
      });
      
      const response = await fetch(`/api/books/recommend?${queryParams}`);
      if (!response.ok) throw new Error('새로운 추천 도서를 가져오는 데 실패했습니다.');

      const newBooks: Book[] = await response.json();
      if (newBooks.length > 0) {
        const newBook = newBooks[0];
        const newResponseMessage = `음... 그럼 이 책은 어떠세요? '${newBook.title}'(이)라는 책도 좋은 선택이 될 수 있어요.`;

        setMessages(prev => [...prev, { from: 'ai', text: newResponseMessage }]);
        setRecommendedBook(newBook);
        saveRecommendation(
          newBook,
          "다시 추천 요청",
          newResponseMessage,
          emotionKeyword
        );
        setFeedback(`'${newBook.title}'을(를) 서재에 추가했습니다!`);
      } else {
        setFeedback('추천할 만한 다른 책을 찾지 못했어요.');
      }
    } catch (error) {
      console.error("Retry recommendation error:", error);
      setFeedback('다른 책을 추천받는 중 오류가 발생했습니다.');
    } finally {
      setIsAiThinking(false);
    }
  };

  // --- TTS Handlers ---
  const handlePlayAudio = () => {
    if (!recommendedBook?.description || isSpeaking) return;

    const textToSpeak = recommendedBook.description.split(/[.!?]/).slice(0, 2).join('.') + '.';
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    
    if (selectedVoiceURI) {
      const selectedVoice = voices.find(v => v.voiceURI === selectedVoiceURI);
      if (selectedVoice) utterance.voice = selectedVoice;
    }
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    window.speechSynthesis.speak(utterance);
  };

  const handlePauseAudio = () => {
    if (isSpeaking) {
      window.speechSynthesis.pause();
      setIsSpeaking(false);
    }
  };

  const handleStopAudio = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  return (
    <div className={styles.pageContainer} data-mode={userMode}>
      <div className="p-4 bg-white border-b shadow-sm">
        <div className="max-w-3xl mx-auto"><HomeBackButton /></div>
      </div>
      <div className={styles.chatLayout}>
        <main className={styles.chatArea}>
          <div className={styles.messageList} ref={messageListRef}>
            {messages.map((msg, index) => (
              <div key={index} className={`${styles.messageRow} ${styles[msg.from]}`}>
                {msg.from === 'ai' && <img src="/profile.png" alt="ai avatar" className={styles.avatar} />}
                <div className={styles.message}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isAiThinking && (
              <div className={`${styles.messageRow} ${styles.ai}`}>
                <img src="/profile.png" alt="ai avatar" className={styles.avatar} />
                <div className={`${styles.message} ${styles.thinking}`}>
                  ...
                </div>
              </div>
            )}
          </div>
          <div className={styles.inputArea}>
            <input
              type="text"
              className={styles.input}
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="메시지를 입력하세요..."
              disabled={isAiThinking}
            />
            <button className={styles.sendButton} onClick={handleSendMessage} disabled={isAiThinking}><FaPaperPlane /></button>
          </div>
        </main>

        <aside className={styles.sidebar}>
          {feedback && <div className={styles.feedbackCard}>{feedback}</div>}
          
          <div className={styles.recommendationCard}>
            <h3>AI 추천 도서</h3>
            {recommendedBook ? (
              <>
                <div className={styles.bookIcon}>📚</div>
                <h4>{recommendedBook.title}</h4>
                <p>저자: {recommendedBook.author || '정보 없음'}</p>
                <p>출판년도: {recommendedBook.pubYear || '정보 없음'}</p>
                {emotionKeyword && <p><strong>감정 키워드:</strong> {emotionKeyword}</p>}
                <p className={styles.description}><strong>추천 구절:</strong> {recommendedBook.description || '정보 없음'}</p>
                <div className={styles.buttonGroup}>
                  <button className={styles.addBtn} onClick={() => setFeedback('이 책은 추천과 동시에 서재에 자동 저장됩니다.')}>서재에 담기</button>
                  <button className={styles.retryBtn} onClick={handleRetryRecommendation}>다시 추천</button>
                </div>
              </>
            ) : (
              <div className={styles.placeholder}>
                <p>대화를 나누다 보면 AI가 당신을 위한 책을 추천해 줄 거예요.</p>
              </div>
            )}
          </div>

          <div className={styles.audiobookCard}>
            <h3>오디오북 맛보기</h3>
            {recommendedBook ? (
              <>
                <div className={styles.playerControls}>
                  <button onClick={handlePlayAudio} disabled={isSpeaking}><FaPlay /></button>
                  <button onClick={handlePauseAudio} disabled={!isSpeaking}><FaPause /></button>
                  <button onClick={handleStopAudio}><FaStop /></button>
                </div>
                <select
                  className={styles.voiceSelect}
                  value={selectedVoiceURI || ''}
                  onChange={e => setSelectedVoiceURI(e.target.value)}
                  disabled={voices.length === 0}
                >
                  {voices.length > 0 ? (
                    voices.map((voice, index) => {
                      const mockVoice = MOCK_VOICES[userMode][index % MOCK_VOICES[userMode].length];
                      return <option key={voice.voiceURI} value={voice.voiceURI}>{mockVoice.name}</option>;
                    })
                  ) : (
                    <option>사용 가능한 음성 없음</option>
                  )}
                </select>
              </>
            ) : (
              <div className={styles.placeholder}>
                <p>책이 추천되면 오디오북도 들을 수 있어요.</p>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

export default Chat;