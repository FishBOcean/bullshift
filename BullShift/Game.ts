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
        private _playerObj: GameObject;
        private _gameScreens: { [key: string]: GameScreen } = {};
        private _activeGameScreen: GameScreen = undefined;
        private _activeLevel: Level;
        private _state = GameState.LEVEL_PRELOADING;
        private _uiLoaded: boolean = false;

        public static readonly TILE_SIZE: number = 32;

        public constructor() {
        }

        public update( dt: number ): void {
            if ( this._state == GameState.LEVEL_PRELOADING ) {
                if ( !this._activeLevel.configPreloading ) {
                    console.log( "preloading done, loading..." );
                    this._activeLevel.initialize();
                    this._state = GameState.LEVEL_LOADING;
                } else {
                    console.log( "Still preloading. Waiting..." );
                }
            } else if ( this._state === GameState.LEVEL_LOADING ) {
                console.log( "loading..." );
                if ( !this._activeLevel.preloading ) {
                    this._activeLevel.scene.load();
                    this._state = GameState.PLAYING;
                }
            } else if ( this._state === GameState.PLAYING ) {
                console.log( "playing..." );
                if ( !this._activeLevel.scene.isActive ) {
                    console.log( "Level not active - activating..." );
                    this._activeLevel.scene.activate();
                }
            }

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
                }
            }

            console.log( "All gameScreens are loaded." );

            // TODO: check for signals of a level change.
        }

        public start(): void {

            console.info( "start" );

            // TODO: fit to screen with given aspect ratio.
            this._application = new PIXI.Application( 800, 600, { backgroundColor: 0x1099bb } );
            document.getElementById( 'content' ).appendChild( this._application.view );

            this.setActiveLevel( new Level( this._application, "testLevel", "assets/levels/testLevel.json" ) );

            this.initializeUI();
            

            // delta is 1 if running at 100% performance
            // creates frame-independent transformation
            this._application.ticker.add( function ( dt ) {
                this.update( dt );
            }.bind( this ) );
        }

        public onMessage( message: Message ): void {
            switch ( message.name ) {
                default:
                    break;
            }
        }

        private setActiveLevel( level: Level ): void {
            if ( this._activeLevel ) {
                this._activeLevel.scene.deactivate();
                this._activeLevel.unload();
            }

            this._activeLevel = level;
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
            this._gameScreens[GameScreenName.PLAY_SCREEN] = new BullShift.PlayScreen( this._application );
            this._gameScreens[GameScreenName.PLAY_SCREEN].initialize();



            this.setActiveGameScreen( GameScreenName.PLAY_SCREEN );

        }

    }
}