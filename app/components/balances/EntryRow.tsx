"use client";

import { balanceEntryType } from "../../lib/commonTypes";

export default function EntryRow({ entry, n }: { entry: balanceEntryType, n: number }) {
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
        <tr className={ n % 2 ? 'bg-gray-300' : 'bg-gray-200' }>
            <td className="p-2">{ dateFormatter.format(entry.timeStamp) }</td>
            <td className="p-2">{ timeFormatter.format(entry.timeStamp) }</td>
            <td className="p-2">{ moneyFormatter.format(entry.balanceChange) }</td>
            <td className="p-2">{ moneyFormatter.format(entry.newBalance) }</td>
            <td className="p-2">{ entry.note }</td>
        </tr>
    </>);
};
