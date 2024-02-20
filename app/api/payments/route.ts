import { ObjectId } from "mongodb";
import { userInfo } from "../../lib/commonTypes";
import { NextResponse } from "next/server";
import { collectionConnect } from "../../lib/dbFunctions";
import { validateRequest } from "../../lib/authFunctions";

const origin = '/payments';

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
