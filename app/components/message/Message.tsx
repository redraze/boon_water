'use client';

import Image from "next/image";
import { useEffect, useState } from "react";

export default function Message({ text }: { text: string }) {
    const [vis, setVis] = useState(Boolean(text));
    useEffect(() => { 
        if (text) {
            setVis(Boolean(text));
            setTimeout(() => { setVis(false) }, 5000);
        };
    }, [text]);
    return(<>
        {
            text ? <>
                <div className={ vis ? "absolute bottom-10 w-screen" : "hidden" }>
                    <div className="w-fit m-auto flex justify-center bg-white rounded-lg p-2 border-4 border-sky-500">
                        <span
                            className="flex justify-center px-4 m-auto"
                        >
                            { text }
                        </span>
                        <button 
                            className="flex justify-center m-1 rounded-lg"
                            onClick={ () => {setVis(false)} }
                        >
                            <Image src='/close.ico' alt="X" height={50} width={50} />
                        </button>
                    </div>
                </div>
            </> : <></>
        }
    </>)
}