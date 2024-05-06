"use client";

import { useEffect, useState } from "react";
import { balanceHistoryDictType, yearType } from "../lib/commonTypes";
import { getHistory } from "../lib/balancesFunctions";
import { usePathname, useRouter } from "next/navigation";
import Message from "../components/message/Message";
import HistoryTable from "../components/balances/HistoryTable";
import Spinner from "../components/spinner/Spinner";
import { stringCompare } from "../lib/commonFunctions";

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
                setOptions(optionsDraft.sort((a, b) => stringCompare(
                    a.props['children'], 
                    b.props['children'] 
                )));
            };
        });

        setLoading(false);
    }, []);

    const [year, setYear] = useState<yearType>('cur');

    return (<>
        <Message messageState={{ value: message, setValue: setMessage }} />
        {
            loading ? <Spinner /> : <>
                <div className="p-32">
                    <div className="w-full pb-4">
                        <select 
                            className="border-gray-300 focus:border-sky-500 border-2 p-2 m-2 rounded-lg text-xl"
                            onChange={e => setId(e.currentTarget.value) }
                            defaultValue={'Select User'}
                        >
                            <option disabled hidden>Select User</option>
                            { options }
                        </select>
                        <select 
                            className="border-gray-300 focus:border-sky-500 border-2 p-2 m-2 rounded-lg text-xl"
                            onChange={ (e) => {
                                const val = e.currentTarget.value;
                                if (val !== 'cur' && val !== 'prev') { return };
                                setYear(val);
                            } }
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