"use client";

import { useEffect, useState } from "react";
import { balanceHistoryDictType } from "../lib/commonTypes";
import { getHistory } from "../lib/balancesFunctions";
import { usePathname, useRouter } from "next/navigation";
import Message from "../components/message/Message";
import TransactionModal from "../components/balances/TransactionModal";
import HistoryTable from "../components/balances/HistoryTable";

export default function Balances() {
    const pathname = usePathname();
    const router = useRouter();

    const [message, setMessage] = useState('');

    const [options, setOptions] = useState<JSX.Element[]>([]);
    const [history, setHistory] = useState<balanceHistoryDictType | undefined>();
    const [id, setId] = useState('');

    useEffect(() => {
        getHistory(pathname).then(ret => {
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
                if (!ret.data) {
                    setMessage('No user data available.');
                    return;
                };

                let historyDraft: balanceHistoryDictType = {};
                let optionsDraft: JSX.Element[] = [];

                ret.data?.map(user => {
                    historyDraft[user._id] = {
                        name: user.name,
                        prev: user.prev,
                        cur: user.cur
                    };
                    optionsDraft.push(<option key={user._id} value={user._id}>{ user.name }</option>);
                });

                setHistory(historyDraft);
                setOptions(optionsDraft);
                setId(ret.data[0]._id);
            };
        });
    }, []);

    return (<>
        <Message text={ message } />
        <select onChange={e => setId(e.currentTarget.value) }>{ options }</select>
        <HistoryTable id={id} history={history} />
        <TransactionModal id={id} setHistory={setHistory} />
    </>);
};