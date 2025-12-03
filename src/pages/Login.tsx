import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Login.module.css';

function Login() {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false); // 회원가입 모드 상태
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleAuth = () => {
    if (name.trim() === '' || password.trim() === '') {
      setError('이름과 비밀번호를 모두 입력해 주세요.');
      return;
    }
    setError('');

    const users = JSON.parse(localStorage.getItem('nl_users') || '[]');
    const userExists = users.find((user: { name: string }) => user.name === name);

    if (isSignUp) {
      // 회원가입 로직
      if (userExists) {
        setError('이미 존재하는 사용자 이름입니다.');
      } else {
        const newUser = { name, password };
        localStorage.setItem('nl_users', JSON.stringify([...users, newUser]));
        localStorage.setItem('nl_current_user', name);
        navigate('/mode');
      }
    } else {
      // 로그인 로직
      const user = users.find((user: { name: string; password_hidden: string }) => user.name === name && user.password === password);
      if (user) {
        localStorage.setItem('nl_current_user', name);
        navigate('/mode');
      } else {
        setError('이름 또는 비밀번호가 올바르지 않습니다.');
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleAuth();
    }
  };
  
  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setError('');
  }

  return (
    <div className={styles.container}>
      <div className={styles.loginCard}>
        <div className={styles.titleSection}>
          <h1>AI 독서치료</h1>
          <p>{isSignUp ? '사용할 이름과 비밀번호를 입력하세요.' : '이름과 비밀번호로 로그인하세요.'}</p>
        </div>

        <div className={styles.formSection}>
          <div className={styles.inputWrapper}>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="이름"
              className={`${styles.input} ${error ? styles.error : ''}`}
              aria-label="이름 입력 필드"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="비밀번호"
              className={`${styles.input} ${error ? styles.error : ''}`}
              aria-label="비밀번호 입력 필드"
            />
            {error && <p className={styles.errorMessage}>{error}</p>}
          </div>
          <button
            onClick={handleAuth}
            className={styles.button}
          >
            {isSignUp ? '회원가입' : '로그인'}
          </button>
          <p className={styles.infoText}>
            {isSignUp ? '이미 계정이 있으신가요?' : '계정이 없으신가요?'}
            <button onClick={toggleMode} className={styles.toggleButton}>
              {isSignUp ? '로그인' : '회원가입'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;