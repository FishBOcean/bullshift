/// <reference path="lib/pixi.d.ts" />

module BullShift {

    enum GameScreenName {
        PLAY_SCREEN = "playScreen"
    }

    enum GameState {
        LEVEL_PRELOADING,
        LEVEL_LOADING,
        PLAYING,
        PAUSED
    }

    export class Game implements IMessageHandler {
        
        private _application: PIXI.Application;
        private _gameScreens: { [key: string]: GameScreen } = {};
        private _activeGameScreen: GameScreen = undefined;
        private _activeLevel: Level;
        private _state = GameState.LEVEL_PRELOADING;
        private _uiLoaded: boolean = false;
        private _levels: { [name: string]: Level } = {};
        private _unloadLevel: boolean = false;
        private _loadLevelName: string;

        private _worldRoot: PIXI.Container;
        private _uiRoot: PIXI.Container;

        public static readonly TILE_SIZE: number = 32;

        public constructor() {
            Message.subscribe( "CHANGE_LEVEL", this );
        }

        public static get screenWidth(): number {
            return g_game._application.screen.width;
        }

        public static get screenHeight(): number {
            return g_game._application.screen.height;
        }

        public update( dt: number ): void {

            if ( this._unloadLevel ) {
                this._activeLevel.unload();
                this._state = GameState.LEVEL_PRELOADING;

                this.setActiveLevel( this._loadLevelName );
                this._loadLevelName = "";
                this._unloadLevel = false;
                return;
            }

            this.updateState( dt );

            // UI
            if ( !this._uiLoaded ) {
                let interrupted = false;
                for ( let s in this._gameScreens ) {
                    if ( this._gameScreens[s].preloading ) {
                        interrupted = true;
                        break;
                    }
                }
                if ( !interrupted ) {
                    for ( let s in this._gameScreens ) {
                        this._gameScreens[s].load();
                    }
                    this._uiLoaded = true;
                    console.log( "All gameScreens are loaded." );
                }
            }

            

            // TODO: check for signals of a level change.
        }

        public start(): void {

            console.info( "start" );

            // TODO: fit to screen with given aspect ratio.
            this._application = new PIXI.Application( 640, 480, { backgroundColor: 0x000000 } );
            document.getElementById( 'content' ).appendChild( this._application.view );

            BullShift.AssetManager.initialize( this._application );

            this._worldRoot = new PIXI.Container();
            this._uiRoot = new PIXI.Container();
            this._application.stage.addChild( this._worldRoot );
            this._application.stage.addChild( this._uiRoot );

            this._levels["01:01"] = new Level( this._worldRoot, "01:01", "assets/levels/01_01.json" );
            this._levels["01:02"] = new Level( this._worldRoot, "01:02", "assets/levels/01_02.json" );

            this.setActiveLevel( "01:01" );

            this.initializeUI();


            // delta is 1 if running at 100% performance
            // creates frame-independent transformation
            this._application.ticker.add( function ( dt ) {
                this.update( dt / 60 * 1000 ); // scale back by FPS
            }.bind( this ) );
            this._application.ticker.elapsedMS
        }

        public onMessage( message: Message ): void {
            switch ( message.name ) {
                case "CHANGE_LEVEL":
                    this._unloadLevel = true;
                    this._loadLevelName = message.context as string;
                    break;
                default:
                    break;
            }
        }

        public static getActiveLevel(): Level {
            return g_game._activeLevel;
        }

        private updateState( dt: number ): void {
            if ( this._state == GameState.LEVEL_PRELOADING ) {
                if ( !this._activeLevel.configPreloading ) {
                    console.log( "Configuration loaded. Beginning load process..." );
                    this._activeLevel.initialize();
                    this._state = GameState.LEVEL_LOADING;
                } else {
                    console.log( "Waiting on configuration..." );
                }
            } else if ( this._state === GameState.LEVEL_LOADING ) {
                if ( !this._activeLevel.preloading ) {
                    console.log( "Level pre-loading complete. Loading..." );
                    this._activeLevel.load();

                    console.log( "Load complete. Starting gameplay..." );
                    this._state = GameState.PLAYING;
                    Message.createAndSend( "LEVEL_READY", this );
                } else {
                    console.log( "Level loading..." );
                }
            } else if ( this._state === GameState.PLAYING ) {
                //console.log( "playing..." );
                if ( !this._activeLevel.isActive ) {
                    console.log( "Level not active - activating..." );
                    this._activeLevel.activate();
                }
                this._activeLevel.update( dt );
            }
        }

        private setActiveLevel( levelName: string ): void {
            if ( this._activeLevel ) {
                this._activeLevel.deactivate();
                this._activeLevel.unload();
                this._activeLevel.destroy();
            }

            this._activeLevel = this._levels[levelName];
            //this._activeLevel.scene.activate();
        }

        private setActiveGameScreen( name: string ): void {
            if ( this._activeGameScreen ) {
                this._activeGameScreen.deactivate();
            }
            this._activeGameScreen = this._gameScreens[name];
            this._activeGameScreen.activate();
        }

        private initializeUI(): void {

            // Create and load all screens.
            this._gameScreens[GameScreenName.PLAY_SCREEN] = new BullShift.PlayScreen( this._uiRoot );
            this._gameScreens[GameScreenName.PLAY_SCREEN].initialize();



            this.setActiveGameScreen( GameScreenName.PLAY_SCREEN );

        }

    }
}