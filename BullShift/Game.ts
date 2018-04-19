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

    enum FadeDirection {
        IN,
        OUT
    }

    export class Game implements IMessageHandler {

        private _application: PIXI.Application;
        private _gameScreens: { [key: string]: GameScreen } = {};
        private _activeGameScreen: GameScreen = undefined;
        private _activeLevel: Level;
        private _state = GameState.LEVEL_PRELOADING;
        private _uiLoaded: boolean = false;
        private _levels: Level[] = [];
        private _unloadLevel: boolean = false;
        private _loadLevelName: string;

        private _worldRoot: PIXI.Container;
        private _uiRoot: PIXI.Container;
        private _overlayRoot: PIXI.Container;
        private _fadeContainer: PIXI.Container;
        private _isFading: boolean = false;
        private _fadeDirection: FadeDirection = FadeDirection.IN;
        private _fadeModAmount = 0.01;
        private _levelCleared: boolean = false;
        private _levelIndex: number = 0;

        public static readonly TILE_SIZE: number = 32;

        public constructor() {
            //Message.subscribe( "CHANGE_LEVEL", this );
            Message.subscribe( "LEVEL_CLEARED", this );
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

                this.setActiveLevel( this._levelIndex );
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

            if ( this._isFading ) {
                if ( this._fadeDirection === FadeDirection.IN ) {
                    this._fadeContainer.alpha += this._fadeModAmount;
                    if ( this._fadeContainer.alpha >= 1 ) {
                        this._fadeContainer.alpha = 1;
                        this._isFading = false;
                    }
                } else {
                    this._fadeContainer.alpha -= this._fadeModAmount;
                    if ( this._fadeContainer.alpha <= 0 ) {
                        this._fadeContainer.alpha = 0;
                        this._isFading = false;

                        // If this is set, its because the fade was triggered by a level change.
                        if ( this._levelCleared === true ) {
                            this._unloadLevel = true;
                            this._levelCleared = false;

                            // Get next level 
                            this._levelIndex++;
                            if ( this._levelIndex >= this._levels.length ) {

                                // TODO: start over for now.
                                this._levelIndex = 0;
                            }

                            // Trigger unload.
                            this._unloadLevel = true;
                        }
                    }
                }
            }
        }

        public start(): void {

            console.info( "start" );

            // TODO: fit to screen with given aspect ratio.
            this._application = new PIXI.Application( 640, 480, { backgroundColor: 0x000000 } );
            document.getElementById( 'content' ).appendChild( this._application.view );

            BullShift.AssetManager.initialize( this._application );

            this._worldRoot = new PIXI.Container();
            this._uiRoot = new PIXI.Container();
            this._overlayRoot = new PIXI.Container();
            this._application.stage.addChild( this._worldRoot );
            this._application.stage.addChild( this._uiRoot );

            this._fadeContainer = new PIXI.Container();
            var graphics = new PIXI.Graphics();
            graphics.beginFill( 0x00000000 );
            graphics.drawRect( 0, 0, 640, 480 );
            graphics.endFill();
            this._fadeContainer.alpha = 0;
            this._fadeContainer.addChild( graphics );
            this._overlayRoot.addChild( this._fadeContainer );

            this._application.stage.addChild( this._overlayRoot );

            this._levels.push( new Level( this._worldRoot, "01:01", "assets/levels/01_01.json" ) );
            this._levels.push( new Level( this._worldRoot, "01:02", "assets/levels/01_02.json" ) );

            this.setActiveLevel( this._levelIndex );

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
                case "LEVEL_CLEARED":
                    this._isFading = true;
                    this._fadeDirection = FadeDirection.OUT;
                    this._levelCleared = true;
                    break;
                //case "CHANGE_LEVEL":
                //    this._unloadLevel = true;
                //    this._loadLevelName = message.context as string;
                //    break;
                case "FADE_OUT":
                    this._isFading = true;
                    this._fadeDirection = FadeDirection.OUT;
                    break;
                case "FADE_IN":
                    this._isFading = true;
                    this._fadeDirection = FadeDirection.IN;
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

        private setActiveLevel( levelIndex: number ): void {
            if ( this._activeLevel ) {
                this._activeLevel.deactivate();
                this._activeLevel.unload();
                this._activeLevel.destroy();
            }

            this._activeLevel = this._levels[levelIndex];
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