"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { trackEvent } from "@/lib/tracker";

export default function LoginControl() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isInvalid, setIsInvalid] = useState(false);

  const router = useRouter();

  const users = [
    { username: "admin", password: "admin123" },
    { username: "infinite", password: "infinite@123" },
  ];

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const match = users.find(
      (u) => u.username === username && u.password === password
    );
    if (match) {
      trackEvent("clicked login btn ", {
        username: username,
        password: password,
      });

      setUsername("");
      setPassword("");
      setIsInvalid(false);
      localStorage.setItem("loggedInUser", match.username);
      router.push("/PRD");
    } else {
      trackEvent("clicked login btn", {
        error: "credentials was not matching",
      });
      setIsInvalid(true);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white rounded-2xl shadow-lg w-96">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
          Login
        </h2>

        {isInvalid && (
          <div className="mb-4 text-red-600 text-sm text-center">
            Invalid username or password
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-lg"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-lg"
            required
          />
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-3 rounded-lg text-lg font-semibold hover:bg-indigo-700 transition duration-200"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
