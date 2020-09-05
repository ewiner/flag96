import Dosbox, {DosboxRef} from "../components/Dosbox";
import {useEffect, useRef, useState} from "react";
import {gameNamePbemCursorOff, gameNamePbemCursorOn, pickLocation, savePbem} from '../components/crops';
import SiteLayout from "../components/SiteLayout";
import {useRouter} from "next/router";
import hri from 'human-readable-ids';

export default function Home() {
    const dosref = useRef<DosboxRef>(null);
    const router = useRouter();
    const [urlPopup, setUrlPopup] = useState({popped: false, type: null});

    const abortController = useRef(typeof window !== 'undefined'
        ? new AbortController()
        : {abort: () => undefined, signal: null}
    );

    // "game" is the default (thanks to next.config.js)
    const gameid = router.query.gameid === "game" ? undefined : router.query.gameid as string

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
        setUrlPopup({popped: true, type: "saved"})
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
        await dos.sendStrokes([":m", "enter"])
        console.log(`Detected new game, routing...`)

        await router.push('/[gameid]', `/${hri.hri.random()}`, {shallow: true})
        setUrlPopup({popped: true, type: "newgame"})
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

    useEffect(() => {
        if (urlPopup.popped) {
            setTimeout(() => setUrlPopup(p => ({popped: false, type: p.type})), 16)
        }
    }, [urlPopup])

    const popupContents = () => {
        switch (urlPopup.type) {
            case "saved":
                let currentUrl = "the URL";
                if (global.window !== undefined) {
                    currentUrl = window.location.href;
                }
                return <span>
                    <span style={{
                        transform: "scaleX(-1)",
                        display: "inline-block"
                    }}>⤴</span> Send {currentUrl} to your opponent!
                </span>
            case "newgame":
                return <span>After your turn, send this URL to your opponent!</span>
            default:
                return null;
        }
    }

    const popupDuration = () => {
        switch (urlPopup.type) {
            case "saved":
                return 30;
            case "newgame":
                return 3;
            default:
                return 3;
        }
    }

    return (
        <>
            {/* language=CSS */}
            <style jsx>{`
                .popup {
                    position: absolute;
                    z-index: 101;
                    top: 32px;
                    left: 80px;
                    max-width: 880px;
                    color: black;
                    font-family: monospace;
                    font-size: xx-large;
                }

                .speech-bubble {
                    position: relative;
                    background: #ffffff;
                    border-radius: .4em;
                    padding: 15px;
                }

                .speech-bubble:after {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 20%;
                    width: 0;
                    height: 0;
                    border: 20px solid transparent;
                    border-bottom-color: #ffffff;
                    border-top: 0;
                    border-left: 0;
                    margin-left: -10px;
                    margin-top: -20px;
                }

                .popup.unpopped {
                    opacity: 0;
                    visibility: hidden;
                }

                .popup.popped {
                    opacity: 1;
                    visibility: visible;
                }

            `}</style>
            {/* language=CSS */}
            <style>{`                
                .popup.unpopped {
                    transition: visibility 0s ${popupDuration() + 3}s, opacity 3s ease-out ${popupDuration()}s;
                }
            `}</style>
            <div className={`popup ${urlPopup.popped ? "popped" : "unpopped"}`}>
                <div className="speech-bubble">
                    {popupContents()}
                </div>
            </div>
            <SiteLayout>
                <Dosbox ref={dosref} zip="/capflag5.zip" exe="capflag.exe"/>
            </SiteLayout>
        </>
    )
}
