/// <reference path="game.ts" />

module BullShift {

    export class PlayScreen extends GameScreen implements IMessageHandler {

        private _upCtrl: GameObject;
        private _downCtrl: GameObject;
        private _leftCtrl: GameObject;
        private _rightCtrl: GameObject;

        private _summary: GameObject;
        private _summaryText: GameObject;
        private _soundEnabledCtrl: GameObject;
        private _soundDisabledCtrl: GameObject;
        private _musicEnabledCtrl: GameObject;
        private _musicDisabledCtrl: GameObject;
        private _menuButtonCtrl: GameObject;
        private _menuCtrl: GameObject;
        private _levelButtons: GameObject[] = [];
        private _restartButton: GameObject;
        private _toMainMenuButton: GameObject;

        private _overlayComponent: SpriteComponent;

        private _totalTime: number = 0;
        private _timerEnabled: boolean = false;
        private _msSinceLastRecalc: number = 0;

        public constructor( container: PIXI.Container ) {
            super( container, "PlayScreen" );
        }

        public initialize(): void {

            this.addScreenDarkener();
            this.addBottomBar();

            this._upCtrl = this.addButton( "upCtrl", 'assets/ctrl_up.png',
                this.upPressed.bind( this ),
                Game.TILE_SIZE * 2,
                Game.screenHeight - ( Game.TILE_SIZE * 5 ) );

            this._downCtrl = this.addButton( "downCtrl", 'assets/ctrl_down.png',
                this.downPressed.bind( this ),
                Game.TILE_SIZE * 2,
                Game.screenHeight - ( Game.TILE_SIZE * 3 ) );

            this._leftCtrl = this.addButton( "leftCtrl", 'assets/ctrl_left.png',
                this.leftPressed.bind( this ),
                Game.TILE_SIZE * 1,
                Game.screenHeight - ( Game.TILE_SIZE * 4 ) );

            this._rightCtrl = this.addButton( "rightCtrl", 'assets/ctrl_right.png',
                this.rightPressed.bind( this ),
                Game.TILE_SIZE * 3,
                Game.screenHeight - ( Game.TILE_SIZE * 4 ) );

            this.addTextControl( "levelTextCtrl", 160, Game.screenHeight - 27, "1" );
            this.addTextControl( "movesTextCtrl", 315, Game.screenHeight - 27, "0" );
            this.addTextControl( "timeTextCtrl", 440, Game.screenHeight - 27, "00:00" );

            // Music
            this._musicEnabledCtrl = this.addButton( "musicEnabledCtrl", 'assets/music_enabled.png',
                this.musicEnabledPressed.bind( this ), 610, Game.screenHeight - 27 );

            this._musicDisabledCtrl = this.addButton( "musicDisabledCtrl", 'assets/music_disabled.png',
                this.musicDisabledPressed.bind( this ), 610, Game.screenHeight - 27 );
            this._musicDisabledCtrl.visible = false;

            // Sound
            this._soundEnabledCtrl = this.addButton( "soundEnabledCtrl", 'assets/sound_enabled.png',
                this.soundEnabledPressed.bind( this ), 580, Game.screenHeight - 27 );

            this._soundDisabledCtrl = this.addButton( "soundDisabledCtrl", 'assets/sound_disabled.png',
                this.soundDisabledPressed.bind( this ), 580, Game.screenHeight - 27 );
            this._soundDisabledCtrl.visible = false;

            // Menu
            this._menuButtonCtrl = this.addButton( "menuButtonCtrl", 'assets/gear.png',
                this.menuButtonPressed.bind( this ), 20, Game.screenHeight - 27 );


            // Summary screen.
            this._summary = this.addButton( "summaryCtrl", 'assets/levelCleared.png',
                this.summaryPressed.bind( this ),
                ( Game.screenWidth ) / 2 - 200,
                ( Game.screenHeight / 2 ) - 145 );
            this._summary.visible = false;

            this._summaryText = this.addTextControl( "timeSummaryTextCtrl", this._summary.x + 180, this._summary.y + 150, "00:00" );
            this._summaryText.visible = false;

            this._menuCtrl = this.addMenu();
            this._menuCtrl.visible = false;

            Message.subscribe( "PLAYER_MOVED", this );
            Message.subscribe( "LEVEL_READY", this );
            Message.subscribe( "PlayScreen:Reset", this );
            Message.subscribe( "LEVEL_CLEARED", this );

            super.initialize();
        }

