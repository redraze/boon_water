"use client";

import { useEffect, useState } from "react";
import { patchHistory } from "../../lib/balancesFunctions";
import { balanceHistoryDictType, stateType, voidFunc } from "../../lib/commonTypes";
import { usePathname, useRouter } from "next/navigation";
import EntryRow from "./EntryRow";
import { formatVal } from "../../lib/commonFunctions";

type TransactionModalPropTypes = {
    id: string,
    year: string,
    balanceState: stateType<number>
    historyState: stateType<balanceHistoryDictType | undefined>
    setMessage: voidFunc<string>
    innerCurState: stateType<JSX.Element[]>
    setLoading: voidFunc<boolean>
};

export default function BalanceCorrection(
    {
        id,
        year,
        balanceState,
        historyState,
        setMessage,
        innerCurState,
        setLoading
    }: TransactionModalPropTypes
) {
    const pathname = usePathname();
    const router = useRouter();

    const { value: currentBalance, setValue: setCurrentBalance } = balanceState;
    const { value: history, setValue: setHistory } = historyState;
    const { value: innerCur, setValue: setInnerCur } = innerCurState;

    const handleSubmit = () => {
        if (newBalance == currentBalance || balanceChange == 0) {
            setMessage('no balance changes found');
            return;
        };
        
        if (description == '') {
            setMessage('please enter a description for the balance correction');
            return;
        };
        
        setLoading(true);

        patchHistory(
            pathname,
            id,
            balanceChange,
            newBalance,
            description
        ).then((ret) => {
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
                if (!ret.success || !ret.entry) {
                    setMessage('error encountered. balance entry could not be posted.');
                    return;
                };

                setMessage('balance entry posted successfully');

                let draft = history;
                draft![id].cur = [ret.entry , ...draft![id].cur];
                setHistory(draft);

                setInnerCur([
                    <EntryRow key={ret.entry.timeStamp} entry={ ret.entry } n={innerCur.length % 2 + 1} />
                    , ...innerCur
                ]);

                setCurrentBalance(ret.entry.newBalance);

                reset();
            };
        });

        setLoading(false);
    };

    const reset = () => {
        setBalanceChange(0);
        setNewBalance(currentBalance);
        setDescription('');
    };

    useEffect(() => { reset() }, [currentBalance, year]);

    const [balanceChange, setBalanceChange] = useState(0);
    const [newBalance, setNewBalance] = useState(0);
    const [description, setDescription] = useState('');

    return (<>
        <tr className="bg-gray-100">
            <td></td>
            <td></td>

            <td>
                <span>$
                    <input
                        className="m-2 rounded-lg p-2 text-l"
                        value={ balanceChange.toFixed(2) }
                        onChange={ (e) => {
                            const num = formatVal(e.currentTarget.value);
                            if (isNaN(num)) { return };
                            
                            const diff = currentBalance + num;
                            setBalanceChange(num);
                            setNewBalance(diff);
                        } }
                    />
                </span>
            </td>

            <td>
                <span>$
                    <input
                        className="m-2 rounded-lg p-2 text-l"
                        value={ newBalance.toFixed(2) }
                        onChange={ e => {
                            const num = formatVal(e.currentTarget.value);
                            if (isNaN(num)) { return };
                    
                            const diff = num - currentBalance;
                            setBalanceChange(diff);
                            setNewBalance(num);
                        } }
                    />
                </span>
            </td>

            <td>
                <input 
                    className="m-2 rounded-lg p-2 text-l"
                    value={description}
                    placeholder="payment, late fee, etc..."
                    onChange={ (e) => setDescription(e.currentTarget.value) }
                />
            </td>

            <td className="bg-white pl-2">
                <button
                    className="bg-white border-2 border-gray-200 hover:bg-gray-200 rounded-lg p-2 text-xl"
                    onClick={() => reset()}
                >
                    Clear
                </button>
            </td>
            
            <td className="bg-white">
                <button 
                    className="w-max bg-white border-2 border-sky-500 hover:text-white hover:bg-sky-500 rounded-lg p-2 text-xl"
                    onClick={() => handleSubmit()}
                >
                    Post Entry
                </button>
            </td>
        </tr>
    </>);
};
