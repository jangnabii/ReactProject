import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBook } from 'react-icons/fa';
import styles from './Home.module.css';

// Mock data
const PROFILE_IMAGE_BY_MODE: { [key: string]: string } = {
  child: '/icons/profile_child.png',
  teen: '/icons/profile_teen.png',
  adult: '/icons/profile_adult.png',
  senior: '/icons/profile_senior.png'
};
const RECENT_BOOKS = [
  { id: 1, title: 'The Little Prince', cover: 'https://via.placeholder.com/150/FFC0CB/000000?Text=Book1' },
  { id: 2, title: 'Demian', cover: 'https://via.placeholder.com/150/ADD8E6/000000?Text=Book2' },
  { id: 3, title: 'The Alchemist', cover: 'https://via.placeholder.com/150/90EE90/000000?Text=Book3' },
  { id: 4, title: 'Book 4', cover: 'https://via.placeholder.com/150/90EE90/000000?Text=Book4' },
];

function Home() {
  const [userName, setUserName] = useState('');
  const [userMode, setUserMode] = useState('adult');
  const [attendance, setAttendance] = useState<string[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const name = localStorage.getItem('userName') || '사용자';
    const mode = localStorage.getItem('userMode') || 'adult';
    const storedAttendance = JSON.parse(localStorage.getItem('attendance') || '[]');

    setUserName(name);
    setUserMode(mode);

    const today = new Date().toISOString().split('T')[0];
    if (!storedAttendance.includes(today)) {
      const updatedAttendance = [...storedAttendance, today];
      setAttendance(updatedAttendance);
      localStorage.setItem('attendance', JSON.stringify(updatedAttendance));
    } else {
      setAttendance(storedAttendance);
    }
  }, []);

  const renderCalendar = () => {
    // ... (calendar rendering logic is unchanged)
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();

    const calendarDays = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
      calendarDays.push(<div key={`empty-${i}`} className={`${styles.calendarDay} ${styles.emptyDay}`}></div>);
    }
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const isAttended = attendance.includes(dateStr);
      const isToday = new Date().toISOString().split('T')[0] === dateStr;
      const dayClasses = [ styles.calendarDay, isToday ? styles.today : '', isAttended ? styles.attended : '' ].join(' ');
      calendarDays.push(<div key={day} className={dayClasses}>{day}</div>);
    }
    return calendarDays;
  };

  return (
    <div className={styles.container}>
      {/* Top Section */}
      <section className={styles.topSection}>
        <div className={styles.profile}>
          <img
            src={PROFILE_IMAGE_BY_MODE[userMode]}
            alt={`${userMode} profile`}
            className={styles.profileImage}
            onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/80'; }}
          />
          <div>
            <h1>{userName}님, 환영합니다!</h1>
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
          <h2>이번 달 출석률: {Math.round((attendance.length / 30) * 100)}%</h2>
          <div className={styles.calendarGrid}>
            <div className={styles.calendarHeader}>일</div> <div className={styles.calendarHeader}>월</div> <div className={styles.calendarHeader}>화</div> <div className={styles.calendarHeader}>수</div> <div className={styles.calendarHeader}>목</div> <div className={styles.calendarHeader}>금</div> <div className={styles.calendarHeader}>토</div>
            {renderCalendar()}
          </div>
        </section>
        <section className={styles.libraryCard}>
          <div className={styles.libraryHeader}>
            <h2>서재</h2>
            <span onClick={() => navigate('/bookshelf')}>더 보기</span>
          </div>
          <div className={styles.bookList}>
            {RECENT_BOOKS.map(book => (
              <div key={book.id} className={styles.bookItem}>
                <img src={book.cover} alt={book.title} />
                <p>{book.title}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

export default Home;