        public onMessage( message: Message ): void {
            if ( message.name === "PLAYER_MOVED" ) {
                Message.createAndSend( "SetText:movesTextCtrl", this, message.context as string );
            } else if ( message.name === "PlayScreen:Reset" ) {
                Message.createAndSend( "SetText:movesTextCtrl", this, "0" );
                Message.createAndSend( "SetText:timeTextCtrl", this, "00:00" );
                this._totalTime = 0;
            } else if ( message.name === "LEVEL_READY" ) {
                this._timerEnabled = true;
                Message.createAndSend( "SetText:levelTextCtrl", this, message.context as string );
                Message.createAndSend( "SetText:timeSummaryTextCtrl", this, "00:00" );
                this._summary.visible = false;
                this._summaryText.visible = false;

                // HACK: This guarantees the component is loaded, so apply blend mode here.
                this._overlayComponent.enableMultiplyBlendMode();
            } else if ( message.name === "LEVEL_CLEARED" ) {
                this._timerEnabled = false;
                this._summary.visible = true;

                let minutes = BSMath.intDivide( this._totalTime / 1000, 60 );
                let seconds = ( this._totalTime / 1000 ) % 60;

                let timeStr = StringUtils.getPaddedNumberString( Math.floor( minutes ), 2 ) + ":" + StringUtils.getPaddedNumberString( Math.floor( seconds ), 2 );
                Message.createAndSend( "SetText:timeSummaryTextCtrl", this, timeStr );

                this._summaryText.visible = true;
            }
        }

        public update( dt: number ): void {
            super.update( dt );

            if ( this._timerEnabled === true ) {
                this._totalTime += dt;
                this._msSinceLastRecalc += dt;
                if ( this._msSinceLastRecalc > 1000 ) {
                    this._msSinceLastRecalc -= 1000;

                    let minutes = BSMath.intDivide( this._totalTime / 1000, 60 );
                    let seconds = ( this._totalTime / 1000 ) % 60;

                    let timeStr = StringUtils.getPaddedNumberString( Math.floor( minutes ), 2 ) + ":" + StringUtils.getPaddedNumberString( Math.floor( seconds ), 2 );
                    Message.createAndSend( "SetText:timeTextCtrl", this, timeStr );
                }
            }
        }

        private leftPressed(): void {
            if ( this._summary.visible || this._menuCtrl.visible ) {
                return;
            }
            Message.createAndSend( "Player:moveLeft", this );
        }

        private rightPressed(): void {
            if ( this._summary.visible || this._menuCtrl.visible ) {
                return;
            }
            Message.createAndSend( "Player:moveRight", this );
        }

        private upPressed(): void {
            if ( this._summary.visible || this._menuCtrl.visible ) {
                return;
            }
            Message.createAndSend( "Player:moveUp", this );
        }

        private downPressed(): void {
            if ( this._summary.visible || this._menuCtrl.visible ) {
                return;
            }
            Message.createAndSend( "Player:moveDown", this );
        }

        private summaryPressed(): void {
            Message.createAndSend( "SUMMARY_CONTINUE", this );
        }

        private musicEnabledPressed(): void {
            Message.createAndSend( "MUSIC_DISABLE", this );
            this._musicDisabledCtrl.visible = true;
            this._musicEnabledCtrl.visible = false;
        }

        private musicDisabledPressed(): void {
            Message.createAndSend( "MUSIC_ENABLE", this );
            this._musicDisabledCtrl.visible = false;
            this._musicEnabledCtrl.visible = true;
        }

        private soundEnabledPressed(): void {
            Message.createAndSend( "SOUND_DISABLE", this );
            this._soundDisabledCtrl.visible = true;
            this._soundEnabledCtrl.visible = false;
        }

        private soundDisabledPressed(): void {
            Message.createAndSend( "SOUND_ENABLE", this );
            this._soundDisabledCtrl.visible = false;
            this._soundEnabledCtrl.visible = true;
        }

        private menuButtonPressed(): void {
            if ( this._summary.visible ) {
                return;
            }

            this._menuCtrl.visible = !this._menuCtrl.visible;
            this._restartButton.visible = this._menuCtrl.visible;
            this._toMainMenuButton.visible = this._menuCtrl.visible;
            for ( let b in this._levelButtons ) {
                this._levelButtons[b].visible = this._menuCtrl.visible;
            }

            if ( this._menuCtrl.visible ) {
                this._timerEnabled = false;
            } else {
                this._timerEnabled = true;
            }
        }

        // This is reallly ugly. For the sake of time, just create one per button.

        // World 1
        private menuClicked11(): void {
            Message.createAndSend( "CHANGE_LEVEL", this, 0 );
            this.menuButtonPressed();
        }

        private menuClicked12(): void {
            Message.createAndSend( "CHANGE_LEVEL", this, 1 );
            this.menuButtonPressed();
        }

