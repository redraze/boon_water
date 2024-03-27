"use client";

import { useState } from "react";
import { voidFunc } from "../../lib/commonTypes";
import { changeEmail } from "../../lib/authFunctions";

export default function ChangeEmail({ setMessage }: { setMessage: voidFunc<string> }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = async () => {
        const newToken = await changeEmail(email, password);

        if (!newToken) {
            setMessage(
                'An error occured while attempting to change your email. '
                + 'Either the password provided was incorrect, '
                + 'or an internal server error was encountered.'
            );
        } else {
            document.cookie = `token=${newToken}; SameSite=lax; Secure`;
            setMessage('Your email was updated successfully!');
        };

        setEmail('');
        setPassword('');
    };

    return (
        <div className="flex m-auto pt-10">
            <form 
                className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4"
                onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}
            >
                <label className="block text-gray-700 text-sm font-bold mb-2">
                    New Email:
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
                <br />
                <button
                    className="bg-sky-500 hover:bg-sky-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    type="submit"
                >
                    Change email
                </button>
            </form>
        </div>
    );
};
