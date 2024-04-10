"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { checkLogin } from "../lib/authFunctions";
import Message from "../components/message/Message";
import Spinner from "../components/spinner/Spinner";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState('');

  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    setLoading(true);
    checkLogin(email, password).then((token: string | undefined) => {
      if (token == undefined) {
        setEmail('');
        setPassword('');
        setMessage('Login failed.');
        setLoading(false);
      } else {
        document.cookie = `token=${token}; SameSite=lax; Secure`;
        router.push('/' + '?loginSuccessful=true');
      };
    });
  };

  return (<>
    <Message text={ message } />

    { loading ? <Spinner /> :
      <div className="flex h-screen">
        <div className="w-full max-w-xs m-auto">
          <form 
            className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4"
            onSubmit={(e) => { e.preventDefault(); handleLogin(); }}
          >
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Email Address:
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" 
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </label>
            <br />
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Password:
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" 
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </label>
            <div className="flex items-center justify-between">
              <button 
                className="bg-sky-500 hover:bg-sky-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" 
                type="submit"
              >
                Log In
              </button>
            </div>
          </form>
        </div>
      </div>
    }
  </>);
};
