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

    const [pdfLoading, setPdfLoading] = useState(true);
    // TODO: fix this...
    const download = () => {
        // if (pdfRef == null || pdfRef.current == null) { return };
        // setPdfLoading(true);
        // const pdf = new jsPDF();
        // const childrenArray = pdfRef.current.children;

        // for (let i = 0; i < childrenArray.length; i++) {
        //     const child = childrenArray[i];
        //     console.log(child)
        //     // const style = child.getAttribute('style');
        //     child.removeAttribute('style');

        //     domtoimage
        //         .toPng(child)
        //         .then(dataUrl => {
        //             const img = new Image();
        //             img.src = dataUrl;
        //             // @ts-expect-error
        //             pdf.addImage(img, 'PNG', 0, 0);
        //         })
        //         .catch(error => {
        //             console.log('error', error);
        //         });
                
        //     // if (style) { child.setAttribute('style', style) };
        //     if (i !== usage.length - 1) { pdf.addPage() };
        // };

        // pdf.save(`${quarter}.pdf`);
        // setPdfLoading(false);
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
        <div className="w-full border-b-4 border-t-2 border-sky-500 flex mt-8 py-8">
            <div className="w-full flex justify-between px-10">
                <button 
                    className="border-2 border-gray-400 p-2 m-2 bg-gray-200 text-gray-400 rounded-lg"
                    disabled 
                    onClick={() => download()}
                >
                    download bills
                </button>
                
                <div>
                    <button 
                        className={ emailsLoading || emailsSent ? 
                            "border-2 border-gray-400 p-2 m-2 bg-gray-200 text-gray-400 rounded-lg" :
                            "border-2 border-sky-500 p-2 m-2 hover:bg-sky-500 hover:text-white rounded-lg"
                        }
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
                        className="border-2 m-2 p-2 rounded-lg focus:border-sky-500"
                        disabled={emailsLoading || emailsSent} 
                        value={emailNote} 
                        onChange={e => { setEmailNote(e.currentTarget.value) }}
                        type="text" 
                        placeholder="(optional note to water users)"
                    />
                </div>
                
                <button 
                    className={ paymentsLoading || paymentsPosted ?
                        "border-2 border-gray-400 p-2 m-2 bg-gray-200 text-gray-400 rounded-lg" :
                        "border-2 border-sky-500 p-2 m-2 hover:bg-sky-500 hover:text-white rounded-lg"
                    }
                    disabled={paymentsLoading || paymentsPosted} 
                    onClick={() => postPayments()}
                >
                    {
                        paymentsPosted ?
                            <span>{quarter} charges already posted!</span> :
                            <span>Post charges to account balances as <b>&quot;${quarter} charges&quot;</b></span>
                    }
                </button>
            </div>
        </div>
    </>);
};
