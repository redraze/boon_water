'use client';

import Image from "next/image";
import { useEffect } from "react";
import { stateType } from "../../lib/commonTypes";

export default function Message({ messageState }: { messageState: stateType<string> }) {
    const {value: message, setValue: setMessage} = messageState;

    useEffect(() => { 
        if (message) {
            setTimeout(() => { setMessage('') }, 5000);
        };
    }, [message]);

return(<>
        {
            message ? <>
                <div className={ "fixed bottom-10 w-screen z-50"}>
                    <div className="w-fit m-auto flex justify-center bg-white rounded-lg p-2 border-4 border-sky-500">
                        <span
                            className="flex justify-center px-4 m-auto"
                        >
                            { message }
                        </span>
                        <button 
                            className="flex justify-center m-1 rounded-lg"
                            onClick={ () => {setMessage('')} }
                        >
                            <Image src='/close.ico' alt="X" height={50} width={50} />
                        </button>
                    </div>
                </div>
            </> : <></>
        }
    </>)
}