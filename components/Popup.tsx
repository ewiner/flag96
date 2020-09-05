import {useEffect, useRef, useState} from "react";

export enum PopupType {
    NewGame,
    Saved
}

type Props = {
    popkey: number,
    type: PopupType
}

export default function Popup(props: Props) {
    const {popkey, type} = props
    const lastPopkey = useRef(null);
    const [popped, setPopped] = useState(false);

    useEffect(() => {
        if (popkey != lastPopkey.current) {
            lastPopkey.current = popkey
            setPopped(true)
            setTimeout(() => setPopped(false), 16)
        }
    }, [popkey])

    const popupContents = () => {
        switch (type) {
            case PopupType.Saved:
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
            case PopupType.NewGame:
                return <span>After your turn, send this URL to your opponent!</span>
            default:
                return null;
        }
    }

    const popupDuration = () => {
        switch (type) {
            case PopupType.Saved:
                return 30;
            case PopupType.NewGame:
                return 3;
            default:
                return 3;
        }
    }

    return (
        <div className={`popup ${popped ? "popped" : "unpopped"}`}>
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
            <div className="speech-bubble">
                {popupContents()}
            </div>
        </div>
    )
}
