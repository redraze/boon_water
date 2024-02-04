"use client";

import { useState } from "react";
import { stateType, userInfo, voidFunc } from "../../lib/commonTypes";
import { editUser } from "../../lib/usersFunctions";
import { usePathname, useRouter } from "next/navigation";
import DeleteUserModal from "./deleteUserModal";
import Spinner from "../spinner/Spinner";

type usersTablePropsType = {
    usersState: stateType<userInfo[] | undefined>
    setMessage: voidFunc<string>
    updatingState: stateType<boolean>
};

export default function UsersTable({ usersState, setMessage, updatingState }: usersTablePropsType) {
    const { value: users, setValue: setUsers } = usersState;
    const { value: updating, setValue: setUpdating } = updatingState;

    const router = useRouter();
    const pathname = usePathname();

    const [prevInfo, setPrevInfo] = useState<userInfo | undefined>(undefined);

    // maybe combine all these states into one?
    const [nameUpdate, setNameUpdate] = useState('');
    const [addressUpdate, setAddressUpdate] = useState('');
    const [emailUpdate, setEmailUpdate] = useState('');
    const [balance, setBalance] = useState<number>(0);

    const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    });

    const setUpdateInfo = (user: userInfo) => {
        setPrevInfo(user);
        setNameUpdate(user.info.name);
        setAddressUpdate(user.info.address);
        setEmailUpdate(user.info.email);
        setBalance(user.info.balance);
    };

    const resetInfo = () => {
        setPrevInfo(undefined);
        setNameUpdate('');
        setAddressUpdate('');
        setEmailUpdate('');
        setBalance(0);
    };

    const updateUser = () => {
        setUpdating(true);

        if (!prevInfo) {
            setMessage('Something went wrong while attempting to update user.');
            setUpdating(false);
            return;
        };
        
        const updateInfo: userInfo = {
            _id: prevInfo._id,
            info: {
                name: nameUpdate,
                address: addressUpdate,
                email: emailUpdate,
                balance: balance
            }
        };

        if (
            !updateInfo || (
                prevInfo.info.name == updateInfo.info.name 
                && prevInfo.info.address == updateInfo.info.address 
                && prevInfo.info.email == updateInfo.info.email
            )
        ) {
            setMessage('No edits made to selected user.');
            setUpdating(false);
            return;
        };

        // submit changes to backend API
        editUser(pathname, updateInfo).then((res) => {
            if (res == undefined) {
                setMessage(
                    'Internal server error encountered while updating user info.'
                    + ' Please contact system administrator or try again later.'
                );
            
            } else if (!res.validity) {
                router.push('/login' + '?loginRequired=true');
            
            } else if (!res.success) {
                setMessage(
                    'Database error enountered while attempting to update user info.'
                    + ' Please contact system administrator or try again later.'
                );
                setUpdating(false);
                return;

            // success
            } else {
                setUsers(users?.map(user => {
                    if (user._id !== updateInfo._id) {
                        return user
                    };
                    return updateInfo
                }));
                resetInfo();
                setMessage('User was successfully updated.');
            };
            setUpdating(false);
        });
    };

    // state to be passed down to the delete water user modal
    const [active, setActive] = useState(false);
    type userDelInfo = {
        name: string,
        id: string
    };
    const [delUserInfo, setDelUserInfo] = useState<userDelInfo | undefined>(undefined);
   
    return(<>
        { updating ? <Spinner /> :
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
                                            <td>{ formatter.format(balance) }</td>
                                            <td>
                                                <button onClick={ () => resetInfo() }>
                                                    [Cancel]
                                                </button>
                                            </td>
                                            <td>
                                                <button onClick={ () => updateUser() }>
                                                    [Submit]
                                                </button>
                                            </td>
                                            <td></td>
                                        </tr> :
                                        <tr key={ user._id }>
                                            <td>{ user.info.name }</td>
                                            <td>{ user.info.address }</td>
                                            <td>{ user.info.email }</td>
                                            <td>{ formatter.format(user.info.balance) }</td>
                                            <td>
                                                <button onClick={ () => setUpdateInfo(user) }>
                                                    [Edit User]
                                                </button>
                                            </td>
                                            <td>
                                                <button onClick={() => {
                                                    setActive(true);
                                                    setDelUserInfo({
                                                        name: user.info.name,
                                                        id: user._id
                                                    });
                                                }}>
                                                    [Delete User]
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
        }
        <DeleteUserModal
            usersState={{ value: users, setValue: setUsers }}
            setMessage={ setMessage }
            updatingState={{ value: updating, setValue: setUpdating }}
            activeState={{ value: active, setValue: setActive }}
            infoOfUserToDeleteState={{ value: delUserInfo, setValue: setDelUserInfo }}
        />
    </>);
};
