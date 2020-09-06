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
                    Lambda("X", Select(["data", "gamedata"], Get(Var("X"))))
                )

                const dbs: any = await client.query(getQuery)
                let maybeGamedata = dbs.data;
                if (maybeGamedata.length === 0) {
                    res.status(404).end()
                } else {
                    let gamedata = maybeGamedata[0];
                    res.status(200).json({gamedata})
                }
                break;
            case "PUT":
                const useragent = new UAParser(req.headers['user-agent']).getResult()
                const data = {
                    gameid,
                    gamedata: req.body.gamedata,
                    userid: req.body.userid,
                    useragent: useragent,
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
