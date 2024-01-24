import { MongoClient, ServerApiVersion } from "mongodb";

let client: MongoClient | null = null;

export const dbConnect = async() => {
    if (client) return client;

    try{
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI is not defined');
        };

        client = new MongoClient(process.env.MONGODB_URI, {
            serverApi: {
                version: ServerApiVersion.v1,
                strict: true,
                deprecationErrors: true,
            }
        });

        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();

        // Send a ping to confirm a successful connection
        await client.db("BoonWater").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");

    } catch (error) {
        console.log('error thrown in [/lib/dbConnect] dbConnect function: ' + error);

        // Ensures that the client will close if error is thrown
        await client?.close();
        client =  null;
    };
};
