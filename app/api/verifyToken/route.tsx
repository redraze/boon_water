import { NextResponse } from "next/server";
import jwt from 'jsonwebtoken';

export async function POST(req: Request) {
    try{
        const { token, pathname } = await req.json();
        
        if (!token) { throw new Error('missing token') };
        if (!process.env.JWT_SECRET) { throw new Error('missing env variable: JWT_SECRET') };
        
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET,
            { complete: true }
        );

        const payload = decoded.payload;
        
        // TODO:
        // determine if the token provided has permission to access the requested resource
        // 
        // (maybe cross-reference a global dictionary of [token, permissions] pairs?
        // store in a local db or just memory?
        // when a user logs in their token and its permissions are stored in the dict,
        // and when the user logs out that token is deleted)
        //
        // const validity = ...;
        
        return NextResponse.json({ validity: true });

    } catch (error) {
        console.error(error);
        return undefined;
    }
};
