"use client";

import { useEffect, useState } from "react";
import Message from "../components/message/Message";
import SideNav from "../components/profile/sideNav";
import ChangePw from "../components/profile/changePw";
import ChangeEmail from "../components/profile/changeEmail";

export default function Profile() {
    const [message, setMessage] = useState('');
    const [inner, setInner] = useState(<></>);
    const [selection, setSelection] = useState('');

    useEffect(() => {
        if (selection == 'pw') {
            setInner(<ChangePw setMessage={setMessage} />);
        } else if (selection == 'email') {
            setInner(<ChangeEmail setMessage={setMessage} />);
        };
    }, [selection])
  
    return (<>
        <Message text={ message } />
        <div className="h-screen w-full flex">
            <div className="absolute h-screen flex">
                <SideNav setSelection={setSelection} />
            </div>
            { inner }
        </div>
    </>);
};
