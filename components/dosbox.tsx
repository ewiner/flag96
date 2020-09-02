import React, {useEffect, useImperativeHandle, useRef, useState} from "react";
import type {DosFactory, DosRuntime} from 'js-dos';
import {DosCommandInterface} from "js-dos/dist/typescript/js-dos-ci";

export type DosboxRef = {
    sendStrokes: (strokes: string[]) => Promise<void>
}

type DosboxProps = {
    variant?: string,
    zip: string,
    exe: string
}

const sleep = millis => new Promise(cb => setTimeout(cb, millis))

const toKeyCodes = (strokes: string[]) => {
    return strokes.flatMap(command => {
        const [first, ...rest] = command
        if (first === ":") {
            const keyCodes: number[] = rest.map((char: string) => {
                const alphanumCode = char.toUpperCase().charCodeAt(0);
                if (alphanumCode >= 48 && alphanumCode <= 57) return alphanumCode;
                if (alphanumCode >= 65 && alphanumCode <= 90) return alphanumCode;
                throw new Error(`Got non-alphanumeric char ${char} in command string ${command}.`)
            });
            return keyCodes
        }
        const manualMap = {
            "left": 37,
            "up": 38,
            "right": 39,
            "down": 40,
            "alt": 18
        };
        const manualCode: number = manualMap[command.toLowerCase()]
        if (manualCode) return [manualCode];
        throw new Error(`Can't convert ${command} into keycode.`)
    })
}

const Dosbox = React.forwardRef<DosboxRef, DosboxProps>((props, ref) => {
    const {variant = "wdosbox"} = props;

    const dos = useRef<DosFactory>(null);
    const runtime = useRef<DosRuntime>(null);
    const dosapp = useRef<DosCommandInterface>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const [isError, setError] = useState(false)

    const setup = async function (canvas: HTMLCanvasElement) {
        await import('js-dos'); // attaches `window.Dos`
        const Dos = (window as any).Dos as DosFactory;
        dos.current = Dos;
        runtime.current = await Dos(canvas, {
            wdosboxUrl: `/dosbox/${variant}.js`,
            autolock: true,
        });
        await runtime.current.fs.extract(props.zip, "/game");
        await runtime.current.fs.chdir("/game");
        dosapp.current = await runtime.current.main(["-c", "cd game", "-c", props.exe]);
    };

    const sendStrokes = async function (strokes: string[]) {
        const keycodes = toKeyCodes(strokes)
        for (const keycode of keycodes) {
            console.debug(`Sending ${keycode} down...`)
            dosapp.current.simulateKeyEvent(keycode, true);
            await sleep(100)
            console.debug(`Sending ${keycode} up...`)
            dosapp.current.simulateKeyEvent(keycode, false);
            await sleep(100)
        }
    }

    useImperativeHandle(ref, () => ({
        sendStrokes
    }))

    useEffect(() => {
        setup(canvasRef.current).catch(() => setError(true));

        return () => {
            if (dosapp.current) {
                const canvasCtx = canvasRef.current.getContext("2d");
                console.log(canvasCtx.getImageData(canvasRef.current.width, canvasRef.current.height, -1, -1).data);
                dosapp.current.exit();
            }
        }
    }, [canvasRef]);

    return isError ? <span>Error!</span> : (
        // The dosbox-container keeps dosbox.js from messing up the DOM in a way that breaks React unloading the component.
        <div className="dosbox-container">
            <canvas ref={canvasRef}/>
        </div>
    );
});

export default Dosbox;
