"use client";

import { useState } from "react";
import { changePassword } from "../lib/authFunctions";
import Message from "../components/message/Message";

export default function Profile() {
    const [newPassword, setNewPassword] = useState("");
    const [oldPassword, setOldPassword] = useState("");
    const [message, setMessage] = useState('');
  
    const handleSubmit = async () => {
        setNewPassword('');
        setOldPassword('');

        const newToken = await changePassword(oldPassword, newPassword);

        if (!newToken) {
            setMessage(
                'An error occured while attempting to change your password. '
                + 'Either the old password provided was incorrect, '
                + 'or an internal server error was encountered.'
            );
        } else {
            document.cookie = `token=${newToken}; SameSite=lax; Secure`;
            setMessage('Your password was updated successfully!');
        };
    };

    return (<>
        <Message text={ message } />
        <div>
        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
            <label>
                Old password:
                <input
                    type="password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    required
                />
            </label>
            <br />
            <label>
                New password:
                <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                />
            </label>
            <br />
            <button type="submit">Change password</button>
        </form>
        </div>
    </>);
};
