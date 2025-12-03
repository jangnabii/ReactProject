import { useState, useEffect, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import { FaPlay, FaPause, FaStop, FaPaperPlane } from 'react-icons/fa';
import styles from './Chat.module.css';
import type { Book } from '../types';
import { MOCK_VOICES } from '../api/mockChat';
import { getAiResponse } from '../api/ai';
import type { AiResponse } from '../api/ai';
import HomeBackButton from '../components/HomeBackButton';

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
  const [showAudioPlayer, setShowAudioPlayer] = useState(false);
  const [audioState, setAudioState] = useState({ playing: false, progress: 0 });
  const [selectedVoice, setSelectedVoice] = useState('');
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [feedback, setFeedback] = useState('');


  const messageListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mode = localStorage.getItem('userMode') || 'adult';
    const initialGreeting = {
      child: '안녕! 오늘 어떤 신나는 이야기를 해볼까?',
      teen: '안녕하세요! 어떤 이야기든 편하게 털어놓아도 괜찮아요.',
      adult: '안녕하세요. 오늘 어떤 이야기를 나누고 싶으신가요?',
      senior: '안녕하세요, 어르신. 오늘 하루는 어떠셨나요?'
    }[mode];

    setUserMode(mode);
    setSelectedVoice(MOCK_VOICES[mode][0].id);
    setMessages([{ from: 'ai', text: initialGreeting }]);
  }, []);

  useEffect(() => {
    if (messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (userInput.trim() === '' || isAiThinking) return;

    const newMessages: Message[] = [...messages, { from: 'user', text: userInput }];
    setMessages(newMessages);
    setUserInput('');
    setIsAiThinking(true);
    setFeedback('');

    setTimeout(async () => {
      const aiResponse: AiResponse = await getAiResponse(userInput, newMessages, userMode);

      setMessages(prev => [...prev, { from: 'ai', text: aiResponse.responseText }]);

      if (aiResponse.recommendedBook) {
        setRecommendedBook(aiResponse.recommendedBook);
      } else if (aiResponse.recommendedBook === null) {
        setRecommendedBook(null);
      }
      setIsAiThinking(false);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const handleAddToBookshelf = () => {
    if (!recommendedBook || !currentUser) {
      setFeedback('로그인이 필요합니다.');
      return;
    };

    const bookshelfKey = `bookshelf_${currentUser}`;
    const storedBooks: Book[] = JSON.parse(localStorage.getItem(bookshelfKey) || '[]');

    if (storedBooks.some(b => b.id === recommendedBook.id)) {
      setFeedback('이미 서재에 있는 책입니다.');
      return;
    }

    const updatedBooks = [...storedBooks, recommendedBook];
    localStorage.setItem(bookshelfKey, JSON.stringify(updatedBooks));

    setFeedback(`'${recommendedBook.title}'을(를) 서재에 추가했습니다!`);
    setShowAudioPlayer(true); // "오디오북" 플레이어를 보여줍니다.
  };

  const handleRetryRecommendation = async () => {
    if (isAiThinking) return;
    const newMessages: Message[] = [...messages, { from: 'user', text: '다시 추천해줘' }];
    setMessages(newMessages);
    setIsAiThinking(true);

    setTimeout(async () => {
      const aiResponse: AiResponse = await getAiResponse('다시 추천해줘', newMessages, userMode);
      setMessages(prev => [...prev, { from: 'ai', text: aiResponse.responseText }]);
      if (aiResponse.recommendedBook) {
        setRecommendedBook(aiResponse.recommendedBook);
      }
      setIsAiThinking(false);
    }, 1000);
  };

  return (
    <div className={styles.pageContainer} data-mode={userMode}>
      <div className="p-4 bg-white border-b shadow-sm">
        <div className="max-w-3xl mx-auto">
          <HomeBackButton />
        </div>
      </div>
      <div className={styles.chatLayout}>
        <main className={styles.chatArea}>
          <div className={styles.messageList} ref={messageListRef}>
            {messages.map((msg, index) => (
              <div key={index} className={`${styles.message} ${styles[msg.from]}`}>
                {msg.text}
              </div>
            ))}
            {isAiThinking && <div className={`${styles.message} ${styles.ai}`}>...</div>}
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
            <button className={styles.sendButton} onClick={handleSendMessage} disabled={isAiThinking}>
              <FaPaperPlane />
            </button>
          </div>
        </main>

        <aside className={styles.sidebar}>
          {feedback && <div className={styles.feedbackCard}>{feedback}</div>}
          {recommendedBook && (
            <div className={styles.recommendationCard}>
              <h3>AI 추천 도서</h3>
              {recommendedBook.coverImage ? (
                <img
                  src={recommendedBook.coverImage}
                  alt={recommendedBook.title}
                  className={styles.bookCover}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling?.classList.remove(styles.hidden);
                  }}
                />
              ) : null}
              <div className={`${styles.bookIcon} ${recommendedBook.coverImage ? styles.hidden : ''}`}>📚</div>
              <h4>{recommendedBook.title}</h4>
              <p>저자: {recommendedBook.author || '정보 없음'}</p>
              <p>출판년도: {recommendedBook.pubYear || '정보 없음'}</p>
              <div className={styles.buttonGroup}>
                <button className={styles.addBtn} onClick={handleAddToBookshelf}>이 책 읽어볼게요</button>
                <button className={styles.retryBtn} onClick={handleRetryRecommendation}>다시 추천</button>
              </div>
            </div>
          )}

          {showAudioPlayer && recommendedBook && (
            <div className={styles.audiobookCard}>
              <h3>{recommendedBook.title} 오디오북</h3>
              <p className={styles.mockInfo}>(오디오북 기능은 현재 지원되지 않는 목업입니다.)</p>
              <div className={styles.playerControls}>
                <button><FaPlay /></button>
                <button><FaPause /></button>
                <button><FaStop /></button>
              </div>
              <input type="range" className={styles.progressBar} value={audioState.progress} readOnly />
              <select
                className={styles.voiceSelect}
                value={selectedVoice}
                onChange={e => setSelectedVoice(e.target.value)}
              >
                {MOCK_VOICES[userMode].map(voice => (
                  <option key={voice.id} value={voice.id}>{voice.name}</option>
                ))}
              </select>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

export default Chat;