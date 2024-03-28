"use client";

import { useState } from "react";
import { stateType, userInfo, voidFunc } from "../../lib/commonTypes";
import { editUser } from "../../lib/usersFunctions";
import { usePathname, useRouter } from "next/navigation";
import DeleteUserModal from "./deleteUserModal";
import Spinner from "../spinner/Spinner";
import Image from "next/image";

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
    const [comp, setComp] = useState(false);

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
        setComp(user.info.comp);
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
                balance,
                comp
            }
        };

        if (
            !updateInfo || (
                prevInfo.info.name == updateInfo.info.name 
                && prevInfo.info.address == updateInfo.info.address 
                && prevInfo.info.email == updateInfo.info.email
                && prevInfo.info.comp == updateInfo.info.comp
            )
        ) {
            setMessage('No edits made to selected user.');
            setUpdating(false);
            return;
        };

        const nameChanged = nameUpdate !== prevInfo.info.name;

        // submit changes to backend API
        editUser(pathname, updateInfo, nameChanged).then((res) => {
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
            <table className="mx-auto w-full text-left table-auto">
                {
                    users ? <>
                        <thead className="uppercase">
                            <tr>
                                <th className="bg-sky-400 p-2 border-black border-2">name</th>
                                <th className="bg-sky-400 p-2 border-black border-2">address</th>
                                <th className="bg-sky-400 p-2 border-black border-2">email</th>
                                <th className="bg-sky-400 p-2 border-black border-2">balance</th>
                                <th className="bg-sky-400 p-2 border-black border-2">comp</th>
                                <th className=""></th>
                                <th className=""></th>
                            </tr>
                        </thead>
                        <tbody className="">
                            { 
                                users?.map((user: userInfo) => {
                                    return(prevInfo?._id == user._id ?
                                        <tr key={ user._id }>
                                            <td>
                                                <input
                                                    className="block w-full p-2 m-auto text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-base focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                                    type="text"
                                                    value={ nameUpdate }
                                                    onChange={(e) => setNameUpdate(e.target.value) }
                                                />
                                            </td>
                                            <td>
                                                <input
                                                    className="block w-full p-2 m-auto text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-base focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                                    type="text"
                                                    value={ addressUpdate }
                                                    onChange={(e) => setAddressUpdate(e.target.value) }
                                                />
                                            </td>
                                            <td>
                                                <input
                                                    className="block w-full p-2 m-auto text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-base focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                                    type="text"
                                                    value={ emailUpdate }
                                                    onChange={(e) => setEmailUpdate(e.target.value) }
                                                />
                                            </td>
                                            <td>{ formatter.format(balance) }</td>
                                            <td className="h-full \">
                                                <input 
                                                    className="flex m-auto w-6 h-6"
                                                    type="checkbox"
                                                    defaultChecked={ user.info.comp }
                                                    onChange={e => setComp(e.currentTarget.checked)}
                                                />
                                            </td>
                                            <td>
                                                <button onClick={ () => resetInfo() }>
                                                <Image
                                                    src="/back.ico"
                                                    alt="[back]"
                                                    height={30}
                                                    width={30}
                                                /> 
                                                </button>
                                            </td>
                                            <td>
                                                <button onClick={ () => updateUser() }>
                                                    <Image
                                                        src="/save.ico"
                                                        alt="[save]"
                                                        height={25}
                                                        width={25}
                                                    /> 
                                                </button>
                                            </td>
                                            <td></td>
                                        </tr> :
                                        <tr key={ user._id }>
                                            <td>{ user.info.name }</td>
                                            <td>{ user.info.address }</td>
                                            <td>{ user.info.email }</td>
                                            <td>{ formatter.format(user.info.balance) }</td>
                                            <td>{ user.info.comp ? 
                                                <Image 
                                                    className="flex m-auto"
                                                    src="/checked.ico"
                                                    alt="yes"
                                                    height={40}
                                                    width={40}
                                                /> : 
                                                <Image 
                                                    className="flex m-auto"
                                                    src="/close.ico"
                                                    alt="no"
                                                    height={30}
                                                    width={30}
                                                />
                                            }</td>
                                            <td>
                                                <button onClick={ () => setUpdateInfo(user) }>
                                                    <Image
                                                        src="/edit.ico"
                                                        alt="[edit]"
                                                        height={25}
                                                        width={25}
                                                    />
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
                                                    <Image
                                                        src="/delete.ico"
                                                        alt="[delete]"
                                                        height={20}
                                                        width={20}
                                                    />
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
