import Dosbox, {DosboxRef} from "../components/Dosbox";
import {useEffect, useRef, useState} from "react";
import {
    fromBase64,
    gameNamePbemCursorOff,
    gameNamePbemCursorOn, homeScreen,
    pickLocation,
    savePbem,
    toBase64
} from '../components/crops';
import SiteLayout from "../components/SiteLayout";
import {useRouter} from "next/router";
import hri from 'human-readable-ids';
import Popup, {PopupType} from "../components/Popup";
import useSWR from 'swr'
import {get as idbGet, set as idbSet} from 'idb-keyval'
import {v4 as uuidv4} from 'uuid';

const fetcher = async (url) => {
    const res = await fetch(url)
    if (res.ok) return await res.json()
    else {
        const error = new Error(`An error occurred while fetching ${url}.`)
        error['info'] = await res.text()
        error['status'] = res.status
        console.error(error)
        throw error
    }
}

async function getUserid() {
    const existingId = await idbGet("userid") as string
    if (existingId) return existingId
    const newId = uuidv4() as string
    await idbSet("userid", newId)
    return newId
}

async function save(gameid: String, userid: String, gamedata: String = undefined) {
    let url = `/api/game/${gameid}`;
    let method = gamedata ? "PUT" : "POST";
    const res = await fetch(url, {
        method,
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({userid, gamedata})
    });
    if (res.ok) return
    else {
        const error = new Error(`An error occurred while fetching ${url}.`)
        error['info'] = await res.text()
        error['status'] = res.status
        console.error(error)
        throw error
    }
}

type ApiResponse = { gamedata: String, userid: String }

const inBrowser = typeof window !== 'undefined';
const hasNoMouseOrTrackpad = inBrowser && window.matchMedia("(any-hover: none)").matches;

export default function Home() {
    const dosref = useRef<DosboxRef>(null);
    const router = useRouter();
    const [userid, setUserid] = useState<string>(null);

    // "game" is the default (thanks to next.config.js)
    const gameid = router.query.gameid === "game" ? undefined : router.query.gameid as string

    const [urlPopup, setUrlPopup] = useState({popkey: 0, type: null});

    const abortController = useRef(inBrowser
        ? new AbortController()
        : {abort: () => undefined, signal: null}
    );

    const fetchResult = useSWR<ApiResponse, any>(
        gameid && `/api/game/${gameid}`,
        fetcher,
        {refreshInterval: 3000}
    )
    const fetchError = fetchResult.error
    const fetchData = fetchResult.data

    const waiting = fetchData // data is loaded from the DB
        && userid // userid has been generated and stored
        && fetchData.gamedata // and it's not a new game just started by `userid`
        && fetchData.userid === userid // but `userid` posted the last move

    const isMyTurn = fetchData // data is loaded from the DB
        && userid // userid has been generated and stored
        && fetchData.gamedata // and it's not a new game just started
        && fetchData.userid !== userid // but someone else posted the last move

    const popPopup = (type: PopupType) => setUrlPopup(p => ({popkey: p.popkey + 1, type}))

    useEffect(() => {
        getUserid().then(setUserid).catch(console.error)
    }, [])

    const syncSaves = async function () {
        if (!gameid) return

        console.log(`Starting save sync detector with gameId ${gameid}!`)
        const dos = dosref.current;
        const abortSignal = abortController.current.signal
        await dos.watchForImage(savePbem, abortSignal)
        if (abortSignal.aborted) {
            console.log(`Aborting save sync detector with gameId ${gameid}!`)
            return;
        }

        if (!dos.hasImage(gameNamePbemCursorOff) && !dos.hasImage(gameNamePbemCursorOn)) {
            // type filename, since it's not filled in already
            await dos.sendStrokes([':game'])
        }
        await dos.sendStrokes(['enter', 'esc', ':p']);

        const gamefile = await dos.getFile("/game/GAME.MD1")
        await save(gameid, userid, toBase64(gamefile))

        popPopup(PopupType.Saved)
        await syncSaves() // repeat!
    }

    const detectNewGame = async function () {
        console.log(`Starting new game detector with gameId ${gameid}!`)
        const dos = dosref.current;
        const abortSignal = abortController.current.signal
        await dos.watchForImage(pickLocation, abortSignal)
        if (abortSignal.aborted) {
            console.log(`Aborting new game detector with gameId ${gameid}!`)
            return;
        }

        let newGameid = hri.hri.random();
        console.log(`Detected new game, assigned id ${newGameid}...`)
        await Promise.all([
            dos.sendStrokes([":m", "enter"]), // takes a second, so run this in parallel
            (async () => {
                await save(newGameid, userid),
                    await router.push('/[gameid]', `/${newGameid}`, {shallow: true})
                await popPopup(PopupType.NewGame)
            })()
        ])
    }

    useEffect(() => {
        syncSaves().catch(console.error)
        detectNewGame().catch(console.error)

        return () => {
            console.log('Aborting current waiters...')
            abortController.current.abort()
            abortController.current = new AbortController();
        }
    }, [router, userid]);

    const loadSavedGame = async function () {
        if (isMyTurn) {
            console.log(`Detected a game to play!  Waiting for home screen...`)
            const dos = dosref.current;
            const abortSignal = abortController.current.signal
            await dos.watchForImage(homeScreen, abortSignal)
            if (abortSignal.aborted) {
                console.log(`Aborting saved game loader with gameId ${gameid}!`)
                return;
            }

            console.log(`Save home screen, loading saved game ${gameid}`)
            const gameFile = new Uint8Array(fromBase64(fetchData.gamedata))
            await dos.writeFile("/game/GAME.MD1", gameFile)
            await dos.sendStrokes([":p", "alt", ":fbgame", "enter"])
        }
    }

    useEffect(() => {
        loadSavedGame().catch(console.error)
    }, [isMyTurn])

    if (hasNoMouseOrTrackpad) {
        // https://stackoverflow.com/a/52854585
        return <SiteLayout>
            Desktop only!
        </SiteLayout>
    }
    if (!fetchData && fetchError) {
        return <SiteLayout>
            Error!
        </SiteLayout>
    } else {
        return <>
            <Popup {...urlPopup}/>
            <SiteLayout>
                <Dosbox ref={dosref} zip="/capflag5.zip" exe="capflag.exe" postStart={["down"]}/>
                {waiting ? "WAITING" : null}
            </SiteLayout>
        </>
    }
}
