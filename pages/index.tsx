import Head from 'next/head'
import styles from '../styles/Home.module.css'
import Dosbox, {DosboxRef} from "../components/dosbox";
import {useRef} from "react";

export default function Home() {
    const dosref = useRef<DosboxRef>(null);

    function onClickNew() {
        // P (hits Print to close the menu if open, nop if menu is not open)
        // Alt
        // F (file menu) (already open at game launch)
        // N (new game)
        // U (human vs human)
        // O (OK)
        // M (play over modem)
        // O (OK)
        dosref.current.sendStrokes([':p', 'alt', ':fnuomo']);
    }

    return (
        <div className={styles.container}>
            <Head>
                <title>Flag96</title>
            </Head>

            <main className={styles.main}>
                Sup!
                <Dosbox ref={dosref} zip="/capflag5.zip" exe="capflag.exe"/>
            </main>

            <button type="button" onClick={onClickNew}>New Game</button>

            <footer className={styles.footer}>
            </footer>
        </div>
    )
}
