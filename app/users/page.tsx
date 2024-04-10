"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getAllUsers } from "../lib/usersFunctions";
import Message from "../components/message/Message";
import type { userInfo } from "../lib/commonTypes";
import UsersTable from "../components/users/usersTable";
import AddUserModal from "../components/users/addUserModal";

export default function Users() {
    const router = useRouter();
    const pathname = usePathname();

    const [message, setMessage] = useState('');
    const [users, setUsers] = useState<userInfo[] | undefined>(undefined);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        getAllUsers(pathname).then((ret) => {
            if (ret == undefined) {
                setMessage(
                    'Internal server error encountered while retrieving user info.'
                    + ' Please contact system administrator or try again later.'
                );
                // a user with any token (valid or tampered-with) that experiences
                // a server error will arrive at this point. should those users 
                // (both valid and malicious) be routed somewhere else?

            } else if (!ret.validity) {
                router.push('/login' + '?loginRequired=true')

            } else {
                setUsers(ret.users);
                if (!ret.users) {
                    setMessage('No user data available.');
                };
            };
        });
        setLoading(false);
    }, []);
    
    return (<>
        <Message text={message} />
        <div className="min-h-screen w-full flex p-32">
            <div className="flex flex-col w-full mx-auto">
                <UsersTable 
                    usersState={{ value: users, setValue: setUsers }}
                    setMessage={ setMessage }
                    updatingState={{ value: loading, setValue: setLoading }}
                />
                <AddUserModal
                    usersState={{ value: users, setValue: setUsers }}
                    setMessage={ setMessage }
                    updatingState={{ value: loading, setValue: setLoading }}
                />
            </div>
        </div>
    </>);
};
