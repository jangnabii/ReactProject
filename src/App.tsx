import { Outlet } from 'react-router-dom';

function App() {
  return (
    // This main container will ensure that all pages are rendered within a flexbox
    // context that can properly fill the screen height.
    <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <Outlet />
    </main>
  );
}

export default App;
