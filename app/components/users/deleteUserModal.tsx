import { stateType, voidFunc } from "../../lib/commonTypes";
import { userInfo } from "../../lib/commonTypes";
import { deleteUser } from "../../lib/users";
import { usePathname, useRouter } from "next/navigation";
import Spinner from "../spinner/Spinner";

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
                    (The transactional history for { info?.name } will not 
                    be deleted from the database yet)
                </p>
                <button onClick={ () => handleSubmit() }>Delete User</button>
                <button onClick={ () => { setActive(false), setInfo(undefined) } }>
                    Cancel
                </button>
            </>}
        </div>
    );
};