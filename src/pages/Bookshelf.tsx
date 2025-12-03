import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Book } from '../types';
import { getBookshelf } from '../api/mock';
import styles from './Bookshelf.module.css';

function Bookshelf() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getBookshelf().then(data => {
      setBooks(data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <div className={styles.container}><p>Loading bookshelf...</p></div>;
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>나의 서재</h1>
      <div className={styles.grid}>
        {books.map(book => (
          <Link to={`/book-log/${book.bookId}`} key={book.bookId} className={styles.bookCard}>
            <img src={book.coverImageUrl} alt={book.title} className={styles.coverImage} />
            <div className={styles.bookTitle}>{book.title}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default Bookshelf;