// import { MongoClient, type ServerApiVersion } from "mongodb";

// const uri = process.env.MONGODB_URI;
// const options = {
//     serverApi: {
//         version: ServerApiVersion.v1,
//         strict: true,
//         deprecationErrors: true,
//     },
// };

// let client: MongoClient | null = null;
// let clientPromise: Promise<MongoClient> | null = null;
let clientPromise: null = null;

// declare global {
//     var _mongoClientPromise: Promise<MongoClient>;
// };

// if (!uri) {
//     throw new Error ('MONGODB_URI not defined in .env.local');
// };

// if (process.env.NODE_ENV && process.env.NODE_ENV == "development") {
//     // In development mode, use a global variable so that the value
//     // is preserved across module reloads caused by HMR (Hot Module Replacement).
//     if (!global._mongoClientPromise) {
//         client = new MongoClient(uri, options);
//         global._mongoClientPromise = client.connect();
//     };
//     clientPromise = global._mongoClientPromise;

// } else {
//     // In production mode, it's best to not use a global variable.
//     client = new MongoClient(uri, options);
//     clientPromise = client.connect();
// };

// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
export default clientPromise;