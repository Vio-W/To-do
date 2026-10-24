import { useState } from "react";
import { api, TOKEN_KEY } from "../api";

export default function LoginForm({ onLoggedIn }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      const { data } = await api.post("/auth/login", { email, password });
      localStorage.setItem(TOKEN_KEY, data.accessToken);
      onLoggedIn();
    } catch {
      setError("Invalid credentials");
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>Log in</h2>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button type="submit">Log in</button>
      {error && <p>{error}</p>}
    </form>
  );
}