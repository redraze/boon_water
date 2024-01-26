import { useState } from "react";
import { stateType, userInfo, voidFunc } from "../../lib/commonTypes";
import { editUser } from "../../lib/users";
import { usePathname, useRouter } from "next/navigation";

type usersTablePropsType = {
    usersState: stateType<userInfo[] | undefined>
    setMessage: voidFunc<string>
};

export default function UsersTable({ usersState, setMessage }: usersTablePropsType) {
    const { value: users , setValue: setUsers } = usersState;

    const router = useRouter();
    const pathname = usePathname();

    const [prevInfo, setPrevInfo] = useState<userInfo | undefined>(undefined);

    // maybe combine all these states into one?
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

    const [updating, setUpdating] = useState(false);
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
                balance: balanceUpdate ? balanceUpdate : 0
            }
        };

        if (prevInfo == updateInfo || !updateInfo) {
            setMessage('No edits made to selected user.');
            setUpdating(false);
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
                setUsers(users?.map(user => {
                    if (user._id !== updateInfo._id) {
                        return user
                    };
                        return updateInfo
                    }
                ));
                resetInfo();
                setMessage('User was successfully updated.');
            };
            setUpdating(false);
        });
    };

    return(updating ? <></> :
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
    );
};
