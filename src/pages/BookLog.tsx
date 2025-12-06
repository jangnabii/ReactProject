import { useState, useEffect } from 'react';
import { useParams, Link, useOutletContext } from 'react-router-dom';
import type { Book, BookLog } from '../types';
import styles from './BookLog.module.css';
import HomeBackButton from '../components/HomeBackButton.tsx';

// Component for the book search/recommendation feature
function BookRecommendation() {
  const { currentUser } = useOutletContext<{ currentUser: string | null }>();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState('');
  
  const handleSearch = async () => {
    if (!query) {
      setFeedback('검색어를 입력하세요.');
      return;
    }
    setLoading(true);
    setFeedback('');
    try {
      // For manual search, we can use a generic mode or a specific one
      const response = await fetch(`/api/books/recommend?query=${encodeURIComponent(query)}&mode=adult`);
      if (!response.ok) {
        throw new Error('서버에서 오류가 발생했습니다.');
      }
      const data: Book[] = await response.json();
      setResults(data);
      if (data.length === 0) {
        setFeedback('검색 결과가 없습니다.');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
      setFeedback(`오류: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };
  
  const handleAddBook = (book: Book) => {
    if (!currentUser) {
      setFeedback('로그인이 필요합니다.');
      return;
    }
    const bookshelfKey = `bookshelf_${currentUser}`;
    const storedBooks: Book[] = JSON.parse(localStorage.getItem(bookshelfKey) || '[]');
    
    if (storedBooks.some(storedBook => storedBook.id === book.id)) {
        setFeedback('이미 서재에 있는 책입니다.');
        setTimeout(() => setFeedback(''), 3000);
        return;
    }

    // 1. Add book to bookshelf
    const updatedBooks = [...storedBooks, book];
    localStorage.setItem(bookshelfKey, JSON.stringify(updatedBooks));
    
    // 2. Add a corresponding default BookLog
    const bookLogKey = `booklogs_${currentUser}`;
    const storedBookLogs: BookLog[] = JSON.parse(localStorage.getItem(bookLogKey) || '[]');
    const newLog: BookLog = {
      id: book.id,
      userId: currentUser,
      aiSummary: {
        emotion: '직접 추가',
        userConcern: 'N/A',
        recommendationReason: '도서 검색을 통해 직접 추가한 책입니다.',
      },
      userReview: '',
      recommendedDate: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
    };
    localStorage.setItem(bookLogKey, JSON.stringify([...storedBookLogs, newLog]));

    setFeedback(`'${book.title}'을(를) 서재에 추가했습니다.`);
    setTimeout(() => setFeedback(''), 3000);
  };

  return (
    <div className={styles.container}>
      <div className="mb-4">
        <HomeBackButton />
      </div>
      <h1 className={styles.title}>도서 검색 및 추천</h1>
      <div className={styles.searchSection}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="책 제목을 검색하세요"
          className={styles.searchInput}
        />
        <button onClick={handleSearch} disabled={loading} className={styles.searchButton}>
          {loading ? '검색 중...' : '검색'}
        </button>
      </div>

      {feedback && <p className={styles.feedback}>{feedback}</p>}

      <div className={styles.resultsGrid}>
        {results.map((book) => (
          <div key={book.id} className={styles.resultCard}>
            <h3>{book.title}</h3>
            <p>저자: {book.author || '정보 없음'}</p>
            <p>출판사: {book.publisher || '정보 없음'}</p>
            <p>출판년도: {book.pubYear || '정보 없음'}</p>
            <button onClick={() => handleAddBook(book)} className={styles.addButton}>
              서재에 추가
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}


// Component for displaying the log of a single book (Restored and Refactored)
function BookLogDetail() {
  const { bookId } = useParams<{ bookId: string }>();
  const { currentUser } = useOutletContext<{ currentUser: string | null }>();
  const [book, setBook] = useState<Book | null>(null);
  const [bookLog, setBookLog] = useState<BookLog | null>(null);
  const [reviewText, setReviewText] = useState('');
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser && bookId) {
      // Fetch Book data from bookshelf
      const bookshelfKey = `bookshelf_${currentUser}`;
      const storedBooks: Book[] = JSON.parse(localStorage.getItem(bookshelfKey) || '[]');
      const foundBook = storedBooks.find(b => b.id === bookId);
      setBook(foundBook || null);

      // Fetch BookLog data
      const bookLogKey = `booklogs_${currentUser}`;
      const storedBookLogs: BookLog[] = JSON.parse(localStorage.getItem(bookLogKey) || '[]');
      const foundBookLog = storedBookLogs.find(log => log.id === bookId);
      setBookLog(foundBookLog || null);
      
      // Initialize textarea with existing review or empty string
      setReviewText(foundBookLog?.userReview || '');
    }
    setLoading(false);
  }, [currentUser, bookId]);

  const handleSaveReview = () => {
    if (!currentUser || !book) return;

    const bookLogKey = `booklogs_${currentUser}`;
    const storedBookLogs: BookLog[] = JSON.parse(localStorage.getItem(bookLogKey) || '[]');
    const logExists = storedBookLogs.some(log => log.id === book.id);
    
    let updatedLogs: BookLog[];

    if (logExists) {
      // Update existing log
      updatedLogs = storedBookLogs.map(log => {
        if (log.id === book.id) {
          return { ...log, userReview: reviewText, lastUpdated: new Date().toISOString() };
        }
        return log;
      });
    } else {
      // Create new log for a book that didn't have one
      const newLog: BookLog = {
        id: book.id,
        userId: currentUser,
        aiSummary: { // AI summary is not available for old/manual books
          emotion: 'N/A',
          userConcern: 'N/A',
          recommendationReason: 'AI 추천으로 추가된 책이 아닙니다.',
        },
        userReview: reviewText,
        recommendedDate: new Date().toISOString(), // Or use a book's added date if available
        lastUpdated: new Date().toISOString(),
      };
      updatedLogs = [...storedBookLogs, newLog];
    }

    localStorage.setItem(bookLogKey, JSON.stringify(updatedLogs));
    const updatedLog = updatedLogs.find(log => log.id === book.id);
    setBookLog(updatedLog || null); // Update state to reflect change

    setFeedback('독서 소감이 저장되었습니다!');
    setTimeout(() => setFeedback(''), 3000);
  };

  if (loading) {
    return <div className={styles.container}><p>독서 기록을 불러오는 중...</p></div>;
  }

  // If the book itself is not found in the bookshelf, it's an error.
  if (!book) {
    return <div className={styles.container}><p>서재에서 책을 찾을 수 없습니다.</p><Link to="/bookshelf" className={styles.backLink}>← 서재로 돌아가기</Link></div>;
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.bookInfo}>
          <div className={styles.coverImagePlaceholder}>📚</div>
          <div>
            <h1>{book.title}</h1>
            <p><strong>저자:</strong> {book.author}</p>
            {bookLog && <p><strong>추천 날짜:</strong> {new Date(bookLog.recommendedDate).toLocaleDateString()}</p>}
          </div>
        </div>
        <Link to="/bookshelf" className={styles.backLink}>← 서재로 돌아가기</Link>
      </header>
      
      <main className={styles.content}>
        <section className={styles.aiSummary}>
          <h2>AI 감정 요약</h2>
          {bookLog ? (
            <>
              <p><strong>주요 감정:</strong> {bookLog.aiSummary.emotion}</p>
              <p><strong>사용자의 고민:</strong> "{bookLog.aiSummary.userConcern}"</p>
              <p><strong>AI의 추천 메시지:</strong> "{bookLog.aiSummary.recommendationReason}"</p>
            </>
          ) : (
            <p>이 책에 대한 AI 감정 요약이 없습니다. (AI 추천을 통해 추가된 책이 아닐 수 있습니다.)</p>
          )}
        </section>

        <section className={styles.userReview}>
          <h2>나의 독서 소감</h2>
          <textarea
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            placeholder="이 책을 읽고 어떤 생각이 들었나요? 자유롭게 감상을 남겨보세요."
            className={styles.reviewTextarea}
          />
          <button onClick={handleSaveReview} className={styles.saveButton}>소감 저장하기</button>
          {feedback && <p className={styles.feedbackMessage}>{feedback}</p>}
          {bookLog && <p className={styles.timestamp}>최종 수정: {new Date(bookLog.lastUpdated).toLocaleString()}</p>}
        </section>
      </main>
    </div>
  );
}


// Main component that decides which view to render
function BookLog() {
  const { bookId } = useParams<{ bookId: string }>();

  // If a bookId is present in the URL, show the detail page.
  // Otherwise, show the recommendation/search page.
  return bookId ? <BookLogDetail /> : <BookRecommendation />;
}

export default BookLog;