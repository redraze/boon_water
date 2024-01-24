"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAllUsers } from "../lib/users";
import Spinner from "../components/spinner/Spinner";
import Message from "../components/message/Message";
import type { userInfo } from "../lib/commonTypes";

export default function Users() {
    const router = useRouter();

    const [message, setMessage] = useState('');
    const [users, setUsers] = useState<userInfo[]>([]);

    // gets all water users' data upon page load
    useEffect(() => {
        getAllUsers('/users').then((ret) => {
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
        <Message text={message} />
        <table>
            {
                users ? <>
                    <thead>
                        <tr>
                            <th>name</th>
                            <th>address</th>
                            <th>email</th>
                            <th>balance</th>
                            <th>edit user</th>
                            <></>
                        </tr>
                    </thead>
                    <tbody>
                        { users.map((user: userInfo) => {
                            return(
                                <tr key={ user.id }>
                                    <td>{ user.name }</td>
                                    <td>{ user.address }</td>
                                    <td>{ user.email }</td>
                                    <td>{ user.balance }</td>
                                    <td>[edit_icon]</td>
                                </tr>
                            );
                        })
                        } 
                    </tbody>
                </> : <></>
            }
        </table>
        { users ? <></> : <Spinner /> }

        <button onClick={() => router.push('/addNewUser')}>
            Add new user
        </button>
    </>);
};
