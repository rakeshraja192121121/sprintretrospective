"use client";
import { useState } from "react";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isInvalid, setIsInvalid] = useState(false);

  const users = [
    { username: "admin", password: "admin123" },
    { username: "john", password: "john123" },
    { username: "mary", password: "mary123" },
    { username: "guest", password: "guest123" },
  ];

  const handleLogin = (e) => {
    e.preventDefault();
    const match = users.find(
      (u) => u.username === username && u.password === password
    );
    if (match) {
      setIsInvalid(false);
      alert(`Welcome ${username}! ✅`);
    } else {
      setIsInvalid(true);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="w-full max-w-sm p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Login
        </h2>
        {isInvalid && (
          <div className="mb-4 text-sm text-red-600 bg-red-100 p-2 rounded">
            ❌ Invalid username or password
          </div>
        )}
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-1">Username</label>
            <input
              type="text"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 mb-1">Password</label>
            <input
              type="password"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-indigo-500 text-white py-2 rounded-lg hover:bg-indigo-600 transition-colors"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
