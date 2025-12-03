import { useState, useEffect } from 'react';
import { useParams, Link, useOutletContext } from 'react-router-dom';
import type { Book } from '../types';
// Note: BookLogType and mock APIs are commented out as they are not used in the final version
// import { BookLog as BookLogType } from '../types';
// import { getBookLog, saveUserReview } from '../api/mock';
import styles from './BookLog.module.css';
import HomeBackButton from '../components/HomeBackButton';

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
      const response = await fetch(`/api/books/recommend?query=${encodeURIComponent(query)}`);
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

    const updatedBooks = [...storedBooks, book];
    localStorage.setItem(bookshelfKey, JSON.stringify(updatedBooks));
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


// Component for displaying the log of a single book (Restored)
function BookLogDetail() {
  const { bookId } = useParams<{ bookId: string }>();
  const { currentUser } = useOutletContext<{ currentUser: string | null }>();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (currentUser && bookId) {
      const bookshelfKey = `bookshelf_${currentUser}`;
      const storedBooks: Book[] = JSON.parse(localStorage.getItem(bookshelfKey) || '[]');
      const foundBook = storedBooks.find(b => b.id === bookId);
      
      if (foundBook) {
        setBook(foundBook);
      } else {
        setError('서재에서 책을 찾을 수 없습니다.');
      }
    }
    setLoading(false);
  }, [currentUser, bookId]);


  if (loading) {
    return <div className={styles.loading}>로딩 중...</div>;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  if (!book) {
    return <div className={styles.error}>독서 기록을 표시할 수 없습니다.</div>;
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.bookInfo}>
          <h1>{book.title}</h1>
          <p>저자: {book.author}</p>
          <p>출판사: {book.publisher}</p>
          <p>출판년도: {book.pubYear}</p>
          <Link to="/bookshelf" className={styles.backLink}>← 서재로 돌아가기</Link>
        </div>
      </header>

      <main className={styles.content}>
        {/* The AI summary and user review sections are removed as per the shift in functionality */}
        <section className={styles.userReview}>
          <h2>독서 기록 (기능 업데이트 필요)</h2>
          <p>이 책에 대한 AI 요약 및 독서 기록 기능은 현재 구현에서 제외되었습니다.</p>
          <p>추후 이 공간에 독서록을 작성하는 기능을 추가할 수 있습니다.</p>
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