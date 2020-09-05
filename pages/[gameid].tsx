import Dosbox, {DosboxRef} from "../components/Dosbox";
import {useEffect, useRef, useState} from "react";
import {gameNamePbemCursorOff, gameNamePbemCursorOn, pickLocation, savePbem} from '../components/crops';
import SiteLayout from "../components/SiteLayout";
import {useRouter} from "next/router";
import hri from 'human-readable-ids';
import Popup, {PopupType} from "../components/Popup";

export default function Home() {
    const dosref = useRef<DosboxRef>(null);
    const router = useRouter();
    const [urlPopup, setUrlPopup] = useState({popkey: 0, type: null});

    const abortController = useRef(typeof window !== 'undefined'
        ? new AbortController()
        : {abort: () => undefined, signal: null}
    );

    // "game" is the default (thanks to next.config.js)
    const gameid = router.query.gameid === "game" ? undefined : router.query.gameid as string

    const popPopup = (type: PopupType) => setUrlPopup(p => ({popkey: p.popkey + 1, type}))

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
        await dos.sendStrokes(['enter', 'enter', ':p']);
        // todo: upload save
        popPopup(PopupType.Saved)
        await syncSaves()
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
        popPopup(PopupType.NewGame)
        await dos.sendStrokes([":m", "enter"])
        console.log(`Detected new game, routing...`)

        await router.push('/[gameid]', `/${hri.hri.random()}`, {shallow: true})
    }

    useEffect(() => {
        syncSaves().catch(console.error)
        detectNewGame().catch(console.error)

        return () => {
            console.log('Aborting current waiters...')
            abortController.current.abort()
            abortController.current = new AbortController();
        }
    }, [router]);

    return (
        <>
            <Popup {...urlPopup}/>
            <SiteLayout>
                <Dosbox ref={dosref} zip="/capflag5.zip" exe="capflag.exe"/>
            </SiteLayout>
        </>
    )
}
