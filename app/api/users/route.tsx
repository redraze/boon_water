import { verifyToken } from "../../lib/verifyToken";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { token, pathname } = await req.json();
        const validity = verifyToken(token, pathname);
        if (!validity) { throw new Error('token validation failed') };

        // TODO
        // connect to db
        // query db for all users
        // const users = ...
        
        // test data
        const users = [
            { id: 1, name: 'user1', address: '1234 boon road', email: 'test@test.com', balance: 100 },
            { id: 2, name: 'user2', address: '4321 boon road', email: 'foo@bar.aol', balance: -50 }
        ];
        
        return NextResponse.json({ users });

    } catch (error) {
        console.log('error thrown in [/api/users]: ' + error);
    };
};
