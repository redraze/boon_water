import { NextResponse } from "next/server";
import { validateRequest } from "../../lib/authFunctions";
import { collectionConnect } from "../../lib/dbFunctions";

const origin = '/reporting';

// gets all water users' water usage data
export async function POST(req: Request) {
    try {
        const { token, pathname } = await req.json();

        const validity = await validateRequest(token, pathname, origin, 'POST');
        if (!validity) {
            console.log(`message logged from [/api${origin}] POST: token validation failed`);
            return NextResponse.json({ data: [], validity });
        };

        const collection = await collectionConnect('usage');
        const cursor = collection?.find({});
        const data = await cursor?.toArray();
        await cursor?.close();

        return NextResponse.json({ data, validity })

    } catch (error) {
        console.log(`error thrown in [/api${origin}] POST: ` + error);
        return NextResponse.json({});
    };
};
