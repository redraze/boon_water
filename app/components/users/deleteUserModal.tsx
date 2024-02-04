"use client";

import { stateType, voidFunc } from "../../lib/commonTypes";
import { userInfo } from "../../lib/commonTypes";
import { deleteUser } from "../../lib/usersFunctions";
import { usePathname, useRouter } from "next/navigation";
import Spinner from "../spinner/Spinner";
import { useState } from "react";

type deleteUserModalPropsType = {
    usersState: stateType<userInfo[] | undefined>
    setMessage: voidFunc<string>
    updatingState: stateType<boolean>
    activeState: stateType<boolean>
    infoOfUserToDeleteState: stateType<{ name: string, id: string } | undefined>
};

export default function DeleteUserModal({
    usersState,
    setMessage,
    updatingState,
    activeState,
    infoOfUserToDeleteState
}: deleteUserModalPropsType) {
    const { value: users, setValue: setUsers } = usersState;
    const { value: updating, setValue: setUpdating } = updatingState;
    const { value: active, setValue: setActive} = activeState;
    const { value: info, setValue: setInfo} = infoOfUserToDeleteState;

    const router = useRouter();
    const pathname = usePathname();

    const [confirmation, setConfirmation] = useState('');
    
    const handleSubmit = () => {
        setUpdating(true);

        if(!info || !info.id) { 
            setMessage('Something went wrong when attempting to delete user (missing user info)');
            setUpdating(false);
            return;
        };

        // submit user id to be deleted from db to backend API
        deleteUser(pathname, info.id).then(res => {
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
                return;

            // success
            } else {
                setUsers(users?.filter(user => { return user._id !== info.id }));
                setMessage('User was successfully deleted.');
                setInfo(undefined);
                setActive(false);
            };
        });
        setUpdating(false);
    };

    return(
        <div style={ active ? { "display": "flex" } : { "display": "none" } }>
            { updating ? <Spinner /> : <>
                <p>
                    Delete { info?.name } from the water users database?
                    <br/>
                    (This action will irreversibly delete all of the water usage and balance history data for { info?.name }.)
                </p>
                <div>
                    <p>type DELETE in the box to confirm:</p>
                    <input onChange={ (e) => setConfirmation(e.target.value) }/>
                </div>
                <button
                    onClick={ () => handleSubmit() }
                    disabled={ confirmation == 'DELETE' ? false : true }
                >Delete User</button>
                <button onClick={ () => { setActive(false), setInfo(undefined) } }>
                    Cancel
                </button>
            </>}
        </div>
    );
};