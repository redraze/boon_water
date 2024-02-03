import { dbConnect } from "./dbConnect";

/**
 * @returns the waterUsers collection in the waterUsersDb database.
 */
export const collectionConnect = async (name: string) => {
    const dbClient = await dbConnect();
    const db = dbClient?.db('waterUsersDb');
    const collection = db?.collection(name);
    return collection;
};
