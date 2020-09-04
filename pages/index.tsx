import Head from 'next/head'
import Dosbox, {DosboxRef} from "../components/dosbox";
import {useEffect, useRef, useState} from "react";
import {gameNamePbemCursorOff, gameNamePbemCursorOn, nameEric, savePbem} from '../components/crops';

export default function Home() {
    const dosref = useRef<DosboxRef>(null);
    const [whatOpen, setWhatOpen] = useState(false)

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
        <>
            {/* language=CSS */}
            <style jsx global>{`                
                #__next {
                    display: flex;
                    flex-flow: column;
                    height: 100%;
                }
                
                html, body {
                  height: 100%;
                  margin: 0;
                }
            `}</style>
            {/* language=CSS */}
            <style jsx>{`
                header {
                    font-family: monospace;
                    color: white;
                    text-shadow: -2px -2px 0 #000, 2px -2px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000;
                    padding-left: 24px;
                    padding-top: 24px;
                }
                
                .title {
                    font-size: 42px;
                    font-weight: bold;
                }
                
                .what {
                    margin-left: 24px;
                    margin-right: 20px;
                    font-size: 20px;
                    text-decoration: underline;
                    font-style: italic;
                    cursor: pointer;
                    position: relative;
                }
                
                .what .popup {
                    position: absolute;
                    left: 35px;
                    top: 50px;
                    width: max-content;
                }
                
                .speech-bubble {
                    position: relative;
                    background: #ffffff;
                    border-radius: .4em;
                    color: black;
                    text-outline: none;
                    text-shadow: none;
                    font-style: normal;
                    padding: 20px;
                    font-size: large;
                    cursor: auto;
                }
                
                .speech-bubble:after {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 50%;
                    width: 0;
                    height: 0;
                    border: 20px solid transparent;
                    border-bottom-color: #ffffff;
                    border-top: 0;
                    border-left: 0;
                    margin-left: -10px;
                    margin-top: -20px;
                }
                
                main {
                    flex: 1 1 auto;
                }
                
                footer {
                    position: fixed;
                    bottom: 12px;
                    right: 12px;
                    font-family: monospace;
                    color: white;
                    font-style: italic;
                    text-shadow: -2px -2px 0 #000, 2px -2px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000;
                }
                
                .desktop {
                    background-image: url("pc4.jpg");
                    background-size: 2150px auto;
                    background-repeat: no-repeat;
                    background-position: top center;
                    position: relative;
                    height: 100%;
                    width: 100%;
                    min-height: 800px;
                }
                
                .dosbox-box {
                    position: absolute;
                    top: 230px;
                    left: calc(50% - 195px);
                }
            `}</style>
            {/* language=CSS */}
            <style jsx>{`
                .what .popup {
                    visibility: ${whatOpen ? "visible" : "hidden"};
                 }
            `}</style>
            <Head>
                <title>Flag96</title>
            </Head>

            <main>
                <div className="desktop">
                    <header>
                        <span className="title">Capture the Flag '96 Online</span>
                        <span className="what">
                            <span onClick={() => setWhatOpen(o => !o)}>what is this?</span>
                            <span className="popup"><div className="speech-bubble">
                                popup text TBD!
                            </div></span>
                        </span>
                        {/* TODO: use a font instead of an img, so the underline works */}
                        <a href="https://github.com/ewiner/flag96" className="ghlink" target="_blank"><img alt="Github Link" height={16} src="/GitHub-Mark-Light-32px.png" /></a>
                    </header>
                    <div className="dosbox-box">
                        <Dosbox ref={dosref} zip="/capflag5.zip" exe="capflag.exe"/>
                    </div>
                </div>
            </main>
            <footer>
                <button type="button" onClick={onClickNew}>New Game</button>{" "}
                <a href="https://www.reddit.com/r/retrobattlestations/comments/cycj3t/733mhz_piii_compaq_presario_5000/" target="_blank">image source</a>{" "}
                <a href="http://www.carrsoft.com/ctf/capture_the_flag_game.html" target="_blank">game source</a>
            </footer>
        </>
    )
}
