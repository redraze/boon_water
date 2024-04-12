"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { rollData } from "../lib/rollDataFunctions";
import Spinner from "../components/spinner/Spinner";
import Message from "../components/message/Message";

export default function RollData() {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const pathname = usePathname(), router = useRouter();

    const handleSubmit = () => {
        setLoading(true)
        rollData(pathname).then(ret => {
            if (ret == undefined) {
                setMessage(
                    'Internal server error encountered while retrieving user info.'
                    + ' Please contact system administrator or try again later.'
                );
                // a user with any token (valid or tampered-with) that experiences
                // a server error will arrive at this point. should those users 
                // (both valid and malicious) be routed somewhere else?

            } else if (!ret.validity) {
                router.push('/login' + '?loginRequired=true');

            } else {
                setRolled(true);
                setMessage('Data has been successfully rolled back!');
            };
        });
        setLoading(false);
    };

    const [check, setCheck] = useState('');
    const [rolled, setRolled] = useState(false);

    return (<>
        <Message messageState={{ value: message, setValue: setMessage }} />
        { loading ? <Spinner /> : <>
            { rolled ? <>
                <div className="min-h-screen w-full p-32 flex">
                    <div className="w-fit m-auto text-center">
                        <div className="text-2xl border-4 border-sky-500 p-8 rounded-lg">
                            <span className="text-sky-500 font-bold">
                                Data has been rolled back.
                            </span>
                        </div> 
                    </div>
                </div>
            </> : <>
                <form
                    className="min-h-screen w-full px-32 py-24"
                    onSubmit={ (e) => { e.preventDefault(); handleSubmit(); } }
                >
                    <div className="w-4/5 flex flex-row mx-auto my-8 border-4 border-red-500 p-4 rounded-lg text-gray-200 text-xl font-bold bg-red-800">
                        <div className="uppercase text-yellow-300 text-4xl font-bold bg-red-500 w-min p-4 my-auto mx-8 border-4 border-yellow-400">
                            caution!!!
                        </div>

                        <div className="flex flex-col m-2">
                            <span className="pb-4">This action will move the current year's data into the previous year's data table, and create a new, empty set for the current year data.</span>
                            <span>This will <span className="uppercase text-yellow-300">PERMENANTLY DELETE</span> all of the previous year's data.</span>
                        </div>
                    </div>

                    <div className="bg-yellow-400 border-4 border-yellow-500 w-fit m-auto p-8 mt-8 rounded-lg">
                        {
                            rolled ? <>
                            </> : <>
                                <div className="w-max m-auto text-xl">
                                    <div className="flex flex-col pb-4 mb-4 text-center border-b-4 border-yellow-500">
                                        <span className="w-fit m-auto text-gray-700 font-bold">Type 'CONFIRM' to proceed:</span>
                                        <input
                                            className="w-1/2 mx-auto mt-2 p-2 rounded-lg border-2 border-gray-400"
                                            type="text"
                                            onChange={ (e) => {setCheck(e.currentTarget.value)} }
                                            value={check}
                                        />
                                    </div>

                                    <div className="text-center">
                                        <button 
                                            type="submit"
                                            className={ check !== 'CONFIRM' ? 
                                            "uppercase bg-gray-500 p-4 text-2xl rounded-lg border-4 border-gray-600 hover:cursor-not-allowed font-bold" :
                                            "uppercase bg-white p-4 text-2xl rounded-lg border-4 border-green-500 text-green-500 hover:bg-green-500 hover:text-white font-bold"
                                        }
                                        disabled={ check !== 'CONFIRM' ? true : false }
                                        >
                                            roll data
                                        </button>
                                    </div>
                                </div>
                            </>
                        }
                    </div>
                </form>
            </>}
        </>}
    </>);
};
