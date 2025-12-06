import { useState, useEffect } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import type { Book } from '../types';
import styles from './Bookshelf.module.css';
import HomeBackButton from '../components/HomeBackButton.tsx';

function Bookshelf() {
  const { currentUser } = useOutletContext<{ currentUser: string | null }>();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser) {
      const bookshelfKey = `bookshelf_${currentUser}`;
      const storedBooks = JSON.parse(localStorage.getItem(bookshelfKey) || '[]');
      setBooks(storedBooks);
    }
    setLoading(false);
  }, [currentUser]);

  const handleRemoveBook = (bookIdToRemove: string) => {
    if (!currentUser) return;
    const bookshelfKey = `bookshelf_${currentUser}`;
    const updatedBooks = books.filter(book => book.id !== bookIdToRemove);
    setBooks(updatedBooks);
    localStorage.setItem(bookshelfKey, JSON.stringify(updatedBooks));
  };

  if (loading) {
    return <div className={styles.container}><p>서재를 불러오는 중...</p></div>;
  }

  return (
    <div className={styles.container}>
      <div className="mb-4">
        <HomeBackButton />
      </div>
      <h1 className={styles.title}>{currentUser}의 서재</h1>
      <div className={styles.grid}>
        {books.length > 0 ? books.map(book => (
          <div key={book.id} className={styles.bookCardWrapper}>
            <Link to={`/book-log/${book.id}`} className={styles.bookCard}>
              {/* API 응답에 표지 이미지가 없으므로 임시 아이콘을 표시합니다. */}
              <div className={styles.coverImagePlaceholder}>📚</div>
              <div className={styles.bookTitle}>{book.title}</div>
            </Link>
            <button 
              onClick={() => handleRemoveBook(book.id)}
              className={styles.removeButton}
            >
              삭제
            </button>
          </div>
        )) : <p>서재에 책이 없습니다.</p>}
      </div>
    </div>
  );
}

export default Bookshelf;