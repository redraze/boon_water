"use client";

import { useState } from "react";
import { stateType, voidFunc } from "../../lib/commonTypes";
import { userInfo } from "../../lib/commonTypes";
import { addNewUser } from "../../lib/usersFunctions";
import { usePathname, useRouter } from "next/navigation";
import Spinner from "../spinner/Spinner";

type addUserModalPropsType = {
    usersState: stateType<userInfo[] | undefined>
    setMessage: voidFunc<string>
    updatingState: stateType<boolean>
};

export default function AddUserModal({ usersState, setMessage, updatingState }: addUserModalPropsType) {
    const { value: users, setValue: setUsers } = usersState;
    const { value: updating, setValue: setUpdating } = updatingState;

    const router = useRouter();
    const pathname = usePathname();

    const [active, setActive] = useState(false);

    const [name, setName] = useState('');
    const [address, setAddress] = useState('');
    const [email, setEmail] = useState('');
    const [comp, setComp] = useState(false);

    const resetInfo = () => {
        setName('');
        setAddress('');
        setEmail('');
        setComp(false);
    };

    const handleSubmit = () => {
        setUpdating(true);

        if (!name || !address || !email) {
            setMessage('Please make sure all information is filled before submitting.');
            setUpdating(false);
            return
        };

        const newUserInfo: userInfo['info'] = {
            name,
            address,
            email,
            balance: 0,
            comp
        };
        
        // submit new user info to backend API
        addNewUser(pathname, newUserInfo).then(res => {
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
                setUsers([...users!, res.newUser!]);
                setMessage('User was successfully added.');
                resetInfo();
                setActive(false);
            };
        });
        setUpdating(false);
    };

    return(<>
        <div className="fixed flex pb-6 bottom-0 left-0 left-1/2 transform -translate-x-1/2">
            <button
                onClick={ () => { resetInfo(), setActive(true) } }
                className=" m-auto border-sky-600 border-2 bg-white hover:bg-sky-600 hover:text-white font-bold py-2 px-4 rounded"
            >
                Add New User
            </button>
        </div>

        <div style={ active ? { "display": "flex" } : { "display": "none" } }>
            { updating ? <Spinner /> : <>
                <div className="fixed top-0 right-0 left-0 z-40 justify-center items-center w-full md:inset-0 max-h-full">
                    <div
                        className="bg-gray-500 opacity-50 w-full h-full fixed top-0 left-0"
                        onClick={ () => { resetInfo(), setActive(false) } }
                    ></div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 max-w-md max-h-full">
                        <div className="m-auto bg-white rounded-lg shadow dark:bg-gray-700">
                            <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    Create new user
                                </h3>
                                <button 
                                    type="button"
                                    className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white" data-modal-toggle="crud-modal"
                                    onClick={ () => {setActive(false)} }
                                >
                                    <svg className="w-3 h-3" viewBox="0 0 14 14">
                                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                                    </svg>
                                    <span className="sr-only">Close modal</span>
                                </button>
                            </div>

                            <form 
                                className="p-4 md:p-5" 
                                onSubmit={(e) => {e.preventDefault(), handleSubmit()} }
                            >
                                <div className="grid gap-4 mb-4 grid-cols-2">
                                    <div className="col-span-2">
                                        <label className="block mb-2 font-medium text-gray-900 dark:text-white">
                                            <input
                                                type="text" 
                                                placeholder="name"
                                                value={ name }
                                                onChange={e => setName(e.target.value) }
                                                className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" 
                                            />
                                        </label>
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block mb-2 font-medium text-gray-900 dark:text-white">
                                            <input
                                                type="text" 
                                                placeholder="address"
                                                value={ address }
                                                onChange={e => setAddress(e.target.value) }
                                                className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" 
                                            />
                                        </label>
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block mb-2 font-medium text-gray-900 dark:text-white">
                                            <input
                                                type="text" 
                                                placeholder="email"
                                                value={ email }
                                                onChange={e => setEmail(e.target.value) }
                                                className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" 
                                            />
                                        </label>
                                    </div>
                                    <label>
                                        <span className="pr-4 text-white">New user comp:</span>
                                        <input
                                            type="checkbox"
                                            checked={comp}
                                            onChange={e => setComp(e.currentTarget.checked) }
                                            className="w-4 h-4"
                                        />
                                    </label>
                                </div>
                                <button 
                                    type="submit" 
                                    className="text-white inline-flex items-center bg-sky-700 hover:bg-sky-800 focus:ring-4 focus:outline-none focus:ring-sky-300 font-medium rounded-lg px-5 py-2.5 text-center dark:bg-sky-600 dark:hover:bg-sky-700 dark:focus:ring-sky-800"
                                >
                                    <svg className="me-1 -ms-1 w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"></path></svg>
                                    Add new user
                                </button>
                            </form>
                        </div>
                    </div>
                </div> 
            </>}
        </div>
    </>);
};