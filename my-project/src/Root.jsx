import { useState } from 'react';
import App from './App.jsx';
import LoginForm from './components/LoginForm.jsx';
import { api, TOKEN_KEY } from './api';

export default function Root() {
  const [loggedIn, setLoggedIn] = useState(!!localStorage.getItem(TOKEN_KEY));

  async function logout() {
    try {
      await api.post('/auth/logout');
    } finally {
      localStorage.removeItem(TOKEN_KEY);
      setLoggedIn(false);
    }
  }

  if (!loggedIn) return <LoginForm onLoggedIn={() => setLoggedIn(true)} />;

  return (
    <>
      <button onClick={logout}>Log out</button>
      <App />
    </>
  );
}