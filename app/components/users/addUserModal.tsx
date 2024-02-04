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
    const [balance, setBalance] = useState(0);

    const attemptBalanceUpdate = (num: string) => {
        // TODO: improve this balance input sanitizer/state handler routine
        // (its kinda janky currently)
        if (!num) {
            setBalance(0);
            setMessage('');
        } else if (Number(num)) {
            setBalance(Number(num));
            setMessage('');
        } else { setMessage('Only numbers are allowed in the balance box.') };
    };

    const resetInfo = () => {
        setName('');
        setAddress('');
        setEmail('');
        setBalance(0);
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
            balance
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
        <button onClick={ () => setActive(true) }>Add New User</button>
        <div style={ active ? { "display": "flex" } : { "display": "none" } }>
            { updating ? <Spinner /> : <>
                <button onClick={ () => {setActive(false), resetInfo()} }>[close_icon]</button>
                <form onSubmit={(e) => {e.preventDefault(), handleSubmit()} }>
                    <p>New water user info:</p>
                    <label>
                        <input
                            type="text"
                            placeholder="name"
                            value={ name }
                            onChange={e => setName(e.target.value) }
                        />
                    </label>
                    <label>
                        New water user address:
                        <input
                            type="text"
                            placeholder="address"
                            value={ address }
                            onChange={e => setAddress(e.target.value) }
                        />
                    </label>
                    <label>
                        New water user email:
                        <input
                            type="text"
                            placeholder="email"
                            value={ email }
                            onChange={e => setEmail(e.target.value) }
                        />
                    </label>
                    <label>
                        New water user balance:
                        <input
                            type="text"
                            placeholder="balance"
                            value={ balance }
                            onChange={e => attemptBalanceUpdate(e.target.value) }
                        />
                    </label>
                    <input type="submit" value="Submit"/>
                </form>
            </>}
        </div>
    </>);
};