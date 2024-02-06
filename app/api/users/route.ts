import { ObjectId } from "mongodb";
import { userInfo } from "../../lib/commonTypes";
import { NextResponse } from "next/server";
import { collectionConnect } from "../../lib/dbFunctions";
import { validateRequest } from "../../lib/authFunctions";

const origin = '/users';

// gets all water users' personal info
export async function POST(req: Request) {
    try {
        const { token, pathname } = await req.json();

        const validity = await validateRequest(token, pathname, origin, 'POST');
        if (!validity) {
            console.log(`message logged from [/api${origin}] POST: token validation failed`);
            return NextResponse.json({ users: [], validity });
        };

        const collection = await collectionConnect('waterUsers');
        const cursor = collection?.find({});
        const users = await cursor?.toArray();
        await cursor?.close();

        return NextResponse.json({ users, validity })

    } catch (error) {
        console.log(`error thrown in [/api/${origin}] POST: ` + error);
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

        const validity = await validateRequest(token, pathname, origin, 'PATCH');
        if (!validity) {
            console.log(`message logged from [/api${origin}] PATCH: token validation failed`);
            return NextResponse.json({ success: false, validity });
        };

        let collection = await collectionConnect('waterUsers');
        let cursor = await collection.updateOne(
            { _id: new ObjectId(updateInfo._id) },
            { $set: { 
                'info.name': updateInfo.info.name,
                'info.email': updateInfo.info.email,
                'info.address': updateInfo.info.address
            }}
        );
        if (cursor.modifiedCount == 0) {
            console.log("failed to update user's info in waterUsers collection")
            return NextResponse.json({ success: false, validity });
        };

        collection = await collectionConnect('usage');
        cursor = await collection.updateOne(
            { _id: new ObjectId(updateInfo._id) },
            { $set: { 'name': updateInfo.info.name } }
        );
        if (cursor.modifiedCount == 0) {
            console.log("failed to update user's name in usage collection")
            return NextResponse.json({ success: false, validity });
        };

        collection = await collectionConnect('balances');
        cursor = await collection.updateOne(
            { _id: new ObjectId(updateInfo._id) },
            { $set: { 'name': updateInfo.info.name } }
        );
        if (cursor.modifiedCount == 0) {
            console.log("failed to update user's name in balances collection")
            return NextResponse.json({ success: false, validity });
        };
        return NextResponse.json({ success: true, validity });

    } catch (error) {
        console.log(`error thrown in [/api${origin}] PATCH: ` + error);
        return NextResponse.json({});
    };
};


// adds a new water user
export async function PUT(req: Request) {
    try {
        const { token, pathname, newUserInfo }: {
            token: string, pathname: string, newUserInfo: userInfo['info']
        } = await req.json();

        const validity = await validateRequest(token, pathname, origin, 'PUT');
        if (!validity) {
            console.log(`message logged from [/api${origin}] PUT: token validation failed`);
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
            name: newUserInfo.name,
            data: {
                prev: {
                    Q1: { 1: 0, 2: 0, 3: 0 },
                    Q2: { 1: 0, 2: 0, 3: 0 },
                    Q3: { 1: 0, 2: 0, 3: 0 },
                    Q4: { 1: 0, 2: 0, 3: 0 },
                },
                cur: {
                    Q1: { 1: 0, 2: 0, 3: 0 },
                    Q2: { 1: 0, 2: 0, 3: 0 },
                    Q3: { 1: 0, 2: 0, 3: 0 },
                    Q4: { 1: 0, 2: 0, 3: 0 },
                }
            }
        });
        if (!cursor.acknowledged) {
            console.log('failed to insert new water usage data document in usage collection');
            collection = await collectionConnect('waterUsers');
            const cursor = await collection.deleteOne({ _id: new ObjectId(userId) });
            if (cursor.deletedCount == 0) {
                console.log(`failed to delete inserted water user ${userId} from waterUsers collection. manual db correction required...`)
            };
            return NextResponse.json({ success: false, validity, newUser: undefined });
        }

        // insert new balance history document into balances collection
        collection = await collectionConnect('balances');
        cursor = await collection.insertOne({
            _id: userId,
            name: newUserInfo.name,
            cur: [
                {
                    timeStamp: new Date().valueOf(),
                    note: 'new user inital balance',
                    balanceChange: newUserInfo.balance,
                    newBalance: newUserInfo.balance
                }
            ],
            prev: []
        })
        if (!cursor.acknowledged) {
            console.log('failed to insert new water usage balance document in balance collection');
            collection = await collectionConnect('waterUsers');
            let cursor = await collection.deleteOne({ _id: new ObjectId(userId) });
            if (cursor.deletedCount == 0) {
                console.log(`failed to delete inserted water user ${userId} from waterUsers collection. manual db correction required...`)
            };
            collection = await collectionConnect('usage');
            cursor = await collection.deleteOne({ _id: new ObjectId(userId) });
            if (cursor.deletedCount == 0) {
                console.log(`failed to delete inserted water user ${userId} from usage collection. manual db correction required...`)
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
        console.log(`error thrown in [/api${origin}] PUT: ` + error);
        return NextResponse.json({});
    };
};


// deletes a water user
export async function DELETE(req: Request) {
    try {
        const { token, pathname, userId }: {
            token: string, pathname: string, userId: string
        } = await req.json();

        const validity = await validateRequest(token, pathname, origin, 'DELETE');
        if (!validity) {
            console.log(`message logged from [/api${origin}] PUT: token validation failed`);
            return NextResponse.json({ success: false, validity });
        };

        let collection = await collectionConnect('waterUsers');
        let cursor = await collection.deleteOne({ _id: new ObjectId(userId) });
        if (cursor.deletedCount == 0) {
            console.log('failed to delete user from waterUsers collection. manual db correction required...');
            return NextResponse.json({ success: false, validity });
        }

        collection = await collectionConnect('usage');
        cursor = await collection.deleteOne({ _id: new ObjectId(userId) });
        if (cursor.deletedCount == 0) {
            console.log('failed to delete user from waterUsers collection. manual db correction required...');
            return NextResponse.json({ success: false, validity });
        }

        collection = await collectionConnect('balances');
        cursor = await collection.deleteOne({ _id: new ObjectId(userId) });
        if (cursor.deletedCount == 0) {
            console.log('failed to delete user from waterUsers collection. manual db correction required...');
            return NextResponse.json({ success: false, validity });
        }

        return NextResponse.json({ success: true, validity });

    } catch (error) {
        console.log(`error thrown in [/api${origin}] PUT: ` + error);
        return NextResponse.json({});
    };
};
