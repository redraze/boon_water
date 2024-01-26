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
    var mongoClientPromise: Promise<MongoClient> | undefined
}

export const dbConnect = async () => {
    if (!uri) {
        throw new Error ('MONGODB_URI not defined in .env.local');
    };

    if (process.env.NODE_ENV && process.env.NODE_ENV == "development") {
        // In development mode, use a global variable so that the value
        // is preserved across module reloads caused by HMR (Hot Module Replacement).
        if (!global.mongoClientPromise) {
            client = new MongoClient(uri, options);
            global.mongoClientPromise = client.connect();
        };
        clientPromise = global.mongoClientPromise;
    
    } else {
        // In production mode, it's best to not use a global variable.
        client = new MongoClient(uri, options);
        clientPromise = client.connect();
    };

    return clientPromise;
};
