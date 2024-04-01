"use client";

import { useEffect, useState } from "react";
import { getAllUsers, submitPayments } from "../lib/paymentsFunctions";
import { usePathname, useRouter } from "next/navigation";
import Message from "../components/message/Message";
import PaymentRow from "../components/payments/PaymentRow";
import Spinner from "../components/spinner/Spinner";

export type paymentsInfoType = {
    [id: string]: {
        name: string,
        balance: number,
        payment: number
    }
};

export default function Balances() {
    const pathname = usePathname();
    const router = useRouter();

    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(true);

    const [note, setNote] = useState('');
    const [paymentsInfo, setPaymentsInfo] = useState<paymentsInfoType | undefined>(undefined);

    // enable forced re-rendering of PaymentRow children components (...is this bad design?)
    const [reset, setReset] = useState(false);

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

                setPaymentsInfo(() => {
                    const draft: paymentsInfoType = {};
                    ret.users!.map(user => {
                        draft[user._id] = {
                            name: user.info.name,
                            balance: user.info.balance,
                            payment: 0
                        };
                    });
                    return draft;
                });
            };
        });
        setLoading(false);
    }, []);

    const handleSubmit = () => {
        if (!note) {
            setMessage('please enter a note for the payments being made')
            return;
        };
        
        if (!paymentsInfo) { return };
        setLoading(true);

        const payments: {id: string, name: string, balance: number, payment: number}[] = [];
        Object.entries(paymentsInfo).map(([id, info]) => {
            if (info.payment) {
                payments.push({ ...info, id: id })
            };
        });

        if (payments.length == 0) {
            setMessage('please enter payments before submitting');
            setLoading(false);
            return;
        };

        submitPayments(pathname, payments, note).then(ret => {
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
                if (!ret.success) {
                    setMessage(
                        'some or all of the payments did not post successfully. '
                        + 'please double check user balances and balance histories.'
                    );
                    setReset(!reset);
                    setNote('');
                    return;
                };

                setPaymentsInfo(() => {
                    const draft: paymentsInfoType = paymentsInfo;
                    payments.map(info => {
                        if (!info?.payment) { return };
                        draft[info?.id] = {
                            ...draft[info?.id],
                            payment: 0,
                            balance: info?.balance
                        };
                    });
                    return draft;
                });

                setMessage('payments posted successfully.');
                setReset(!reset);
                setNote('');
            };
        });
        setLoading(false);
    };
    
    return (<>
        <Message text={ message } />
        {
            loading || !paymentsInfo ? <Spinner /> : <>
                <div className="p-32 w-full h-screen">
                    <table className="table-fixed w-full">
                        <thead className="bg-gray-500 text-white uppercase text-xl">
                            <tr>
                                <td></td>
                                <td className="p-2">current balance</td>
                                <td className="p-2">payment amount</td>
                                <td className="p-2">new balance</td>
                            </tr>
                        </thead>

                        <tbody>
                            { paymentsInfo ? 
                                Object.entries(paymentsInfo).map(([id, info], idx) => {
                                    return (
                                        <PaymentRow
                                            key={id}
                                            id={id}
                                            info={info}
                                            paymentsInfoState={{
                                                value: paymentsInfo,
                                                setValue: setPaymentsInfo
                                            }}
                                            setMessage={setMessage}
                                            reset={reset}
                                            n={idx}
                                        />
                                    );
                                }) : <></>
                            }
                        </tbody>
                    </table>

                    <div className="pt-10 w-full flex justify-center">
                        <div className="bg-gray-200 p-4 rounded-lg border-2 border-black">
                            <span className="text-xl">Note:</span>
                            <input
                                className="ml-2 rounded-lg p-2 text-l"
                                value={note}
                                onChange={ e => setNote(e.currentTarget.value) }
                                placeholder="ex: 'Q3 payments'"
                            />
                            <button 
                                className="ml-4 p-4 bg-white text-xl rounded-lg border-2 border-sky-500 hover:bg-sky-500 hover:text-white"
                                onClick={ () => handleSubmit() }
                            >
                                Submit Payments
                            </button>
                        </div>
                    </div>
                </div>
            </>
        }
    </>);
};