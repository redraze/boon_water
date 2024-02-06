"use client";

import { patchHistory } from "../../lib/balancesFunctions";
import { voidFunc } from "../../lib/commonTypes";

type TransactionModalPropTypes = {
    id: string,
    setHistory: voidFunc<any>
};

export default function TransactionModal({ id, setHistory }: TransactionModalPropTypes) {
    const handleSubmit = () => {
        // TODO
        // patchHistory().then(() => {
        //     ...
        // })
    };

    return (<>

    </>);
};
