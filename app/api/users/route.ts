import { verifyToken } from "../../lib/tokens";
import { NextResponse } from "next/server";

// gets all water users' data
export async function POST(req: Request) {
    try {
        const validity = await validateRequest(req, 'POST');
        if (!validity) {
            console.log('message logged from [/api/users] POST: token validation failed');
            return NextResponse.json({ users: [], validity });
        };

        // TODO
        // connect to db
        // query db for all users
        // const users = ...
        
        // test data
        const users = [
            { id: 1, name: 'user1', address: '1234 boon road', email: 'test@test.com', balance: 100 },
            { id: 2, name: 'user2', address: '4321 boon road', email: 'foo@bar.aol', balance: -50 }
        ];
        
        return NextResponse.json({ users, validity });

    } catch (error) {
        console.log(`error thrown in [/api/users] POST: ` + error);
    };
};


// adds a new water user
export async function PUT(req: Request) {
    try {
        const validity = await validateRequest(req, 'PUT');
        if (!validity) {
            console.log('message logged from [/api/users] PUT: token validation failed');
            return NextResponse.json({ success: false, validity });
        };

        // TODO
        // connect to db
        // send insert request and await response

        return NextResponse.json({ success: true, validity });

    } catch (error) {
        console.log(`error thrown in [/api/users] PUT: ` + error);
    };
};


// edits an existing water user
export async function PATCH(req: Request) {
    try {
        const validity = await validateRequest(req, 'PATCH');
        if (!validity) {
            console.log('message logged from [/api/users] PATCH: token validation failed');
            return NextResponse.json({ success: false, validity });
        };

        // TODO
        // connect to db
        // send update request and await response

        return NextResponse.json({ success: true, validity });

    } catch (error) {
        console.log(`error thrown in [/api/users] PATCH: ` + error);
    };
};


/**
 * Attempts to validate request.
 * @param req - Request
 * @param method - string
 * @throws undefined if a server error is encountered
 * @returns boolean indicating token validity
 */
const validateRequest = async (req: Request, method: string) => {
    const { token, pathname } = await req.json();

    // prevent users with valid tokens but invalid permissions from 
    // gaining access to protected endpoints through request origin spoofing
    if (pathname !== '/users') {
        console.log(`message logged from [/api/users] ${method}: invalid pathname origin`);
        // TODO: log request and flag for review
        return false;
    };

    const validity = verifyToken(token, pathname);
    if (validity == undefined) {
        throw new Error('[validateRequest function]: internal server error encountered');
    };
    return validity;
};
