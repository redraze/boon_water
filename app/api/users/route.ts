import { ObjectId } from "mongodb";
import { userInfo } from "../../lib/commonTypes";
import { dbConnect } from "../../lib/dbConnect";
import { verifyToken } from "../../lib/authFunctions";
import { NextResponse } from "next/server";

// gets all water users' personal info
export async function POST(req: Request) {
    try {
        const { token, pathname } = await req.json();

        const validity = await validateRequest(token, pathname, 'POST');
        if (!validity) {
            console.log('message logged from [/api/users] POST: token validation failed');
            return NextResponse.json({ users: [], validity });
        };

        const collection = await collectionConnect('waterUsers');
        const cursor = collection?.find({});
        const users = await cursor?.toArray();
        await cursor?.close();

        return NextResponse.json({ users, validity })

    } catch (error) {
        console.log(`error thrown in [/api/users] POST: ` + error);
        return NextResponse.json({});
    };
};


// edits an existing water user's contact info
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

        const collection = await collectionConnect('waterUsers');
        const cursor = await collection.updateOne(
            { _id: new ObjectId(updateInfo._id) },
            { $set: { 
                'info.name': updateInfo.info.name,
                'info.email': updateInfo.info.email,
                'info.address': updateInfo.info.address
            }}
        );

        if (cursor.modifiedCount == 0) {
            return NextResponse.json({ success: false, validity });
        };
        return NextResponse.json({ success: true, validity });

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

        // insert new water user document into the waterUsers collection
        let collection = await collectionConnect('waterUsers');
        let cursor = await collection.insertOne({ info: newUserInfo });
        const userId = cursor.insertedId;
        if (!userId) {
            console.log('failed to insert water user into waterUsers collection');
            return NextResponse.json({ success: false, validity, newUser: undefined });
        };

        // insert water usage data document into usage collection
        collection = await collectionConnect('usage');
        cursor = await collection.insertOne({
            _id: userId,
            prev: {
                Q1: { 1: 0, 2: 0, 3: 0 },
                Q2: { 4: 0, 5: 0, 6: 0 },
                Q3: { 7: 0, 8: 0, 9: 0 },
                Q4: { 10: 0, 11: 0, 12: 0 }
            },
            cur: {
                Q1: { 1: 0, 2: 0, 3: 0 },
                Q2: { 4: 0, 5: 0, 6: 0 },
                Q3: { 7: 0, 8: 0, 9: 0 },
                Q4: { 10: 0, 11: 0, 12: 0 }
            }
        });
        if (!cursor.acknowledged) {
            console.log('failed to insert new water usage data document in usage collection');
            collection = await collectionConnect('waterUsers');
            const cursor = await collection.deleteOne({ _id: new ObjectId(userId) });
            if (cursor.deletedCount == 0) {
                console.log(`failed to delete inserted water user ${userId} from waterUsers collection. direct db modification required...`)
            };
            return NextResponse.json({ success: false, validity, newUser: undefined });
        }

        // insert new balance history document into balance collection
        collection = await collectionConnect('balances');
        cursor = await collection.insertOne({
            _id: userId,
            prev: {},
            cur: {
                'new user creation': newUserInfo.balance
            }
        })
        if (!cursor.acknowledged) {
            console.log('failed to insert new water usage balance document in balance collection');
            collection = await collectionConnect('waterUsers');
            let cursor = await collection.deleteOne({ _id: new ObjectId(userId) });
            if (cursor.deletedCount == 0) {
                console.log(`failed to delete inserted water user ${userId} from waterUsers collection. direct db modification required...`)
            };
            collection = await collectionConnect('usage');
            cursor = await collection.deleteOne({ _id: new ObjectId(userId) });
            if (cursor.deletedCount == 0) {
                console.log(`failed to delete inserted water user ${userId} from usage collection. direct db modification required...`)
            };
            return NextResponse.json({ success: false, validity, newUser: undefined });
        };

        return NextResponse.json({
            success: true,
            validity,
            newUser: {
                _id: userId,
                info: newUserInfo
            }
        });

    } catch (error) {
        console.log(`error thrown in [/api/users] PUT: ` + error);
        return NextResponse.json({});
    };
};


// deletes a water user
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

        let collection = await collectionConnect('waterUsers');
        let cursor = await collection.deleteOne({ _id: new ObjectId(userId) });
        if (cursor.deletedCount == 0) {
            console.log('failed to delete user from waterUsers collection. direct db modification required...');
            return NextResponse.json({ success: false, validity });
        }

        collection = await collectionConnect('usage');
        cursor = await collection.deleteOne({ _id: new ObjectId(userId) });
        if (cursor.deletedCount == 0) {
            console.log('failed to delete user from waterUsers collection. direct db modification required...');
            return NextResponse.json({ success: false, validity });
        }

        collection = await collectionConnect('balances');
        cursor = await collection.deleteOne({ _id: new ObjectId(userId) });
        if (cursor.deletedCount == 0) {
            console.log('failed to delete user from waterUsers collection. direct db modification required...');
            return NextResponse.json({ success: false, validity });
        }

        return NextResponse.json({ success: true, validity });

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
const collectionConnect = async (name: string) => {
    const dbClient = await dbConnect();
    const db = dbClient?.db('waterUsersDb');
    const collection = db?.collection(name);
    return collection;
};
