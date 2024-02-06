"use client";

import { useEffect, useState } from "react";
import { balanceHistoryDictType } from "../../lib/commonTypes";
import EntryRow from "./EntryRow";

type HistoryTablePropTypes = {
    id: string,
    history: balanceHistoryDictType | undefined
};

export default function HistoryTable({ id, history}: HistoryTablePropTypes) {
    const [innerCur, setInnerCur] = useState<JSX.Element[]>();
    const [innerPrev, setInnerPrev] = useState<JSX.Element[]>();

    useEffect(() => {
        if (!history) { return };

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
                { year == 'cur' ? innerCur : innerPrev }
            </tbody>
        </table>
    </>);
};
