"use client";

import { MutableRefObject, useState } from "react";
import { 
    quarterType,
    readingsDict,
    usersInfoDictType,
    voidFunc
} from "../../lib/commonTypes";
import { calculateOverageCharge, postPaymentsToBalances } from "../../lib/billingFunctions";
import { usePathname, useRouter } from "next/navigation";
import { rates } from "../../lib/billingRates";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export type chargeType = {
    id: string,
    charge: number
    newBalance: number
    comp: boolean
};

type userActionsPropTypes = {
    quarter: quarterType,
    pdfRef: MutableRefObject<Element | null>
    statementInfo: readingsDict
    users: usersInfoDictType
    setMessage: voidFunc<string>
};

export default function UserActions(
    {
        quarter,
        pdfRef,
        statementInfo,
        users,
        setMessage
    }: userActionsPropTypes
) {
    const pathname = usePathname();
    const router = useRouter();

    const download = () => {
        if (pdfRef == null || pdfRef.current == null) { return };
        const pdf = new jsPDF();
        const childrenArray = pdfRef.current.children;
        for (let i = 0; i < childrenArray.length; i++) {
            const child = childrenArray[i];
            const style = child.getAttribute('style');
            html2canvas(
                // @ts-expect-error
                childrenArray[i],
                {
                    scale: 1,
                    logging: false,
                }
            ).then(canvas => {
                const imgData = canvas.toDataURL('image/jpeg');
                // @ts-expect-error
                pdf.addImage(imgData, 'JPEG', 0, 0);
            });
            if (style) { child.setAttribute('style', style) };
            if (i !== childrenArray.length - 1) { pdf.addPage() };
        };
        pdf.save(`${quarter}.pdf`);
    };

    const email = () => {
        // TODO: email bills to users based on their emails on file
    };

    const [paymentsLoading, setPaymentsLoading] = useState(false);
    const [paymentsPosted, setPaymentsPosted] = useState(false);

    const postPayments = () => {
        setPaymentsLoading(true);

        const charges: chargeType[] = Object
            .entries(statementInfo)
            .map(([id, readings]) => {
                const totalUsage = readings[3] - readings[0];
                const baseCharge = totalUsage > rates.baseRateThresh ? rates.gtThresh : rates.ltThresh
                const overageCharge = calculateOverageCharge(totalUsage);
                const charge = baseCharge + overageCharge;
                
                const userInfo = users[id];
                
                return {
                    id,
                    charge: userInfo.comp ? 0: charge,
                    newBalance: userInfo.comp ? 
                        (userInfo.balance < 0 ? userInfo.balance : 0) :
                        userInfo.balance + charge,
                    comp: userInfo.comp
                };
            });

        const note = `${quarter} charges`;

        postPaymentsToBalances(pathname, charges, note).then(ret => {
            if (ret == undefined) {
                setMessage(
                    'Internal server error encountered while retrieving user info.'
                    + ' Please contact system administrator or try again later.'
                );
                // a user with any token (valid or tampered-with) that experiences
                // a server error will arrive at this point. should those users 
                // (both valid and malicious) be routed somewhere else?

            } else if (!ret.validity) {
                router.push('/login' + '?loginRequired=true')

            } else {
                if (ret.success) {
                    setPaymentsPosted(true);
                    setMessage(`${quarter} charges successfully posted to user accounts and balance histories!`);
                } else {
                    setMessage(
                        'there was an error while attempting to post charges. '
                        + 'please reload page and double check user account balances/balance histories.'
                    );
                }
            };
        });
        setPaymentsLoading(false);
    };

    return (<>
        <button onClick={() => download()}>download bills</button>
        <button onClick={() => email()}>email bills</button>
        <button disabled={paymentsLoading && paymentsPosted} onClick={() => postPayments()} >
            {
                paymentsPosted ?
                    <span>{quarter} charges already posted!</span>
                    : <span>Post charges to account balances as &quot;${quarter} charges&quot;</span>
            }
        </button>
    </>);
};
