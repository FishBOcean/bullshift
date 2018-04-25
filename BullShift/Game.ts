/// <reference path="lib/pixi.d.ts" />

module BullShift {

    enum GameScreenName {
        PLAY_SCREEN = "playScreen",
        MAIN_MENU = "mainMenu"
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
        private _renderer: PIXI.CanvasRenderer | PIXI.WebGLRenderer;
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
        private _fadeModAmount = 0.05;
        private _levelCleared: boolean = false;
        private _levelIndex: number = 0;
        private _nextLevelIndex: number = 0;
        private _setLevelFlag: boolean = false;
        private _isStartingGame: boolean = false;
        private _isQuittingGame: boolean = false;

        public static readonly TILE_SIZE: number = 32;

        public constructor() {
            Message.subscribe( "CHANGE_LEVEL", this );
            Message.subscribe( "RESTART_LEVEL", this );
            Message.subscribe( "SUMMARY_CONTINUE", this );
            Message.subscribe( "FADE_IN", this );
            Message.subscribe( "FADE_OUT", this );
            Message.subscribe( "START_GAME", this );
            Message.subscribe( "GO_MAIN_MENU", this );
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
            } else {
                this._activeGameScreen.update( dt );
            }

            if ( this._isFading ) {
                if ( this._fadeDirection === FadeDirection.IN ) {
                    this._fadeContainer.alpha -= this._fadeModAmount;
                    if ( this._fadeContainer.alpha <= 0 ) {
                        this._fadeContainer.alpha = 0;
                        this._isFading = false;
                    }
                } else {
                    this._fadeContainer.alpha += this._fadeModAmount;
                    if ( this._fadeContainer.alpha >= 1 ) {
                        this._fadeContainer.alpha = 1;
                        this._isFading = false;

                        // If this is set, its because the fade was triggered by a level change.
                        if ( this._levelCleared === true ) {
                            this._unloadLevel = true;
                            this._levelCleared = false;

                            if ( this._setLevelFlag === true ) {
                                this._levelIndex = this._nextLevelIndex;
                                this._setLevelFlag = false;
                                this._nextLevelIndex = 0;
                            } else {

                                // Get next level 
                                this._levelIndex++;
                                if ( this._levelIndex >= this._levels.length ) {

                                    // TODO: start over for now. May want to show a cinematic or something
                                    // in the future.
                                    this._levelIndex = 0;
                                }
                            }

                            // Trigger unload.
                            this._unloadLevel = true;

                            if ( this._isStartingGame ) {
                                this._isStartingGame = false;
                                this.setActiveGameScreen( GameScreenName.PLAY_SCREEN );
                            }

                            if ( this._isQuittingGame ) {
                                this._isQuittingGame = false;
                                this.setActiveGameScreen( GameScreenName.MAIN_MENU );
                            }

                            // Reset play screen.
                            Message.createAndSend( "PlayScreen:Reset", this );
                        }
                    }
                }
            }
        }

