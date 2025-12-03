import { useEffect, useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';

function App() {
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const user = localStorage.getItem('nl_current_user');
    if (user) {
      setCurrentUser(user);
    } else {
      // 로그인이 필요한 페이지에 접근 시 리디렉션
      const protectedRoutes = ['/mode', '/home', '/bookshelf', '/book-log', '/chat'];
      if (protectedRoutes.some(route => location.pathname.startsWith(route))) {
        navigate('/');
      }
    }
  }, [location.pathname, navigate]);

  const handleLogout = () => {
    localStorage.removeItem('nl_current_user');
    setCurrentUser(null);
    navigate('/');
  };

  return (
    <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <Outlet context={{ currentUser, handleLogout }} />
    </main>
  );
}

export default App;
