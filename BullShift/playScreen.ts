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

        private _totalTime: number = 0;
        private _timerEnabled: boolean = false;
        private _msSinceLastRecalc: number = 0;

        public constructor( container: PIXI.Container ) {
            super( container, "PlayScreen" );
        }

        public initialize(): void {

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
                this.soundEnabledPressed.bind( this ), 10, Game.screenHeight - 27 );

            this._soundDisabledCtrl = this.addButton( "soundDisabledCtrl", 'assets/sound_disabled.png',
                this.soundDisabledPressed.bind( this ), 10, Game.screenHeight - 27 );
            this._soundDisabledCtrl.visible = false;


            // Summary screen.
            this._summary = this.addButton( "summaryCtrl", 'assets/levelCleared.png',
                this.summaryPressed.bind( this ),
                ( Game.screenWidth ) / 2 - 200,
                ( Game.screenHeight / 2 ) - 145 );
            this._summary.visible = false;

            this._summaryText = this.addTextControl( "timeSummaryTextCtrl", this._summary.x + 180, this._summary.y + 150, "00:00" );
            this._summaryText.visible = false;

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
            Message.createAndSend( "Player:moveLeft", this );
        }

        private rightPressed(): void {
            Message.createAndSend( "Player:moveRight", this );
        }

        private upPressed(): void {
            Message.createAndSend( "Player:moveUp", this );
        }

        private downPressed(): void {
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

        private addBottomBar(): GameObject {
            let obj = new GameObject( name );
            let cmp = new SpriteComponent( SpriteComponentConfig.create( "playScreen_bottomBar", "assets/uibar.png" ) );
            obj.addComponent( cmp );
            obj.x = 0;
            obj.y = Game.screenHeight - 40;
            this._scene.addObject( obj );
            return obj;
        }
    }
}