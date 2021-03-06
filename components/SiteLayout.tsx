import Head from 'next/head'
import {useEffect, useState} from "react";
import {get as idbGet, set as idbSet} from 'idb-keyval'

export default function SiteLayout(props) {
    const {children} = props
    const [whatOpen, setWhatOpen] = useState(false)

    useEffect(() => {
        (async () => {
            const visited = await idbGet("visited") as boolean
            if (!visited) {
                setWhatOpen(true)
                await idbSet("visited", true)
            }
        })().catch(console.error)
    }, [])

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
                    user-select: none;
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
                }

                .what .popup {
                    position: absolute;
                    left: 587px;
                    top: 91px;
                    z-index: 101;
                    width: 413px;
                    user-select: text;
                    transition: opacity 150ms ease;
                }

                .popup-close {
                    text-align: right;
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
                    box-shadow: -10px 10px black;
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
                    min-width: 1025px;
                    min-height: 800px;
                }

                .content-box {
                    position: absolute;
                    top: 230px;
                    left: calc(50% - 195px);
                    width: 640px;
                    height: 480px;
                    background-color: black;
                    color: white;
                }
            `}</style>
            {/* language=CSS */}
            <style jsx>{`
                .what .popup {
                    visibility: ${whatOpen ? "visible" : "hidden"};
                    opacity: ${whatOpen ? "1" : "0"};
                    transition: ${whatOpen ? "" : "visibility 0s 150ms, "} opacity 150ms linear;
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
                                <h2>what is this?</h2>
                                <p><b>Capture the Flag</b> is a turn-based strategy computer game from the 1990s, made
                                    by <a href="http://www.carrsoft.com/" target="_blank">Carr Software</a>.</p>
                                <p>This version lets you play the original game online in your browser, either against the
                                    computer or multiplayer over the internet.</p>
                                <div className="popup-close">
                                    <a role="button" href="#" onClick={e => {
                                        e.preventDefault();
                                        setWhatOpen(false);
                                    }}>Close</a>
                                </div>
                            </div></span>
                        </span>
                        {/* TODO: use a font instead of an img, so the underline works */}
                        <a href="https://github.com/ewiner/flag96" className="ghlink" target="_blank"><img
                            alt="Github Link" height={16} src="/GitHub-Mark-Light-32px.png"/></a>
                    </header>
                    <div className="content-box">
                        {children}
                    </div>
                </div>
            </main>
            <footer>
                <a href="https://www.reddit.com/r/retrobattlestations/comments/cycj3t/733mhz_piii_compaq_presario_5000/"
                   target="_blank">image source</a>{" "}
                <a href="http://www.carrsoft.com/ctf/capture_the_flag_game.html" target="_blank">game source</a>
            </footer>
        </>
    )
}
