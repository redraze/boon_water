"use client";

import { useEffect, useState } from "react";
// import { patchHistory } from "../../lib/balancesFunctions";
import { voidFunc } from "../../lib/commonTypes";

type TransactionModalPropTypes = {
    id: string,
    year: string,
    currentBalance: number
    setHistory: voidFunc<any>,
    setMessage: voidFunc<string>
};

export default function BalanceCorrection(
    {
        id,
        year,
        currentBalance,
        setHistory,
        setMessage 
    }: TransactionModalPropTypes
) {
    const handleSubmit = () => {
        // TODO
        // patchHistory().then(() => {
        //     ...
        // })
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

    const balanceChangeCalc = (val: string) => {
        if (!val) {
            setBalanceChange(0);
            setNewBalance(currentBalance);
            setMessage('');
            return;
        };
        
        const num = Number(val);
        if (num) {
            setBalanceChange(num);
            setNewBalance(currentBalance + num);
            setMessage('');
        
        } else { setMessage('Only numbers are allowed in balance boxes.') };
    };

    const newBalanceCalc = (val: string) => {
        if (!val) {
            setBalanceChange(currentBalance * -1);
            setNewBalance(0);
            setMessage('');
            return;
        };
        
        const num = Number(val);
        if (num) {
            setBalanceChange(num - currentBalance);
            setNewBalance(num);
            setMessage('');
        
        } else { setMessage('Only numbers are allowed in balance boxes.') };
    };

    return (<>
        <tr>
            <td></td>
            <td></td>

            <td>
                <input 
                    value={balanceChange} 
                    onChange={ (e) => balanceChangeCalc(e.currentTarget.value) }
                />
            </td>

            <td>
                <input
                    value={newBalance}
                    onChange={ (e) => newBalanceCalc(e.currentTarget.value) }
                />
            </td>
            <td>
                <input 
                    value={description}
                    placeholder="payment, late fee, etc..."
                    onChange={ (e) => setDescription(e.currentTarget.value) }
                />
            </td>

            <td><button onClick={() => reset()}>[clear_icon]</button></td>
            <td><button onClick={() => handleSubmit()}>[submit_icon]</button></td>
        </tr>
    </>);
};
