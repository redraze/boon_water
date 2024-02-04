import { MongoClient, ServerApiVersion } from "mongodb";

const uri = process.env.MONGODB_URI;
const options = {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
};

let client: MongoClient | undefined;
let clientPromise: Promise<MongoClient> | undefined;

declare global {
    var mongoClientPromise: Promise<MongoClient> | undefined;
};

export const dbConnect = async () => {
    // if (clientPromise) { return clientPromise };

    if (!uri) {
        throw new Error ('MONGODB_URI not defined in .env.local');
    };

    if (!global.mongoClientPromise) {
        client = new MongoClient(uri, options);
        global.mongoClientPromise = client.connect();
    };
    clientPromise = global.mongoClientPromise;

    return clientPromise;
};
