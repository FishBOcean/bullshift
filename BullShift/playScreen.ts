/// <reference path="game.ts" />

module BullShift {

    export class PlayScreen extends GameScreen implements IMessageHandler {

        private _upCtrl: GameObject;
        private _downCtrl: GameObject;
        private _leftCtrl: GameObject;
        private _rightCtrl: GameObject;

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

            this.addTextControl( "movesTextCtrl", 400, Game.screenHeight - 20, "Moves:0" );

            Message.subscribe( "PLAYER_MOVED", this );
            Message.subscribe( "PlayScreen:Reset", this );

            super.initialize();
        }

        public onMessage( message: Message ): void {
            if ( message.name === "PLAYER_MOVED" ) {
                Message.createAndSend( "SetText:movesTextCtrl", this, "Moves:" + message.context as string );
            }
            if ( message.name === "PlayScreen:Reset" ) {
                Message.createAndSend( "SetText:movesTextCtrl", this, "Moves:0" );
            }
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