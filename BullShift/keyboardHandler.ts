module BullShift {

    export enum KeyCode {
        CANCEL = 3,
        HELP = 6,
        BACK_SPACE = 8,
        TAB = 9,
        CLEAR = 12,
        RETURN = 13,
        ENTER = 14,
        SHIFT = 16,
        CONTROL = 17,
        ALT = 18,
        PAUSE = 19,
        CAPS_LOCK = 20,
        KANA = 21,
        HANGUL = 21,
        JUNJA = 23,
        FINAL = 24,
        HANJA = 25,
        KANJI = 25,
        ESCAPE = 27,
        CONVERT = 28,
        NONCONVERT = 29,
        ACCEPT = 30,
        MODECHANGE = 31,
        SPACE = 32,
        PAGE_UP = 33,
        PAGE_DOWN = 34,
        END = 35,
        HOME = 36,
        LEFT = 37,
        UP = 38,
        RIGHT = 39,
        DOWN = 40,
        SELECT = 41,
        PRINT = 42,
        EXECUTE = 43,
        PRINTSCREEN = 44,
        INSERT = 45,
        DELETE = 46,
        OEM_0 = 48,
        OEM_1 = 49,
        OEM_2 = 50,
        OEM_3 = 51,
        OEM_4 = 52,
        OEM_5 = 53,
        OEM_6 = 54,
        OEM_7 = 55,
        OEM_8 = 56,
        OEM_9 = 57,
        SEMICOLON = 59,
        EQUALS = 61,
        A = 65,
        B = 66,
        C = 67,
        D = 68,
        E = 69,
        F = 70,
        G = 71,
        H = 72,
        I = 73,
        J = 74,
        K = 75,
        L = 76,
        M = 77,
        N = 78,
        O = 79,
        P = 80,
        Q = 81,
        R = 82,
        S = 83,
        T = 84,
        U = 85,
        V = 86,
        W = 87,
        X = 88,
        Y = 89,
        Z = 90,
        CONTEXT_MENU = 93,
        SLEEP = 95,
        NUMPAD0 = 96,
        NUMPAD1 = 97,
        NUMPAD2 = 98,
        NUMPAD3 = 99,
        NUMPAD4 = 100,
        NUMPAD5 = 101,
        NUMPAD6 = 102,
        NUMPAD7 = 103,
        NUMPAD8 = 104,
        NUMPAD9 = 105,
        MULTIPLY = 106,
        ADD = 107,
        SEPARATOR = 108,
        SUBTRACT = 109,
        DECIMAL = 110,
        DIVIDE = 111,
        F1 = 112,
        F2 = 113,
        F3 = 114,
        F4 = 115,
        F5 = 116,
        F6 = 117,
        F7 = 118,
        F8 = 119,
        F9 = 120,
        F10 = 121,
        F11 = 122,
        F12 = 123,
        F13 = 124,
        F14 = 125,
        F15 = 126,
        F16 = 127,
        F17 = 128,
        F18 = 129,
        F19 = 130,
        F20 = 131,
        F21 = 132,
        F22 = 133,
        F23 = 134,
        F24 = 135,
        NUM_LOCK = 144,
        SCROLL_LOCK = 145,
        COMMA = 188,
        PERIOD = 190,
        SLASH = 191
    };

    export class Key {
        public code: number;
        public keyCode: KeyCode;
        public keyStr: string;
        public isDown: boolean = false;
        public isUp: boolean = true;

        public constructor( code: number ) {
            this.code = code;
            this.keyCode = this.code as KeyCode;
            this.keyStr = KeyCode[this.code].toString();
        }
    }

    export class KeyboardHandler {

        private static _inst: KeyboardHandler;

        private constructor() {
        }

        public static initialize(): void {
            if ( KeyboardHandler._inst === undefined ) {
                KeyboardHandler._inst = new KeyboardHandler();
                KeyboardHandler._inst.bindKeys();
            }
        }

        public static getKeyName( keyCode: KeyCode ): string {
            return KeyCode[keyCode].toString();
        }

        private bindKeys(): void {
            window.addEventListener( "keydown", this.onKeyDown.bind( this ), false );
            window.addEventListener( "keyup", this.onKeyUp.bind( this ), false );
        }

        private onKeyDown( evt: KeyboardEvent ): void {
            let key: Key = new Key( evt.keyCode );
            key.isDown = true;
            key.isUp = false;
            Message.createAndSend( "Key:" + key.keyStr, this, key );
        }

        private onKeyUp( evt: KeyboardEvent ): void {
            let key: Key = new Key( evt.keyCode );
            key.isDown = false;
            key.isUp = true;
            Message.createAndSend( "Key:" + key.keyStr, this, key );
        }
    }
}