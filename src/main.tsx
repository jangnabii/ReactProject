import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './index.css';
import App from './App';
import Login from './pages/Login';
import ModeSelection from './pages/ModeSelection';
import Home from './pages/Home';
import Bookshelf from './pages/Bookshelf';
import BookLog from './pages/BookLog'; // Import the BookLog component
import Chat from './pages/Chat';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        path: '',
        element: <Login />,
      },
      {
        path: 'mode',
        element: <ModeSelection />,
      },
      {
        path: 'home',
        element: <Home />,
      },
      {
        path: 'bookshelf',
        element: <Bookshelf />,
      },
      {
        // Dynamic route for individual book logs
        path: 'book-log/:bookId',
        element: <BookLog />,
      },
      {
        path: 'chat',
        element: <Chat />,
      },
    ],
  },
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
