import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

async function determineValidity(token: string | undefined, pathname: string) {
    if (!token || token == '') { 
        console.error('verifyToken API route error: token not found');
        return undefined;
    };

    try {
        jwt.verify(token, process.env.JWT_SECRET!);

        // TODO:
        // determine if the token provided has permission to access the 
        // desired endpoint specified by the pathname variable
        // 
        // (maybe cross-reference a global dictionary of [token, permissions] pairs?
        // store in a local db or just memory?
        // when a user logs in that token and its permissions are stored in the dict,
        // and when the user logs out that token is deleted)

        return true;

    } catch (error) {
        console.error(error);
        return false;
    };
};

export async function POST(req: Request) {
    const { token, pathname } = await req.json();
    const validity = await determineValidity(token, pathname);
    return NextResponse.json({ validity });
};
