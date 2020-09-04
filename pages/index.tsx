import Dosbox, {DosboxRef} from "../components/dosbox";
import {useEffect, useRef} from "react";
import {gameNamePbemCursorOff, gameNamePbemCursorOn, nameEric, pickLocation, savePbem} from '../components/crops';
import SiteLayout from "../components/SiteLayout";
import {useRouter} from "next/router";
import hri from 'human-readable-ids';

export default function Home() {
    const dosref = useRef<DosboxRef>(null);
    const router = useRouter();

    const abortController = useRef(typeof window !== 'undefined'
        ? new AbortController()
        : {abort: () => undefined, signal: null}
    );
    const gameId = router.query.g

    async function onClickNew() {
        // P (hits Print to close the menu if open, nop if menu is not open)
        // Alt
        // F (file menu) (already open at game launch)
        // N (new game)
        // U (human vs human)
        // O (OK)
        // M (play over modem)
        // O (OK)
        const dos = dosref.current;
        await dos.sendStrokes([':p', 'alt', ':fnuomo']);
        await dos.watchForImage(nameEric)
        await dos.sendStrokes(['enter', ':foo', 'enter']);
    }

    const syncSaves = async function () {
        console.log(`Starting save sync detector with gameId ${gameId}!`)
        const dos = dosref.current;
        const abortSignal = abortController.current.signal
        await dos.watchForImage(savePbem, abortSignal)
        if (abortSignal.aborted) {
            console.log(`Aborting save sync detector with gameId ${gameId}!`)
            return;
        }
        if (!dos.hasImage(gameNamePbemCursorOff) && !dos.hasImage(gameNamePbemCursorOn)) {
            // type filename, since it's not filled in already
            await dos.sendStrokes([':game'])
        }
        await dos.sendStrokes(['enter', 'enter', ':p']);
        await syncSaves()
    }

    const detectNewGame = async function () {
        console.log(`Starting new game detector with gameId ${gameId}!`)
        const dos = dosref.current;
        const abortSignal = abortController.current.signal
        await dos.watchForImage(pickLocation, abortSignal)
        if (abortSignal.aborted) {
            console.log(`Aborting new game detector with gameId ${gameId}!`)
            return;
        }
        await dos.sendStrokes([":m", "enter"])
        console.log(`Detected new game, routing...`)

        await router.push(`/?g=${hri.hri.random()}`)
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
        <SiteLayout>
            <Dosbox ref={dosref} zip="/capflag5.zip" exe="capflag.exe"/>
            <button type="button" onClick={onClickNew}>New Game</button>
        </SiteLayout>
    )
}
