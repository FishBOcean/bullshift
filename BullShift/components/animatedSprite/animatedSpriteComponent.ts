/// <reference path="../sprite/spritecomponent.ts" />

module BullShift {

    /**
     * The configuration class used for animated sprites.
     */
    export class AnimatedSpriteComponentConfig extends SpriteComponentConfig {

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
         * The frames to display per second. 
         */
        public frameRate: number = 3;

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

            if ( jsonConfiguration.frameRate !== undefined ) {
                this.frameRate = jsonConfiguration.frameRate;
            }
        }
    }

    export class AnimatedSpriteComponent extends SpriteComponent {
        
        protected _frames: PIXI.Texture[] = [];
        protected _accumulatedFrameTime: number = 0;
        protected _isAnimating: boolean = false;
        protected _autoStartAnimation: boolean = true;
        protected _totalFrames: number;
        protected _currentFrame: number = 0;
        protected _frameSizeX: number = 0;
        protected _frameSizeY: number = 0;
        protected _frameRate: number = 3;
        protected _frameTimeMS: number;

        public constructor( config: AnimatedSpriteComponentConfig ) {
            super( config );

            this._totalFrames = config.totalFrames;
            this._autoStartAnimation = config.autoStartAnimation;
            this._frameSizeX = config.frameSizeX;
            this._frameSizeY = config.frameSizeY;
            this._frameRate = config.frameRate;
            this._frameTimeMS = this._frameRate * 1000;
            if ( this._autoStartAnimation === true ) {
                this._isAnimating = true;
            }
        }

        public initialize( components: ComponentDictionary ): void {
            super.initialize( components );
        }

        public load(): void {
            super.load();

            let totalFrames = ( this._config as AnimatedSpriteComponentConfig ).totalFrames;
            for ( let i = 0; i < totalFrames; ++i ) {

                let w = this._sprite.texture.baseTexture.realWidth;
                let h = this._sprite.texture.baseTexture.realHeight;

                if ( w === 0 || w % this._frameSizeX !== 0 ) {
                    throw new Error( "Sprite width is not a multiple of frame size. FrameSizeX=" + this._frameSizeX + ", width=" + this._sprite.width );
                }
                if ( h === 0 || h < this._frameSizeY ) {
                    throw new Error( "Sprite height is smaller than frame size. FrameSizeY=" + this._frameSizeY + ", height=" + this._sprite.height );
                }

                let baseTexture = ( this._textureAsset.internalData as PIXI.Texture ).baseTexture;
                console.info( this._sprite );

                let framesWide = w / this._frameSizeX;
                let framesHigh = ( ( h / ( this._totalFrames / framesWide ) ) / this._frameSizeY );

                // Calculate out the frames.
                for ( let y = 0; y < framesHigh; ++y ) {
                    for ( let x = 0; x < framesWide; ++x ) {

                        let tex = new PIXI.Texture( baseTexture,
                            new PIXI.Rectangle(
                                this._frameSizeX * x,
                                this._frameSizeY * y,
                                this._frameSizeX,
                                this._frameSizeY ) );
                        this._frames.push( tex );
                    }
                }
            }

            // Default to the first frame.
            this._sprite.texture = this._frames[0];
        }

        public unload(): void {
            for ( let i = 0; i < this._frames.length; ++i ) {
                this._frames[i].destroy();
            }
            super.unload();
        }

        public update( dt: number ): void {
            if ( this._isAnimating ) {

                // Accumulate time, then flip to next frame when framerate expires.
                this._accumulatedFrameTime += dt;
                if ( this._accumulatedFrameTime > this._frameTimeMS ) {
                    this._currentFrame++;
                    if ( this._currentFrame >= this._totalFrames ) {
                        this._currentFrame = 0;
                    }

                    this._sprite.texture = this._frames[this._currentFrame];

                    this._accumulatedFrameTime -= this._frameTimeMS;
                }
            }
        }

        public clone(): AnimatedSpriteComponent {
            return new AnimatedSpriteComponent( this._config as AnimatedSpriteComponentConfig );
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