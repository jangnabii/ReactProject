import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaChild, FaUserFriends, FaUser, FaUserGraduate } from 'react-icons/fa';
import styles from './ModeSelection.module.css';

const MODES = [
  {
    id: 'child',
    title: 'Kids',
    description: '친근한 말투로 공감해 드릴게요.',
    icon: <FaChild size={50} />,
  },
  {
    id: 'teen',
    title: 'Teens',
    description: '비밀 친구처럼 솔직하게 이야기해요.',
    icon: <FaUserFriends size={50} />,
  },
  {
    id: 'adult',
    title: 'Adults',
    description: '차분하게 조언과 해결책을 드릴게요.',
    icon: <FaUser size={50} />,
  },
  {
    id: 'senior',
    title: 'Seniors',
    description: '따뜻하게 회상하며 이야기 나눠요.',
    icon: <FaUserGraduate size={50} />,
  },
];

function ModeSelection() {
  const [selectedMode, setSelectedMode] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedMode = localStorage.getItem('userMode');
    if (storedMode) {
      setSelectedMode(storedMode);
    }
  }, []);

  const handleSelectMode = (mode: string) => {
    setSelectedMode(mode);
  };

  const handleStart = () => {
    if (selectedMode) {
      localStorage.setItem('userMode', selectedMode);
      navigate('/home');
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>어떤 방식으로 대화할까요?</h1>
      <p className={styles.description}>선택한 모드에 따라 AI의 말투와 상담 스타일이 달라집니다.</p>

      <div className={styles.grid}>
        {MODES.map((mode) => (
          <div
            key={mode.id}
            onClick={() => handleSelectMode(mode.id)}
            className={`${styles.card} ${selectedMode === mode.id ? styles.selected : ''}`}
          >
            <div className={styles.icon} aria-label={mode.title}>
              {mode.icon}
            </div>
            <h2 className={styles.cardTitle}>{mode.title}</h2>
            <p className={styles.cardDescription}>{mode.description}</p>
          </div>
        ))}
      </div>

      <button
        onClick={handleStart}
        disabled={!selectedMode}
        className={styles.startButton}
      >
        시작하기
      </button>
      <p className={styles.infoText}>모드는 언제든 대화창에서 변경할 수 있어요.</p>
    </div>
  );
}

export default ModeSelection;