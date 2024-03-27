"use client";

import { useState } from "react";
import { changePassword } from "../../lib/authFunctions";
import { voidFunc } from "../../lib/commonTypes";

export default function ChangePw({ setMessage }: { setMessage: voidFunc<string> }) {
    const [newPassword, setNewPassword] = useState("");
    const [oldPassword, setOldPassword] = useState("");

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

    return (
        <div className="flex m-auto pt-10">
            <form 
                className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4"
                onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}
            >
                <label className="block text-gray-700 text-sm font-bold mb-2">
                    Old password:
                    <input
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        type="password"
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        required
                    />
                </label>
                <br />
                <label className="block text-gray-700 text-sm font-bold mb-2">
                    New password:
                    <input
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                    />
                </label>
                <br />
                <button
                    className="bg-sky-500 hover:bg-sky-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    type="submit"
                >
                    Change password
                </button>
            </form>
        </div>
    );
};
