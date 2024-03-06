"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { checkLogin } from "../lib/authFunctions";
import Message from "../components/message/Message";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState('');

  const handleLogin = () => {
    checkLogin(email, password).then((token: string | undefined) => {
      if (token == undefined) {
        setEmail('');
        setPassword('');
        setMessage('Login failed.')
      } else {
        document.cookie = `token=${token}; SameSite=lax; Secure`;
        router.push('/' + '?loginSuccessful=true');
      };
    });
  };

  return (<>
    <Message text={ message } />
    <div>
      <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }}>
        <label>
          Email Address:
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
        <button type="submit">Log In, yo!</button>
      </form>
    </div>
  </>);
};