        public start(): void {

            console.info( "start" );

            // TODO: fit to screen with given aspect ratio.
            this._application = new PIXI.Application( 640, 480, {
                backgroundColor: 0x000000,
                roundPixels: true,
                resolution: window.devicePixelRatio || 1
            } );
            document.body.appendChild( this._application.view );

            window.addEventListener( 'resize', this.resizeHandler.bind( this ), false );

            this._renderer = this._application.renderer;
            this._renderer.view.id = "viewport";

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

            this._levels.push( new Level( this._worldRoot, "1-1", "assets/levels/01_01.json" ) );
            this._levels.push( new Level( this._worldRoot, "1-2", "assets/levels/01_02.json" ) );
            this._levels.push( new Level( this._worldRoot, "1-3", "assets/levels/01_03.json" ) );
            this._levels.push( new Level( this._worldRoot, "1-4", "assets/levels/01_04.json" ) );
            this._levels.push( new Level( this._worldRoot, "1-5", "assets/levels/01_05.json" ) );

            this._levels.push( new Level( this._worldRoot, "2-1", "assets/levels/02_01.json" ) );
            this._levels.push( new Level( this._worldRoot, "2-2", "assets/levels/02_02.json" ) );
            this._levels.push( new Level( this._worldRoot, "2-3", "assets/levels/02_03.json" ) );
            this._levels.push( new Level( this._worldRoot, "2-4", "assets/levels/02_04.json" ) );
            this._levels.push( new Level( this._worldRoot, "2-5", "assets/levels/02_05.json" ) );

            this._levels.push( new Level( this._worldRoot, "3-1", "assets/levels/03_01.json" ) );
            this._levels.push( new Level( this._worldRoot, "3-2", "assets/levels/03_02.json" ) );
            this._levels.push( new Level( this._worldRoot, "3-3", "assets/levels/03_03.json" ) );
            this._levels.push( new Level( this._worldRoot, "3-4", "assets/levels/03_04.json" ) );
            this._levels.push( new Level( this._worldRoot, "3-5", "assets/levels/03_05.json" ) );

            this.setActiveLevel( this._levelIndex );

            this.initializeUI();

            // delta is 1 if running at 100% performance
            // creates frame-independent transformation
            this._application.ticker.add( function ( dt ) {
                this.update( dt / 60 * 1000 ); // scale back by FPS
            }.bind( this ) );

            this.resizeHandler();
        }

        public onMessage( message: Message ): void {
            switch ( message.name ) {
                case "START_GAME":
                    this._isFading = true;
                    this._fadeDirection = FadeDirection.OUT;
                    this._levelCleared = true;
                    this._setLevelFlag = true;
                    this._nextLevelIndex = 0;
                    this._isStartingGame = true;
                    break;
                case "GO_MAIN_MENU":
                    this._isFading = true;
                    this._fadeDirection = FadeDirection.OUT;
                    this._levelCleared = true;
                    this._setLevelFlag = true;
                    this._nextLevelIndex = 0;
                    this._isQuittingGame = true;
                    break;
                case "SUMMARY_CONTINUE":
                    this._isFading = true;
                    this._fadeDirection = FadeDirection.OUT;
                    this._levelCleared = true;
                    break;
                case "CHANGE_LEVEL":
                    this._isFading = true;
                    this._fadeDirection = FadeDirection.OUT;
                    this._levelCleared = true;
                    this._setLevelFlag = true;
                    this._nextLevelIndex = message.context as number;
                    break;
                case "RESTART_LEVEL":
                    this._isFading = true;
                    this._fadeDirection = FadeDirection.OUT;
                    this._levelCleared = true;
                    this._setLevelFlag = true;
                    this._nextLevelIndex = this._levelIndex;
                    break;
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

        public resizeHandler(): void {
            const scaleFactor = Math.min( window.innerWidth / 640, window.innerHeight / 480 );
            const newWidth = Math.ceil( 640 * scaleFactor );
            const newHeight = Math.ceil( 480 * scaleFactor );

            this._renderer.view.style.width = `${newWidth}px`;
            this._renderer.view.style.height = `${newHeight}px`;

            this._renderer.resize( newWidth, newHeight );
            this._application.stage.scale.set( scaleFactor );
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

                    if ( !this._activeLevel.isActive ) {
                        console.log( "Level not active - activating..." );
                        this._activeLevel.activate();
                    }
                    Message.createAndSend( "LEVEL_READY", this, this._activeLevel.name );
                    Message.createAndSend( "FADE_IN", this );
                } else {
                    console.log( "Level loading..." );
                }
            } else if ( this._state === GameState.PLAYING ) {
                //console.log( "playing..." );

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

            this._gameScreens[GameScreenName.MAIN_MENU] = new BullShift.MainMenuScreen( this._uiRoot );
            this._gameScreens[GameScreenName.MAIN_MENU].initialize();

            this.setActiveGameScreen( GameScreenName.MAIN_MENU );
        }
    }
}