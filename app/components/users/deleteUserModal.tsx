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
            
                <div className="overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-30 justify-center items-center w-full md:inset-0 max-h-full">
                    <div 
                        className="bg-gray-400 h-full w-full opacity-50"
                        onClick={ () => { setActive(false), setInfo(undefined), setConfirmation('') } }
                    ></div>
                    <div className="absolute top-0 left-0 p-4 w-full max-w-md max-h-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                        <div className="relative bg-white rounded-lg shadow dark:bg-gray-700 border-8 border-red-500">

                            <button
                                type="button"
                                className="absolute top-3 end-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                                onClick={ () => { setActive(false), setInfo(undefined), setConfirmation('') } }
                            >
                                <svg className="w-3 h-3" viewBox="0 0 14 14">
                                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                                </svg>
                                <span className="sr-only">Close modal</span>
                            </button>

                            <div className="p-4 md:p-5 text-center">
                                <svg className="mx-auto mb-4 w-14 h-14 fill-gray-700 dark:text-red-500" viewBox="0 0 20 20">
                                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 11V6m0 8h.01M19 10a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/>
                                </svg>

                                <div className="border-2 border-gray-400 rounded-lg p-4 my-8 mx-auto">
                                    <div className="mb-4">
                                        <b className="text-white text-2xl">
                                            Delete user?
                                        </b>
                                    </div>
                                    <p className="text-white text-base">
                                        (This action will irreversibly delete all of <b>{ info?.name }&apos;s</b> water usage and balance history data)
                                    </p>
                                </div>

                                <div>
                                    <div className="col-span-2">
                                        <label className="block mb-2 font-medium text-gray-900 dark:text-white">
                                            <span className="w-2/3 flex m-auto">
                                                Type DELETE (case sensitive) in the box to confirm:
                                            </span>
                                            <input
                                                type="text"
                                                onChange={ (e) => setConfirmation(e.target.value) }
                                                value={ confirmation }
                                                className="my-4 bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block m-auto p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" 
                                            />
                                        </label>
                                    </div>

                                    <button
                                        onClick={ () => { handleSubmit(), setConfirmation('') } }
                                        disabled={ confirmation == 'DELETE' ? false : true }
                                        className={ confirmation == 'DELETE' ? 
                                            "text-white inline-flex items-center bg-red-700 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg px-5 py-2.5 text-center dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-800" :
                                            "text-gray-300 inline-flex items-center font-medium rounded-lg px-5 py-2.5 text-center dark:bg-gray-500"
                                        }
                                    >
                                        Delete User
                                    </button>

                                </div>
                            </div>
                        </div>
                    </div>
                </div>
      

            </>}
        </div>
    );
};