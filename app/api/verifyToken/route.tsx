import { verifyToken } from "../../lib/verifyToken";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try{
        const { token, pathname } = await req.json();
        const validity = verifyToken(token, pathname);
        return NextResponse.json({ validity });

    } catch (error) {
        console.error(error);
    }
};
