import { ObjectId } from "mongodb";
import { userInfo } from "../../lib/commonTypes";
import { dbConnect } from "../../lib/dbConnect";
import { verifyToken } from "../../lib/tokens";
import { NextResponse } from "next/server";

// gets all water users' data
export async function POST(req: Request) {
    try {
        const { token, pathname } = await req.json();

        const validity = await validateRequest(token, pathname, 'POST');
        if (!validity) {
            console.log('message logged from [/api/users] POST: token validation failed');
            return NextResponse.json({ users: [], validity });
        };

        const dbClient = await dbConnect();
        const db = dbClient?.db('waterUsersDb');
        const collection = db?.collection('waterUsers');
        const cursor = collection?.find({});
        const users = await cursor?.toArray();
        await cursor?.close();

        return NextResponse.json({ users, validity })

    } catch (error) {
        console.log(`error thrown in [/api/users] POST: ` + error);
    };
};


// edits an existing water user
export async function PATCH(req: Request) {
    try {
        const {
            token, pathname, updateInfo
        }: {
            token: string, pathname: string, updateInfo: userInfo
        } = await req.json();

        const validity = await validateRequest(token, pathname, 'PATCH');
        if (!validity) {
            console.log('message logged from [/api/users] PATCH: token validation failed');
            return NextResponse.json({ success: false, validity });
        };

        const dbClient = await dbConnect();
        const db = dbClient?.db('waterUsersDb');
        const collection = db?.collection('waterUsers');
        
        const cursor = await collection.updateOne(
            { _id: new ObjectId(updateInfo._id) },
            { $set: { info: updateInfo.info } }
        );

        if (cursor.modifiedCount == 1){
            return NextResponse.json({ success: true, validity });
        } else {
            return NextResponse.json({ success: false, validity });
        };

    } catch (error) {
        console.log(`error thrown in [/api/users] PATCH: ` + error);
    };
};


// adds a new water user
export async function PUT(req: Request) {
    try {
        const { token, pathname } = await req.json();

        const validity = await validateRequest(token, pathname, 'PUT');
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


/**
 * Attempts to validate request.
 * @param req - Request
 * @param method - string
 * @throws undefined if a server error is encountered
 * @returns boolean indicating token validity
 */
const validateRequest = async (token: string, pathname: string, method: string) => {
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
