import { verifyToken } from "../../lib/authentication";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try{
        const { token, pathname } = await req.json();
        if (!token || !pathname) { throw new Error('invalid request') };

        const validity = verifyToken(token, pathname);
        return NextResponse.json({ validity });

    } catch (error) {
        console.log('error thrown in [/api/verifyToken]: ' + error);
    }
};
