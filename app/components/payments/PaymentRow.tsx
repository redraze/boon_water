"use client";

import { useEffect, useState } from "react";
import { stateType, voidFunc } from "../../lib/commonTypes";
import { paymentsInfoType } from "../../payments/page";

type PaymentRowPropsType = {
    id: string,
    info: paymentsInfoType['id'],
    paymentsInfoState: stateType<paymentsInfoType | undefined>
    setMessage: voidFunc<string>,
    reset: boolean
};

export default function PaymentRow({ id, info, paymentsInfoState, setMessage, reset }: PaymentRowPropsType) {
    const { value: paymentsInfo, setValue: setPaymentsInfo } = paymentsInfoState
    
    const [payment, setPayment] = useState<number>(0);
    const [newBalance, setNewBalance] = useState<number>(info.balance);
    
    useEffect(() => { setPayment(0) }, [reset])
    
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
            setNewBalance(info.balance - num);
            setMessage('');
        } else { setMessage('Only numbers are allowed in balance boxes.') };
    };

    const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    });

    return(
        <tr>
            <td>{info.name}</td>
            <td>{formatter.format(info.balance)}</td>
            <td><input
                value={payment}
                onChange={ e => attmeptSetPayment(e.currentTarget.value) }
                onBlur={ () => {
                    const draft = paymentsInfo;
                    paymentsInfo![id] = {
                        name: info.name,
                        payment: payment,
                        balance: newBalance
                    };
                    setPaymentsInfo(draft);
                } }
            /></td>
            <td>{formatter.format(newBalance)}</td>
        </tr>
    );
};
