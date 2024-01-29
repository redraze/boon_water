import { ObjectId } from "mongodb";
import { userInfo } from "../../lib/commonTypes";
import { dbConnect } from "../../lib/dbConnect";
import { verifyToken } from "../../lib/authFunctions";
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

        const collection = await waterUsersCollection();
        const cursor = collection?.find({});
        const users = await cursor?.toArray();
        await cursor?.close();

        return NextResponse.json({ users, validity })

    } catch (error) {
        console.log(`error thrown in [/api/users] POST: ` + error);
        return NextResponse.json({});
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

        const collection = await waterUsersCollection();
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
        return NextResponse.json({});
    };
};


// adds a new water user
export async function PUT(req: Request) {
    try {
        const { token, pathname, newUserInfo }: {
            token: string, pathname: string, newUserInfo: userInfo['info']
        } = await req.json();

        const validity = await validateRequest(token, pathname, 'PUT');
        if (!validity) {
            console.log('message logged from [/api/users] PUT: token validation failed');
            return NextResponse.json({ success: false, validity, newUser: undefined });
        };

        const collection = await waterUsersCollection();
        const cursor = await collection.insertOne({info: newUserInfo});

        if (!cursor.insertedId) {
            return NextResponse.json({ success: false, validity, newUser: undefined });
        } else {
            return NextResponse.json({
                success: true,
                validity,
                newUser: {
                    _id: cursor.insertedId,
                    info: newUserInfo
                }
            });
        };

    } catch (error) {
        console.log(`error thrown in [/api/users] PUT: ` + error);
        return NextResponse.json({});
    };
};


// deleted a water user's info (but not the user's historical water usage data)
export async function DELETE(req: Request) {
    try {
        const { token, pathname, userId }: {
            token: string, pathname: string, userId: string
        } = await req.json();

        const validity = await validateRequest(token, pathname, 'DELETE');
        if (!validity) {
            console.log('message logged from [/api/users] PUT: token validation failed');
            return NextResponse.json({ success: false, validity });
        };

        const collection = await waterUsersCollection();
        const cursor = await collection.deleteOne({ _id: new ObjectId(userId) });

        if (cursor.deletedCount == 0) {
            return NextResponse.json({ success: false, validity });
        } else {
            return NextResponse.json({ success: true, validity });
        };

    } catch (error) {
        console.log(`error thrown in [/api/users] PUT: ` + error);
        return NextResponse.json({});
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


/**
 * @returns the waterUsers collection in the waterUsersDb database.
 */
const waterUsersCollection = async () => {
    const dbClient = await dbConnect();
    const db = dbClient?.db('waterUsersDb');
    const collection = db?.collection('waterUsers');
    return collection;
};
