"use client";
import { useState } from "react";

export default function LoginControl() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState(null); // stores logged-in user object
  const [showPopover, setShowPopover] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isInvalid, setIsInvalid] = useState(false);

  const users = [
    { username: "admin", password: "admin123" },
    { username: "john", password: "john123" },
    { username: "mary", password: "mary123" },
    { username: "guest", password: "guest123" },
  ];

  const getInitials = (name) => {
    return name.slice(0, 2).toUpperCase();
  };

  const handleLogin = (e) => {
    e.preventDefault();
    const match = users.find(
      (u) => u.username === username && u.password === password
    );
    if (match) {
      setUser(match);
      setUsername("");
      setPassword("");
      setIsInvalid(false);
    } else {
      setIsInvalid(true);
    }
  };

  const confirmLogout = () => {
    setUser(null);
    setShowLogoutConfirm(false);
  };

  return (
    <div className="relative">
      {/* If NOT logged in — show login form inline */}
      {!user && (
        <div className="p-4 bg-white rounded shadow-md w-72">
          <h2 className="text-lg font-semibold mb-4 text-center">Login</h2>
          {isInvalid && (
            <div className="mb-3 text-red-600 text-sm text-center">
              Invalid username or password
            </div>
          )}
          <form onSubmit={handleLogin} className="space-y-3">
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full border p-2 rounded focus:outline-none"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border p-2 rounded focus:outline-none"
              required
            />
            <button
              type="submit"
              className="w-full bg-indigo-500 text-white py-2 rounded hover:bg-indigo-600"
            >
              Login
            </button>
          </form>
        </div>
      )}

      {/* If logged in — show avatar */}
      {user && (
        <div className="relative">
          <div
            onClick={() => setShowPopover((prev) => !prev)}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-indigo-500 text-white cursor-pointer select-none"
          >
            {getInitials(user.username)}
          </div>

          {/* Popover */}
          {showPopover && (
            <div className="absolute right-0 mt-2 w-48 bg-white border rounded shadow-md text-sm z-10">
              <div className="p-3 border-b text-gray-700">
                Logged in as <br />
                <span className="font-bold">{user.username}</span>
              </div>
              <button
                className="w-full text-left px-3 py-2 hover:bg-red-50 text-red-600"
                onClick={() => {
                  setShowPopover(false);
                  setShowLogoutConfirm(true);
                }}
              >
                Log out
              </button>
            </div>
          )}
        </div>
      )}

      {/* Logout confirmation modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-20">
          <div className="bg-white p-6 rounded shadow-lg w-80 text-center">
            <p className="mb-4">Are you sure you want to log out?</p>
            <div className="flex justify-center space-x-3">
              <button
                onClick={confirmLogout}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Yes, log out
              </button>
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
