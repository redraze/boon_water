"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = async () => {
    try {
      // TODO: hash password before checking against db
      // const hash = encrypt('sha512', password)

      // TODO: sanitize email address
      // is this necessary with JSON.stringify?
      // const cleanEmail = sanitize(email)

      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          // hash,
          password,
        }),
      });

      if (!response.ok) throw new Error("Login failed");

      const { token } = await response.json();
      document.cookie = `token=${token}; path=/`;
      
      router.push("/");
      
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }}>
        <label>
          Username:
          <input
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <br />
        <label>
          Password:
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        <br />
        <button type="submit">Log In</button>
      </form>
    </div>
  );
};
