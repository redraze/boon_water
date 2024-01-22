"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getUsers } from "../lib/getUsers";
import Spinner from "../components/spinner/Spinner";
import Message from "../components/message/Message";
import Link from "next/link";
import Nav from "../components/nav/Nav";

export type userInfo = {
    id: number
    name: string
    address: string
    email: string
    balance: number
};

export default function Users() {
    const router = useRouter();

    const [message, setMessage] = useState('');
    const [users, setUsers] = useState<userInfo[]>([]);

    useEffect(() => {
        getUsers().then((ret) => {
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
                if (ret.users.length == 0) {
                    setMessage('No user data available.');
                };
            };
        });
    }, []);

    return (<>
        <Nav />
        <Message text={message} />
        <table>
            {
                users ? 
                    <thead>
                        <tr>
                            <th>name</th>
                            <th>address</th>
                            <th>email</th>
                            <th>balance</th>
                            <th></th>
                        </tr>
                    </thead> : 
                    <></>
            }
            <tbody>
            {
                users ?
                    users.map((user: userInfo) => {
                        return(
                            <tr key={ user.id }>
                                <td>{ user.name }</td>
                                <td>{ user.address }</td>
                                <td>{ user.email }</td>
                                <td>{ user.balance }</td>
                                <td><Link href={'/editUser' + `/${user.id}`}>edit</Link></td>
                            </tr>
                        );
                    }) :
                    <></>
            }
            </tbody>
        </table>
        { users ? <></> : <Spinner /> }

        <button onClick={() => router.push('/addNewUser')}>
            Add new user
        </button>
    </>);
};
