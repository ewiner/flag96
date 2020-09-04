import Dosbox, {DosboxRef} from "../components/dosbox";
import {useEffect, useRef} from "react";
import {gameNamePbemCursorOff, gameNamePbemCursorOn, nameEric, savePbem} from '../components/crops';
import SiteLayout from "../components/SiteLayout";

export default function Home() {
    const dosref = useRef<DosboxRef>(null);

    async function onClickNew() {
        // P (hits Print to close the menu if open, nop if menu is not open)
        // Alt
        // F (file menu) (already open at game launch)
        // N (new game)
        // U (human vs human)
        // O (OK)
        // M (play over modem)
        // O (OK)
        await dosref.current.sendStrokes([':p', 'alt', ':fnuomo']);
        await dosref.current.watchForImage(nameEric)
        await dosref.current.sendStrokes(['enter', ':foo', 'enter']);
    }

    const syncSaves = async function () {
        await dosref.current.watchForImage(savePbem)
        if (!dosref.current.hasImage(gameNamePbemCursorOff) && !dosref.current.hasImage(gameNamePbemCursorOn)) {
            // type filename, since it's not filled in already
            await dosref.current.sendStrokes([':game'])
        }
        await dosref.current.sendStrokes(['enter', 'enter', ':p']);
        await syncSaves()
    }

    useEffect(() => {
        syncSaves().catch(console.error)
    }, []);

    return (
        <SiteLayout>
            <Dosbox ref={dosref} zip="/capflag5.zip" exe="capflag.exe"/>
            <button type="button" onClick={onClickNew}>New Game</button>
        </SiteLayout>
    )
}
