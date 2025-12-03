import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Login.module.css';

function Login() {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const storedName = localStorage.getItem('userName');
    if (storedName) {
      setName(storedName);
    }
  }, []);

  const handleLogin = () => {
    if (name.trim() === '') {
      setError('이름을 입력해 주세요');
      return;
    }
    setError('');
    localStorage.setItem('userName', name);
    navigate('/mode');
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.loginCard}>
        <div className={styles.titleSection}>
          <h1>AI 독서치료</h1>
          <p>이름을 입력하고 마음을 돌보는 독서 여정을 시작하세요.</p>
        </div>

        <div className={styles.formSection}>
          <div className={styles.inputWrapper}>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="이름을 입력해 주세요"
              className={`${styles.input} ${error ? styles.error : ''}`}
              aria-label="이름 입력 필드"
            />
            {error && <p className={styles.errorMessage}>{error}</p>}
          </div>
          <button
            onClick={handleLogin}
            className={styles.button}
          >
            시작하기
          </button>
          <p className={styles.infoText}>입력한 이름은 다음 방문 시 자동으로 불러옵니다.</p>
        </div>
      </div>
    </div>
  );
}

export default Login;