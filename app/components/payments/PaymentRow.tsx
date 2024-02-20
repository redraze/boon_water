"use client";

import { useState } from "react";
import { voidFunc } from "../../lib/commonTypes";
import { paymentsInfoType } from "../../payments/page";

type PaymentRowPropsType = {
    info: paymentsInfoType,
    setPaymentsInfo: voidFunc<paymentsInfoType[]>
    setMessage: voidFunc<string>
};

export default function PaymentRow({ info, setPaymentsInfo, setMessage }: PaymentRowPropsType) {
    const [payment, setPayment] = useState<number>(0);
    const [newBalance, setNewBalance] = useState<number>(info.balance);

    const attmeptSetPayment = (val: string) => {
        if (!val) {
            setPayment(0);
            setNewBalance(info.balance);
            setMessage('');
            return;
        };
        
        let num = Number(val);
        if (num) {
            num = Math.round(num * 100) / 100;
            setPayment(num);
            setNewBalance(info.balance + num);
            setMessage('');
        } else { setMessage('Only numbers are allowed in balance boxes.') };
    };

    const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    });

    const updatePaymentsInfo = () => {
        // TODO
        // setPaymentsInfo(() => {
        //     ...
        // })
    };

    return(
        <tr>
            <td>{info.name}</td>
            <td>{formatter.format(info.balance)}</td>
            <td><input
                value={payment}
                onChange={ e => attmeptSetPayment(e.currentTarget.value) }
                onBlur={ () => updatePaymentsInfo() }
            /></td>
            <td>{formatter.format(newBalance)}</td>
        </tr>
    );
};
