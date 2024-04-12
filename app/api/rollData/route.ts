import { NextResponse } from "next/server";
import { validateRequest } from "../../lib/authFunctions";

const origin = '/rollData';

// gets a water users' balance history by id
export async function POST(req: Request) {
    try {
        const { token, pathname } = await req.json();

        const validity = await validateRequest(token, pathname, origin, 'POST');
        if (!validity) {
            console.log(`message logged from [/api${origin}] POST: token validation failed`);
            return NextResponse.json({ success: false, validity });
        };

        // TODO: move cur year data into prev year data table

        // const collection = await collectionConnect('balances');
        // const cursor = collection?.find({});
        // const data = await cursor?.toArray();
        // await cursor?.close();

        return NextResponse.json({ success: true, validity })

    } catch (error) {
        console.log(`error thrown in [/api${origin}] POST: ` + error);
        return NextResponse.json({});
    };
};
