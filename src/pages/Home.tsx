import { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { FaBook, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import styles from './Home.module.css';
import type { Book } from '../types';

function Home() {
  const { currentUser } = useOutletContext<{ currentUser: string | null }>();
  const [attendance, setAttendance] = useState<string[]>([]);
  const [recentBooks, setRecentBooks] = useState<Book[]>([]);
  const [displayDate, setDisplayDate] = useState(new Date());
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) return;

    // --- Per-user Attendance Logic ---
    const attendanceKey = `attendance_${currentUser}`;
    const storedAttendance = JSON.parse(localStorage.getItem(attendanceKey) || '[]');
    setAttendance(storedAttendance);

    const today = new Date().toISOString().split('T')[0];
    if (!storedAttendance.includes(today)) {
      const updatedAttendance = [...storedAttendance, today];
      setAttendance(updatedAttendance);
      localStorage.setItem(attendanceKey, JSON.stringify(updatedAttendance));
    }
    
    // --- Per-user Bookshelf Logic ---
    const bookshelfKey = `bookshelf_${currentUser}`;
    const storedBooks: Book[] = JSON.parse(localStorage.getItem(bookshelfKey) || '[]');
    setRecentBooks(storedBooks.slice(-4).reverse());

  }, [currentUser]);

  const handlePrevMonth = () => {
    setDisplayDate(prevDate => new Date(prevDate.getFullYear(), prevDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setDisplayDate(prevDate => new Date(prevDate.getFullYear(), prevDate.getMonth() + 1, 1));
  };

  const renderCalendar = () => {
    const year = displayDate.getFullYear();
    const month = displayDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();

    const calendarDays = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
      calendarDays.push(<div key={`empty-${i}`} className={`${styles.calendarDay} ${styles.emptyDay}`}></div>);
    }
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const isAttended = attendance.includes(dateStr);
      const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();
      
      const dayClasses = [ styles.calendarDay, isToday ? styles.today : '' ].join(' ');
      
      calendarDays.push(
        <div key={day} className={dayClasses}>
          {day}
          {isAttended && <span className={styles.attendanceMarker}>📚</span>}
        </div>
      );
    }
    return calendarDays;
  };
  
  const getAttendanceForMonth = () => {
    const year = displayDate.getFullYear();
    const month = displayDate.getMonth() + 1;
    return attendance.filter(date => date.startsWith(`${year}-${String(month).padStart(2, '0')}`)).length;
  }

  return (
    <div className={styles.container}>
      {/* Top Section */}
      <section className={styles.topSection}>
        <div className={styles.profile}>
          <img
            src="/profile.png"
            alt="profile"
            className={styles.profileImage}
            onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/80'; }}
          />
          <div>
            <h1>{currentUser || '사용자'}님, 환영합니다!</h1>
            <p>오늘도 책으로 마음을 정리해볼까요?</p>
          </div>
        </div>
        <button
          onClick={() => navigate('/chat')}
          className={styles.chatButton}
        >
          <FaBook />
          대화 시작하기
        </button>
      </section>

      {/* Main Content */}
      <main className={styles.mainContent}>
        <section className={styles.calendarCard}>
          <div className={styles.calendarNav}>
            <button onClick={handlePrevMonth} className={styles.navButton}><FaChevronLeft /></button>
            <h2 className={styles.calendarTitle}>{`${displayDate.getFullYear()}년 ${displayDate.getMonth() + 1}월`}</h2>
            <button onClick={handleNextMonth} className={styles.navButton}><FaChevronRight /></button>
          </div>
          <h3>출석률: {Math.round((getAttendanceForMonth() / new Date(displayDate.getFullYear(), displayDate.getMonth() + 1, 0).getDate()) * 100)}%</h3>
          <div className={styles.calendarGrid}>
            <div className={styles.calendarHeader}>일</div> <div className={styles.calendarHeader}>월</div> <div className={styles.calendarHeader}>화</div> <div className={styles.calendarHeader}>수</div> <div className={styles.calendarHeader}>목</div> <div className={styles.calendarHeader}>금</div> <div className={styles.calendarHeader}>토</div>
            {renderCalendar()}
          </div>
        </section>
        <section className={styles.libraryCard}>
          <div className={styles.libraryHeader}>
            <h2>내 서재</h2>
            <span onClick={() => navigate('/bookshelf')}>더 보기</span>
          </div>
          <div className={styles.bookList}>
            {recentBooks.length > 0 ? (
              recentBooks.map(book => (
                <div key={book.id} className={styles.bookItem}>
                  <div className={styles.bookIcon}>📚</div>
                  <p>{book.title}</p>
                </div>
              ))
            ) : (
              <p className={styles.noBooksMessage}>아직 서재에 책이 없습니다.</p>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default Home;