        private menuClicked13(): void {
            Message.createAndSend( "CHANGE_LEVEL", this, 2 );
            this.menuButtonPressed();
        }

        private menuClicked14(): void {
            Message.createAndSend( "CHANGE_LEVEL", this, 3 );
            this.menuButtonPressed();
        }

        private menuClicked15(): void {
            Message.createAndSend( "CHANGE_LEVEL", this, 4 );
            this.menuButtonPressed();
        }

        // World 2
        private menuClicked21(): void {
            Message.createAndSend( "CHANGE_LEVEL", this, 5 );
            this.menuButtonPressed();
        }

        private menuClicked22(): void {
            Message.createAndSend( "CHANGE_LEVEL", this, 6 );
            this.menuButtonPressed();
        }

        private menuClicked23(): void {
            Message.createAndSend( "CHANGE_LEVEL", this, 7 );
            this.menuButtonPressed();
        }

        private menuClicked24(): void {
            Message.createAndSend( "CHANGE_LEVEL", this, 8 );
            this.menuButtonPressed();
        }

        private menuClicked25(): void {
            Message.createAndSend( "CHANGE_LEVEL", this, 9 );
            this.menuButtonPressed();
        }

        // World 3
        private menuClicked31(): void {
            Message.createAndSend( "CHANGE_LEVEL", this, 10 );
            this.menuButtonPressed();
        }

        private menuClicked32(): void {
            Message.createAndSend( "CHANGE_LEVEL", this, 11 );
            this.menuButtonPressed();
        }

        private menuClicked33(): void {
            Message.createAndSend( "CHANGE_LEVEL", this, 12 );
            this.menuButtonPressed();
        }

        private menuClicked34(): void {
            Message.createAndSend( "CHANGE_LEVEL", this, 13 );
            this.menuButtonPressed();
        }

        private menuClicked35(): void {
            Message.createAndSend( "CHANGE_LEVEL", this, 14 );
            this.menuButtonPressed();
        }

        private restartLevelClicked(): void {
            Message.createAndSend( "RESTART_LEVEL", this );
            this.menuButtonPressed();
        }

        private mainMenuClicked(): void {
            Message.createAndSend( "GO_MAIN_MENU", this );
            this.menuButtonPressed();
        }


        private addBottomBar(): GameObject {
            let obj = new GameObject( "playScreen_bottomBar_obj" );
            let cmp = new SpriteComponent( SpriteComponentConfig.create( "playScreen_bottomBar", "assets/uibar.png" ) );
            obj.addComponent( cmp );
            obj.x = 0;
            obj.y = Game.screenHeight - 40;
            this._scene.addObject( obj );
            return obj;
        }

        private addScreenDarkener(): GameObject {
            let obj = new GameObject( "playScreen_screenDarkener_obj" );
            let cmp = new SpriteComponent( SpriteComponentConfig.create( "playScreen_screenDarkener", "assets/screen_darkener.png" ) );
            this._overlayComponent = cmp;
            obj.addComponent( cmp );
            obj.x = 0;
            obj.y = 0;
            this._scene.addObject( obj );
            return obj;
        }

        private addMenu(): GameObject {
            let obj = new GameObject( "menu_obj" );
            let cmp = new SpriteComponent( SpriteComponentConfig.create( "menu_bg", "assets/menu_overlay.png" ) );
            obj.addComponent( cmp );
            obj.x = ( Game.screenWidth / 2 ) - 200;
            obj.y = ( Game.screenHeight / 2 ) - 145;
            this._menuCtrl = obj;

            this._scene.addObject( obj );

            this._restartButton = this.addButton( "restartLevelBtn_obj", "assets/restart_level.png", this.restartLevelClicked.bind( this ), obj.x + 60, obj.y + 70 );
            this._restartButton.visible = false;

            this._toMainMenuButton = this.addButton( "mainMenuBtn_obj", "assets/main_menu_button.png", this.mainMenuClicked.bind( this ), obj.x + 220, obj.y + 70 );
            this._toMainMenuButton.visible = false;

            // Add buttons - NOTE: parenting doesn't seem to load correctly, so going to have to do it the hard way.
            for ( let i = 0; i < 15; ++i ) {
                let world = BSMath.intDivide( i, 5 ) + 1;
                let level = ( i % 5 ) + 1;
                let fn = `menuClicked${world}${level}`.toString();
                console.info( fn );
                let btn = this.createButton( `button${world}-${level}`, `assets/${world}-${level}.png`, this[fn].bind( this ), obj.x + 5 + ( 55 * level ), obj.y + 90 + ( 42 * world ) );
                btn.visible = false;
                this._levelButtons.push( btn );
                this._scene.addObject( btn );
            }

            return obj;
        }
    }
}