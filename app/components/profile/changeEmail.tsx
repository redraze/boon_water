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

    return (<div>
        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
            <label>
                New Email:
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
            <button type="submit">Change Email</button>
        </form>
    </div>);
};
