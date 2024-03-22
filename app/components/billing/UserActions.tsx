"use client";

import { MutableRefObject, useState } from "react";
import { 
    quarterType,
    readingsDict,
    usersInfoDictType,
    voidFunc,
    waterUsageType
} from "../../lib/commonTypes";
import { 
    calculateOverageCharge,
    postPaymentsToBalances, 
    sendBillsToUsers 
} from "../../lib/billingFunctions";
import { usePathname, useRouter } from "next/navigation";
import { rates } from "../../lib/billingRates";
import domtoimage from 'dom-to-image';
import jsPDF from "jspdf";

export type chargeType = {
    id: string,
    charge: number
    newBalance: number
    comp: boolean
};

export type statementType = {
    name: string,
    address: string,
    email: string,
    balance: number,
    comp: boolean,
    readings: number[]
};

type userActionsPropTypes = {
    quarter: quarterType,
    pdfRef: MutableRefObject<Element | null>
    statementInfo: readingsDict
    users: usersInfoDictType
    setMessage: voidFunc<string>
    usage: waterUsageType[]
};

export default function UserActions(
    {
        quarter,
        pdfRef,
        statementInfo,
        users,
        setMessage,
        usage
    }: userActionsPropTypes
) {
    const pathname = usePathname();
    const router = useRouter();

    // TODO: fix this function. it still has problems:
    // 1)   accessing hidden elements
    // 2)   no dataUrl stream (empty string)
    // 3)   blank pdf prints (probably due to the enmpty dataUrl string)
    const download = () => {
        if (pdfRef == null || pdfRef.current == null) { return };
        const pdf = new jsPDF();
        const childrenArray = pdfRef.current.children;
        for (let i = 0; i < childrenArray.length; i++) {
            const child = childrenArray[i];
            for (let j = 0; j < child.children.length; j++) {
                domtoimage
                    .toJpeg(child.children[j])
                    .then(dataUrl => {
                            const img = new Image();
                            img.src = dataUrl;
                            pdf.addImage(img, 'JPEG', 0, 0, 1, 1);
                        })
                        .catch(error => {
                            console.log('error', error);
                        });
            };
            if (i !== usage.length - 1) { pdf.addPage() };
        };

        // pdf.save(`${quarter}.pdf`);
    };

    const [emailsLoading, setEmailsLoading] = useState(false);
    const [emailsSent, setEmailsSent] = useState(false);
    const [emailNote, setEmailNote] = useState('');

    const email = () => {
        setEmailsLoading(true);

        const statements: statementType[] = usage.map(({ _id: id, ...rest }) => {
            return {
                name: users[id].name,
                address: users[id].address,
                email: users[id].email,
                balance: users[id].balance,
                comp: users[id].comp,
                readings: statementInfo[id]
            };
        });

        sendBillsToUsers(pathname, statements, emailNote, quarter).then(ret => {
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
                    setEmailsSent(true);
                    setMessage(`emails successfully sent to water users for ${quarter}`);
                } else {
                    setMessage(
                        'there was an error while attempting to send emails to water users. '
                        + 'some or all of the emails have not been sent.'
                    );
                }
            };
        });
        setEmailsLoading(false);
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
        
        <button 
            disabled={emailsLoading || emailsSent} 
            onClick={() => email()}
        >
            {
                emailsSent ? 
                <span>{quarter} emails already sent!</span> :
                <span>email bills to water users</span>
            }
        </button>
        <input 
            disabled={emailsLoading || emailsSent} 
            value={emailNote} 
            onChange={e => { setEmailNote(e.currentTarget.value) }}
            type="text" 
            placeholder="(optional not to water users)"
        />
        
        <button 
            disabled={paymentsLoading || paymentsPosted} 
            onClick={() => postPayments()}
        >
            {
                paymentsPosted ?
                    <span>{quarter} charges already posted!</span> :
                    <span>Post charges to account balances as &quot;${quarter} charges&quot;</span>
            }
        </button>
    </>);
};
