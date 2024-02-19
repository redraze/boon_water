"use client";

import { useEffect, useState } from "react";
import { getAllUsers } from "../lib/usersFunctions";
import { usePathname, useRouter } from "next/navigation";
import Message from "../components/message/Message";
import PaymentRow from "../components/payments/PaymentRow";

export type paymentsInfoType = {
    id: string,
    name: string,
    balance: number,
    payment: number
};

export default function Balances() {
    const pathname = usePathname();
    const router = useRouter();

    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(true);

    const [note, setNote] = useState('');
    const [paymentsInfo, setPaymentsInfo] = useState<paymentsInfoType[]>();

    useEffect(() => {
        getAllUsers(pathname).then(ret => {
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
                if (!ret.users) {
                    setMessage('No user data available.');
                };

                setPaymentsInfo((draft: paymentsInfoType[] = []) => {
                    ret.users!.map(user => {
                        draft.push({
                            id: user._id,
                            name: user.info.name,
                            balance: user.info.balance,
                            payment: 0
                        });
                    });
                    return draft;
                });
            };
        });
        setLoading(false);
    }, []);

    const handleSubmit = () => {
        // TODO
        // 1) make popup to confirm (allows the onBlur event to fire for last payment info entered)
        // 2) send payment info to backend API
        // 3) on successful submission:
        //      reset all payment state in PaymentRow components, 
        //      and update paymentsInfo state
    };
    
    return (<>
        <Message text={ message } />
        {
            loading ? <></> : <>
                <table>
                    <thead>
                        <tr></tr>
                        <tr>current balance</tr>
                        <tr>payment amount</tr>
                        <tr>new balance</tr>
                    </thead>

                    <tbody>
                        {
                            paymentsInfo?.map(info => {
                                return (
                                    <PaymentRow
                                        key={info.id}
                                        info={info}
                                        setPaymentsInfo={setPaymentsInfo}
                                        setMessage={setMessage}
                                    />
                                );
                            })
                        }
                    </tbody>
                </table>

                <input
                    value={note}
                    onChange={ e => setNote(e.currentTarget.value) }
                    placeholder="ex: 'Q3 payments'"
                />

                <button onClick={ () => handleSubmit() }>Submit Payments</button>
            </>
        }
    </>);
};