"use client";

import { MutableRefObject } from "react";
import { quarterType } from "../../lib/commonTypes";

type userActionsPropTypes = {
    quarter: quarterType,
    pdfRef: MutableRefObject<Element | null>
};

export default function UserActions({ quarter, pdfRef }: userActionsPropTypes) {
    const download = () => {
        // TODO: download bills as pdf's in a zip file
    };

    const email = () => {
        // TODO: email bills to users based on their emails on file
    };

    const postPayments = () => {
        // TODO: update database and user balances with quarterly charges
    };

    return (<>
        <button onClick={() => download()}>download bills</button>
        <button onClick={() => email()}>email bills</button>
        <button onClick={() => postPayments()}>
            post charges to account balances as &quot;{quarter} charges&quot;
        </button>
    </>);
};
