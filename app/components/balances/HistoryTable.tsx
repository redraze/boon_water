"use client";

import { useEffect, useState } from "react";
import { balanceHistoryDictType, stateType, voidFunc } from "../../lib/commonTypes";
import EntryRow from "./EntryRow";
import BalanceCorrection from "./BalanceCorrection";

type HistoryTablePropTypes = {
    id: string,
    historyState: stateType<balanceHistoryDictType | undefined>,
    setMessage: voidFunc<string>
    setLoading: voidFunc<boolean>
    year: string
};

export default function HistoryTable(
    {
        id,
        historyState,
        setMessage,
        setLoading,
        year
    }: HistoryTablePropTypes
) {
    const { value: history } = historyState;

    const [innerCur, setInnerCur] = useState<JSX.Element[]>([]);
    const [innerPrev, setInnerPrev] = useState<JSX.Element[]>([]);
    const [currentBalance, setCurrentBalance] = useState(0);

    useEffect(() => {
        if (!history) { return };
        
        setLoading(true);
        
        setCurrentBalance(history[id].cur[0].newBalance);
        
        setInnerCur(() => {
            let draft: JSX.Element[] = [];
            history[id].cur.map((entry, idx) => {
                draft.push(
                    <EntryRow
                        key={entry.timeStamp}
                        entry={ entry }
                        n={idx}
                    />
                );
            });
            return draft;
        });
        
        setInnerPrev(() => {
            let draft: JSX.Element[] = [];
            history[id].prev.map((entry, idx) => {
                draft.push(
                    <EntryRow
                        key={entry.timeStamp}
                        entry={entry}
                        n={idx}
                    />
                );
            });
            return draft;
        });

        setLoading(false);
    }, [id]);

    return(<>
        <table className="w-full">
            <thead className="bg-gray-600 uppercase text-xl text-white">
                <tr>
                    <td className="p-4">Date</td>
                    <td className="p-4">Time</td>
                    <td className="p-4">Balance Entry</td>
                    <td className="p-4">New Balance</td>
                    <td className="p-4">Description</td>
                </tr>
            </thead>
            <tbody>
                {
                    year == 'cur' ?
                        <BalanceCorrection
                            id={id}
                            year={year}
                            balanceState={{ value: currentBalance, setValue: setCurrentBalance }}
                            historyState={historyState}
                            setMessage={setMessage}
                            innerCurState={{ value: innerCur, setValue: setInnerCur }}
                            setLoading={setLoading}
                        /> : <></>
                }
                { year == 'cur' ? innerCur : innerPrev }
            </tbody>
        </table>
    </>);
};
