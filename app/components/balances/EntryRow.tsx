"use client";

import { balanceEntryType } from "../../lib/commonTypes";

export default function EntryRow({ entry }: { entry: balanceEntryType }) {
    const moneyFormatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    });

    const dateFormatter = new Intl.DateTimeFormat('en-US', {
        dateStyle: "short"
    });

    const timeFormatter = new Intl.DateTimeFormat('en-US', {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    });

    return(<>
        <tr>
            <td>{ dateFormatter.format(entry.timeStamp) }</td>
            <td>{ timeFormatter.format(entry.timeStamp) }</td>
            <td>{ moneyFormatter.format(entry.balanceChange) }</td>
            <td>{ moneyFormatter.format(entry.newBalance) }</td>
            <td>{ entry.note }</td>
        </tr>
    </>);
};
