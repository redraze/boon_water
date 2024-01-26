"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getAllUsers, editUser } from "../lib/users";
import Spinner from "../components/spinner/Spinner";
import Message from "../components/message/Message";
import type { userInfo } from "../lib/commonTypes";

export default function Users() {
    const router = useRouter();
    const pathname = usePathname();
    const [message, setMessage] = useState('');


    /*
        get all water users
    */
    const [users, setUsers] = useState<userInfo[] | undefined>(undefined);
    useEffect(() => {
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
    }, []);
    
    /*
        update an existing user
    */
    const [prevInfo, setPrevInfo] = useState<userInfo | undefined>(undefined);
    const [nameUpdate, setNameUpdate] = useState('');
    const [addressUpdate, setAddressUpdate] = useState('');
    const [emailUpdate, setEmailUpdate] = useState('');
    const [balanceUpdate, setBalanceUpdate] = useState<number>(0);
    const attemptBalanceUpdate = (num: string) => {
        // TODO: improve this balance input sanitizer/state handler routine
        // (its kinda janky currently)
        if (!num) {
            setBalanceUpdate(0);
            setMessage('');
        } else if (Number(num)) {
            setBalanceUpdate(Number(num));
            setMessage('');
        } else { setMessage('Only numbers are allowed in balance box.') };
    };

    const setUpdateInfo = (user: userInfo) => {
        setPrevInfo(user);
        setNameUpdate(user.info.name);
        setAddressUpdate(user.info.address);
        setEmailUpdate(user.info.email);
        setBalanceUpdate(user.info.balance);
    };

    const resetInfo = () => {
        setPrevInfo(undefined);
        setNameUpdate('');
        setAddressUpdate('');
        setEmailUpdate('');
        setBalanceUpdate(0);
    };

    const [updateUnderway, setUpdateUnderway] = useState(false);
    const updateUser = () => {
        setUpdateUnderway(true);

        if (!prevInfo) {
            setMessage('Something went wrong while attempting to update user.');
            setUpdateUnderway(false);
            return;
        };

        const updateInfo: userInfo = {
            _id: prevInfo._id,
            info: {
                name: nameUpdate,
                address: addressUpdate,
                email: emailUpdate,
                balance: balanceUpdate ? balanceUpdate : 0
            }
        };

        if (prevInfo == updateInfo || !updateInfo) {
            setMessage('No edits made to selected user.');
            setUpdateUnderway(false);
            return;
        };

        // submit changes to backend API
        editUser(pathname, updateInfo).then((ret) => {
            if (ret == undefined) {
                setMessage(
                    'Internal server error encountered while updating user info.'
                    + ' Please contact system administrator or try again later.'
                );
            
            } else if (!ret.validity) {
                router.push('/login' + '?loginRequired=true');
            
            } else if (!ret.success) {
                setMessage(
                    'Database error enountered while attempting to update user info.'
                    + ' Please contact system administrator or try again later.'
                );
                return;

            // success
            } else {
                setUsers(() => {
                    return users?.map(user => {
                        if (user._id !== updateInfo._id) {
                            return user
                        };
                        return updateInfo;
                    });
                });
                resetInfo();
                setMessage('User was successfully updated.');
            };
            setUpdateUnderway(false);
        });
    };


    /*
        add new user
    */
    // TODO

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
                            <th></th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        { 
                            users?.map((user: userInfo) => {
                                return(prevInfo?._id == user._id ?
                                    <tr key={ user._id }>
                                        <td><input
                                            type="text"
                                            value={ nameUpdate }
                                            onChange={(e) => setNameUpdate(e.target.value) }
                                        ></input></td>
                                        <td><input
                                            type="text"
                                            value={ addressUpdate }
                                            onChange={(e) => setAddressUpdate(e.target.value) }
                                        ></input></td>
                                        <td><input
                                            type="text"
                                            value={ emailUpdate }
                                            onChange={(e) => setEmailUpdate(e.target.value) }
                                        ></input></td>
                                        <td><input
                                            type="text"
                                            value={ balanceUpdate }
                                            onChange={(e) => attemptBalanceUpdate(e.target.value) }
                                        ></input></td>
                                        <td>
                                            <button onClick={ () => resetInfo() }>
                                                [X_icon]
                                            </button>
                                        </td>
                                        <td>
                                            <button onClick={ () => updateUser() }>
                                                [submit_icon]
                                            </button>
                                        </td>
                                    </tr> :
                                    <tr key={ user._id }>
                                        <td>{ user.info.name }</td>
                                        <td>{ user.info.address }</td>
                                        <td>{ user.info.email }</td>
                                        <td>{ user.info.balance }</td>
                                        <td>
                                            <button onClick={ () => {
                                                setUpdateInfo(user);
                                                setPrevInfo(user);
                                            } }>
                                                [edit_icon]
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })
                        } 
                    </tbody>
                </> : <></>
            }
        </table>
        { users || updateUnderway ? <></> : <Spinner /> }

        {/* <button onClick={() => router.push('/addNewUser')}>
            Add new user
        </button> */}
    </>);
};
