"use client";

import { useEffect, useState } from "react";
import { stateType, voidFunc } from "../../lib/commonTypes";
import { paymentsInfoType } from "../../payments/page";
import { formatVal } from "../../lib/commonFunctions";

type PaymentRowPropsType = {
    id: string,
    info: paymentsInfoType['id'],
    paymentsInfoState: stateType<paymentsInfoType | undefined>
    setMessage: voidFunc<string>,
    reset: boolean
    n: number
};

export default function PaymentRow({ id, info, paymentsInfoState, setMessage, reset, n }: PaymentRowPropsType) {
    const { value: paymentsInfo, setValue: setPaymentsInfo } = paymentsInfoState
    
    const [payment, setPayment] = useState<number>(0);
    const [newBalance, setNewBalance] = useState<number>(info.balance);
    
    useEffect(() => { setPayment(0) }, [reset])
    
    const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    });

    return(
        <tr className={
            n % 2 ? 'bg-gray-300' : 'bg-gray-200'
        }>
            <td className="pl-4 py-2">{info.name}</td>
            <td className="pl-4 py-2">{formatter.format(info.balance)}</td>
            <td className="w-full h-full">
                <span>$
                    <input
                        className="rounded-lg px-4 py-1 ml-2"
                        value={ payment.toFixed(2) }
                        onChange={ e => {
                            const num = formatVal(e.currentTarget.value);
                            if (isNaN(num)) { return };
                            
                            setPayment(num);
                            setNewBalance(info.balance - num);
                        } }
                        onBlur={ () => {
                            setPaymentsInfo({
                                ...paymentsInfo,
                                [id]: {
                                    ...info,
                                    payment
                                }
                            });
                        } }
                    />
                </span>
            </td>
            <td className="pl-4 py-2">{formatter.format(newBalance)}</td>
        </tr>
    );
};
