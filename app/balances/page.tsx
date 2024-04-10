"use client";

import { useEffect, useState } from "react";
import { balanceHistoryDictType } from "../lib/commonTypes";
import { getHistory } from "../lib/balancesFunctions";
import { usePathname, useRouter } from "next/navigation";
import Message from "../components/message/Message";
import HistoryTable from "../components/balances/HistoryTable";
import Spinner from "../components/spinner/Spinner";

export default function Balances() {
    const pathname = usePathname();
    const router = useRouter();

    const [message, setMessage] = useState('');

    const [options, setOptions] = useState<JSX.Element[]>([]);
    const [history, setHistory] = useState<balanceHistoryDictType | undefined>();
    const [id, setId] = useState('');

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        
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
                    optionsDraft.push(
                        <option
                            className="text-xl"
                            key={user._id}
                            value={user._id}
                        >
                            { user.name }
                        </option>
                    );
                });

                setHistory(historyDraft);
                // sort users by first letter
                // TODO: write a better sorting algo
                setOptions(optionsDraft.sort((a, b) => a.props['children'].charCodeAt(0) - b.props['children'].charCodeAt(0)));
                setId(ret.data[0]._id);
            };
        });

        setLoading(false);
    }, []);

    const [year, setYear] = useState('cur');

    return (<>
        <Message text={ message } />
        {
            loading ? <Spinner /> : <>
                <div className="p-32">
                    <div className="w-full pb-4">
                        <select 
                            className="border-gray-300 focus:border-sky-500 border-2 p-2 m-2 rounded-lg text-xl"
                            onChange={e => setId(e.currentTarget.value) }
                        >
                            { options }
                        </select>
                        <select 
                            className="border-gray-300 focus:border-sky-500 border-2 p-2 m-2 rounded-lg text-xl"
                            onChange={(e) => setYear(e.currentTarget.value)}
                        >
                            <option value='cur'>Current Year</option>
                            <option value='prev'>Previous Year</option>
                        </select>
                    </div>
                    
                    <HistoryTable
                        id={id}
                        historyState={{value: history, setValue: setHistory}}
                        setMessage={setMessage}
                        setLoading={setLoading}
                        year={year}
                    />
                </div>
            </>
        }
    </>);
};