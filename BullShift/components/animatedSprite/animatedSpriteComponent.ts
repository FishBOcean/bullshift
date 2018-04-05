/// <reference path="../sprite/spritecomponent.ts" />

module BullShift {

    /**
     * The configuration class used for animated sprites.
     */
    export class AnimatedSpriteConfig extends SpriteComponentConfig {

        /**
         * Indicates if the animation should start automatically. Default: true
         */
        public autoStartAnimation: boolean = true;

        /**
         * The size of each frame on the x-dimension in pixels.
         */
        public frameSizeX: number;

        /**
         * The size of each frame on the y-dimension in pixels.
         */
        public frameSizeY: number;

        /**
         * The total number of frames in the animation.
         */
        public totalFrames: number;

        /**
         * Populates this configuration object from the provided JSON object.
         * @param jsonConfiguration The JSON configuration object.
         */
        public populateFromJson( jsonConfiguration: any ): void {
            super.populateFromJson( jsonConfiguration );

            if ( !jsonConfiguration.frameSizeX ) {
                throw new Error( "SpriteComponentConfig json must contain a frame size for the x dimension (frameSizeX)!" );
            }
            this.frameSizeX = jsonConfiguration.frameSizeX;

            if ( !jsonConfiguration.frameSizeY ) {
                throw new Error( "SpriteComponentConfig json must contain a frame size for the y dimension (frameSizeY)!" );
            }
            this.frameSizeY = jsonConfiguration.frameSizeY;

            if ( !jsonConfiguration.totalFrames ) {
                throw new Error( "SpriteComponentConfig json must contain the total number of frames (totalFrames)!" );
            }
            this.totalFrames = jsonConfiguration.totalFrames;

            if ( jsonConfiguration.autoStartAnimation !== undefined ) {
                this.autoStartAnimation = jsonConfiguration.autoStartAnimation;
            }
        }
    }

    export class AnimatedSpriteComponent extends SpriteComponent {

        private _baseTexture: PIXI.BaseTexture;
        private _frames: PIXI.Texture[] = [];

        public constructor( config: AnimatedSpriteConfig ) {
            super( config );
        }

        public load(): void {
            this._sprite = new PIXI.Sprite();
            this._baseTexture = PIXI.BaseTexture.fromImage( this._assetPath );
            let cfg = this._config as AnimatedSpriteConfig;

            let totalFrames = ( this._config as AnimatedSpriteConfig ).totalFrames;
            for ( let i = 0; i < totalFrames; ++i ) {
                this._frames.push(
                    // TODO: Offset each rectangle
                    new PIXI.Texture( this._baseTexture, new PIXI.Rectangle( 0, 0, cfg.frameSizeX, cfg.frameSizeY ) )
                );
            }

            // Default to the first frame.
            this._sprite.texture = this._frames[0];
        }

        public update( dt: number ): void {

            // TODO:Accumulate time, then flip to next frame when framerate expires.
        }

        public clone(): AnimatedSpriteComponent {
            return new AnimatedSpriteComponent( this._config as AnimatedSpriteConfig );
        }

        public onMessage( message: Message ): void {
            if ( !this.gameObject ) {
                console.warn( "Trying to process a message on a MoveComponent which has no attached game object." );
                return;
            }

            //let matches = this._subscribedMessages.filter( x => x.name == message.name );
            //if ( matches.length > 0 ) {
            //    let msgCfg = matches[0];
            //    switch ( msgCfg.axis ) {
            //        case "x":
            //            this.gameObject.x += msgCfg.amount;
            //            break;
            //        case "y":
            //            this.gameObject.y += msgCfg.amount;
            //            break;
            //    }
            //}
        }
    }
}