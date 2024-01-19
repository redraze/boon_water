"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { checkLogin } from "../lib/checkLogin";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = () => {
    checkLogin(password, email).then((token: string | undefined) => {
      if (token == undefined) {
        router.push('/login' + '?loginFailed=true');
      } else {
        document.cookie = `token=${token}; SameSite=lax; Secure`;
        router.push('/' + '?forceVerify=true');
      };
    });
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
