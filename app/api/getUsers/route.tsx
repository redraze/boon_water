import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function POST(req: Request) {
    try {
        const { token } = await req.json();
        if (!token) { throw new Error('verifyToken API route error: token not found') };
        jwt.verify(token, process.env.JWT_SECRET!);
        
        // TODO
        // check token against token registry to see if it 
        // has permission to access all users info

        // this ^ logic (server side token verification) is also present in the 
        // verifyToken.tsx api route and could be generalized, abstracted into,
        // and exported from a lib function



        // TODO
        // connect to db
        // query db for all users
        // const users = ...
        
        // test data
        const users = [
            { id: 1, name: 'user1', address: '1234 boon road', email: 'test@test.com', balance: 100 },
            { id: 2, name: 'user2', address: '4321 boon road', email: 'foo@bar.aol', balance: -50 }
        ]
        
        return NextResponse.json({ users });

    } catch (error) {
        console.log(error)
    }
};
