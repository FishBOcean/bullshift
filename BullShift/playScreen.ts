/// <reference path="game.ts" />

module BullShift {

    export class PlayScreen extends GameScreen {

        private _upCtrl: GameObject;
        private _downCtrl: GameObject;
        private _leftCtrl: GameObject;
        private _rightCtrl: GameObject;


        public constructor( application: PIXI.Application ) {
            super( application, "PlayScreen" );
        }

        public initialize(): void {
            this._upCtrl = this.addButton( "upCtrl", 'assets/ctrl_up.png',
                this.upPressed.bind( this ),
                Game.TILE_SIZE * 2,
                this._application.screen.height - ( Game.TILE_SIZE * 4 ) );

            this._downCtrl = this.addButton( "downCtrl", 'assets/ctrl_down.png',
                this.downPressed.bind( this ),
                Game.TILE_SIZE * 2,
                this._application.screen.height - ( Game.TILE_SIZE * 2 ) );

            this._leftCtrl = this.addButton( "leftCtrl", 'assets/ctrl_left.png',
                this.leftPressed.bind( this ),
                Game.TILE_SIZE * 1,
                this._application.screen.height - ( Game.TILE_SIZE * 3 ) );

            this._rightCtrl = this.addButton( "rightCtrl", 'assets/ctrl_right.png',
                this.rightPressed.bind( this ),
                Game.TILE_SIZE * 3,
                this._application.screen.height - ( Game.TILE_SIZE * 3 ) );

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
    }
}