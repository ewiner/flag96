import faunadb, {query} from 'faunadb';
import {NextApiRequest, NextApiResponse} from "next";
import {UAParser} from 'ua-parser-js';

const IsEmpty = query.IsEmpty;
const Replace = query.Replace;
const Var = query.Var;
const Create = query.Create;
const Get = query.Get;
const Select = query.Select;
const Collection = query.Collection;
const Let = query.Let;
const Index = query.Index;
const If = query.If;
const Match = query.Match;
const Lambda = query.Lambda;
const Paginate = query.Paginate;

const secret = process.env.FAUNADB_SECRET_KEY
const client = new faunadb.Client({secret})

export default async (req: NextApiRequest, res: NextApiResponse) => {
    const gameid = req.query.gameid;
    const matchGameid = Match(Index("saves_by_gameid"), gameid);
    try {
        switch (req.method) {
            case "GET":
                const getQuery = query.Map(
                    Paginate(matchGameid),
                    Lambda("X", Select("data", Get(Var("X"))))
                )

                const dbs: any = await client.query(getQuery)
                const maybeData = dbs.data;
                if (maybeData.length === 0) {
                    res.status(404).end()
                } else if (maybeData.length > 1) {
                    console.error(`Received ${maybeData.length} results instead of the expected 1.`)
                    console.error(maybeData)
                } else {
                    const data = maybeData[0];
                    const {gamedata, userid} = data;
                    res.status(200).json({gamedata, userid})
                }
                break;
            case "POST":
            case "PUT":
                const gamedata = req.method == "PUT" ? req.body.gamedata : null
                const useragent = new UAParser(req.headers['user-agent']).getResult()
                const data = {
                    gameid,
                    gamedata,
                    useragent,
                    userid: req.body.userid,
                    ip: req.connection.remoteAddress
                }

                const putQuery = Let(
                    {existing: matchGameid},
                    If(
                        IsEmpty(Var("existing")),
                        Create(Collection("saves"), {data}),
                        Replace(Select("ref", Get(Var("existing"))), {data})
                    )
                )
                await client.query(putQuery)
                res.status(200).end()
                break;
            default:
                res.status(404).json({error: `Unknown method ${req.method}.`})
                break;
        }
    } catch (e) {
        res.status(500).json({error: e.message})
    }
}
