/// <reference path="game.ts" />

module BullShift {

    export class PlayScreen extends GameScreen {

        private _upCtrl: GameObject;
        private _downCtrl: GameObject;
        private _leftCtrl: GameObject;
        private _rightCtrl: GameObject;

        // TODO: Remove this temp test code.
        private _world: number = 1;
        private _level: number = 1;
        private _maxLevel: number = 2;

        public constructor( container: PIXI.Container ) {
            super( container, "PlayScreen" );
        }

        public initialize(): void {
            this._upCtrl = this.addButton( "upCtrl", 'assets/ctrl_up.png',
                this.upPressed.bind( this ),
                Game.TILE_SIZE * 2,
                Game.screenHeight - ( Game.TILE_SIZE * 4 ) );

            this._downCtrl = this.addButton( "downCtrl", 'assets/ctrl_down.png',
                this.downPressed.bind( this ),
                Game.TILE_SIZE * 2,
                Game.screenHeight - ( Game.TILE_SIZE * 2 ) );

            this._leftCtrl = this.addButton( "leftCtrl", 'assets/ctrl_left.png',
                this.leftPressed.bind( this ),
                Game.TILE_SIZE * 1,
                Game.screenHeight - ( Game.TILE_SIZE * 3 ) );

            this._rightCtrl = this.addButton( "rightCtrl", 'assets/ctrl_right.png',
                this.rightPressed.bind( this ),
                Game.TILE_SIZE * 3,
                Game.screenHeight - ( Game.TILE_SIZE * 3 ) );

            // NOTE: temporary level switch button.
            this.addButton( "tempCtrl", 'assets/movable.png', this.tempLoadNext.bind( this ), 10, 10 );

            super.initialize();
        }

        private leftPressed(): void {
            Message.createAndSend( "Player:moveLeft", this );
        }

        private rightPressed() {
            Message.createAndSend( "Player:moveRight", this );
        }

        private upPressed() {
            Message.createAndSend( "Player:moveUp", this );
        }

        private downPressed() {
            Message.createAndSend( "Player:moveDown", this );
        }

        private tempLoadNext(): void {
            this._level++;
            if ( this._level > this._maxLevel ) {
                this._level = 1;
            }

            this.loadLevel( this._world, this._level );
        }

        private loadLevel( world: number, level: number ) {
            let worldStr = StringUtils.getPaddedNumberString( world, 2 );
            let levelStr = StringUtils.getPaddedNumberString( level, 2 );
            let levelName = worldStr + ":" + levelStr;
            console.log( "Loading level '" + levelName + "'." );
            Message.createAndSend( "CHANGE_LEVEL", null, levelName );
        }
    }
}