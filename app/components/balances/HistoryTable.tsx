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
};

export default function HistoryTable(
    {
        id,
        historyState,
        setMessage,
        setLoading
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
            history[id].cur.map(entry => {
                draft.push( <EntryRow key={entry.timeStamp} entry={ entry } /> );
            });
            return draft;
        });
        
        setInnerPrev(() => {
            let draft: JSX.Element[] = [];
            history[id].prev.map(entry => {
                draft.push( <EntryRow key={entry.timeStamp} entry={ entry } /> );
            });
            return draft;
        });

        setLoading(false);
    }, [id]);

    const [year, setYear] = useState('cur');

    return(<>
        <select onChange={(e) => setYear(e.currentTarget.value)}>
            <option value='cur'>Current Year</option>
            <option value='prev'>Previous Year</option>
        </select>

        <table>
            <thead>
                <tr>
                    <td>Date</td>
                    <td>Time</td>
                    <td>Balance Entry</td>
                    <td>New Balance</td>
                    <td>Description</td>
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
