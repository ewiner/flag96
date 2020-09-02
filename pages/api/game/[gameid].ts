import faunadb from 'faunadb';
import {NextApiRequest, NextApiResponse} from "next";

const secret = process.env.FAUNADB_SECRET_KEY
const q = faunadb.query
const client = new faunadb.Client({secret})

export default async (req: NextApiRequest, res: NextApiResponse) => {
    const gameid = req.query.gameid;
    try {
        const dbs: any = await client.query(
            q.Map(
                q.Paginate(
                    q.Documents(q.Collection('saves'))
                ),
                ref => q.Get(ref)
            )
        )
        const resultJson = dbs.data
        res.status(200).json(JSON.stringify(resultJson, undefined, 2))
    } catch (e) {
        res.status(500).json({error: e.message})
    }
}
