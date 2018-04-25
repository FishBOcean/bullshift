/// <reference path="game.ts" />

module BullShift {

    export class MainMenuScreen extends GameScreen implements IMessageHandler {

        public constructor( container: PIXI.Container ) {
            super( container, "MainMenu" );
        }

        public initialize(): void {

            this.addBackground();
            this.addButton( "tapToPlayButton", "assets/tap_to_play.png", this.tapToPlayClicked.bind( this ), 290, 315 );

            Message.subscribe( "PLAYER_MOVED", this );
            Message.subscribe( "LEVEL_READY", this );
            Message.subscribe( "PlayScreen:Reset", this );
            Message.subscribe( "LEVEL_CLEARED", this );

            super.initialize();
        }

        public onMessage( message: Message ): void {
        }

        public update( dt: number ): void {
            super.update( dt );
        }

        private tapToPlayClicked(): void {
            Message.createAndSend( "START_GAME", this );
        }

        private addBackground(): GameObject {
            let obj = new GameObject( "mainmenu_bg_obj" );
            let cmp = new SpriteComponent( SpriteComponentConfig.create( "mainmenu_bg", "assets/titlebg.png" ) );
            obj.addComponent( cmp );
            obj.x = 0;
            obj.y = 0;
            this._scene.addObject( obj );
            return obj;
        }
    }
}