import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Book, BookLog as BookLogType } from '../types';
import { getBookLog, saveUserReview } from '../api/mock';
import styles from './BookLog.module.css';

function BookLog() {
  const { bookId } = useParams<{ bookId: string }>();
  const [book, setBook] = useState<Book | null>(null);
  const [log, setLog] = useState<BookLogType | null>(null);
  const [userReview, setUserReview] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    if (!bookId) {
      setError('Book ID not found.');
      setLoading(false);
      return;
    }

    getBookLog(bookId)
      .then(data => {
        if (data) {
          setBook(data.book);
          setLog(data.log);
          setUserReview(data.log.userReview);
        } else {
          setError('Book or log not found.');
        }
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to fetch book log.');
        setLoading(false);
      });
  }, [bookId]);

  const handleSave = () => {
    if (!bookId) return;
    
    setFeedback('Saving...');
    saveUserReview(bookId, userReview)
      .then(updatedLog => {
        setLog(updatedLog);
        setFeedback('저장되었습니다!');
        setTimeout(() => setFeedback(''), 3000);
      })
      .catch(() => {
        setFeedback('저장에 실패했습니다.');
      });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
  }

  if (loading) {
    return <div className={styles.loading}>Loading...</div>;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  if (!book || !log) {
    return <div className={styles.error}>Could not display book log.</div>;
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <img src={book.coverImageUrl} alt={book.title} className={styles.bookCover} />
        <div className={styles.bookInfo}>
          <h1>{book.title}</h1>
          <p>by {book.author}</p>
          <p style={{color: '#888', fontSize: '0.9rem'}}>추천받은 날짜: {formatDate(book.addedAt)}</p>
          <Link to="/bookshelf" className={styles.backLink}>← 서재로 돌아가기</Link>
        </div>
      </header>

      <main className={styles.content}>
        <section className={styles.aiSummary}>
          <h2>AI 감정 요약</h2>
          <p>이 책을 추천받을 때의 대화를 기반으로 AI가 분석한 감정 요약입니다.</p>
          <blockquote className={styles.summaryQuote}>
            "{log.aiSummary.quote}"
          </blockquote>
          <strong>주요 감정: {log.aiSummary.emotion}</strong>
          <div className={styles.keywords}>
            {log.aiSummary.keywords.map(kw => <span key={kw} className={styles.keyword}>{kw}</span>)}
          </div>
          <p style={{marginTop: '1rem'}}><b>추천 이유:</b> {log.aiSummary.reason}</p>
        </section>

        <section className={styles.userReview}>
          <h2>나의 독서록</h2>
          <textarea
            className={styles.textarea}
            value={userReview}
            onChange={(e) => setUserReview(e.target.value)}
            placeholder="아직 독서록이 없습니다. 읽고 느낀 점을 적어보세요."
          />
          <button onClick={handleSave} className={styles.saveButton}>
            저장하기
          </button>
          {feedback && <p className={styles.feedback}>{feedback}</p>}
        </section>
      </main>
    </div>
  );
}

export default BookLog;