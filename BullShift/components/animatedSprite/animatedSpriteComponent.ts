/// <reference path="../sprite/spritecomponent.ts" />

module BullShift {

    /**
     * Represents a collection of commands used for sprite animations which are used for messages.
     * These are combined with the name of the animated sprite component to form the message name.
     */
    enum AnimatedSpriteCommands {
        SET_ANIMATION = ":SetAnimation",
        PLAY_ANIMATION = ":PlayAnimation",
        PAUSE_ANIMATION = ":PauseAnimation",
        STOP_ANIMATION = ":StopAnimation"
    };
    
    /**
     * An animated sprite which can contain a number of animations.
     */
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

        protected _currentAnimation: AnimatedSpriteAnimationConfig;
        protected _currentAnimationFrame: number = 0;

        /**
         * Creates a new animated sprite from the provided configuration object.
         * @param config The configuration to be used when creating this animated sprite.
         */
        public constructor( config: AnimatedSpriteComponentConfig ) {
            super( config );

            this._totalFrames = config.totalFrames;
            this._autoStartAnimation = config.autoStartAnimation;
            this._frameSizeX = config.frameSizeX;
            this._frameSizeY = config.frameSizeY;
            this._frameRate = config.frameRate;

            this.calculateFrameTimeMS();

            if ( this._autoStartAnimation === true ) {
                this._isAnimating = true;
            }
        }

        /**
         * Initializes this component and links any component instances needed by it.
         * @param components
         */
        public initialize( components: ComponentDictionary ): void {
            super.initialize( components );
        }

        /**
         * Loads this component.
         */
        public load(): void {
            super.load();

            let config = ( this._config as AnimatedSpriteComponentConfig );

            let totalFrames = config.totalFrames;
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

            // Default to the first frame of the default animation.
            this.setAnimation( config.defaultAnimation );

            // Default to the first frame.
            this._sprite.texture = this._frames[this._currentFrame];

            Message.subscribe( this.name + AnimatedSpriteCommands.SET_ANIMATION, this );
            Message.subscribe( this.name + AnimatedSpriteCommands.PLAY_ANIMATION, this );
            Message.subscribe( this.name + AnimatedSpriteCommands.PAUSE_ANIMATION, this );
            Message.subscribe( this.name + AnimatedSpriteCommands.STOP_ANIMATION, this );
        }

        /**
         * Unloads this component.
         */
        public unload(): void {
            for ( let i = 0; i < this._frames.length; ++i ) {
                this._frames[i].destroy();
            }
            super.unload();
        }

        /**
         * Destroys this component.
         */
        public destroy(): void {
            this._sprite.destroy();
            for ( let frame in this._frames ) {
                this._frames[frame].destroy();
            }
        }

        /**
         * Performs update logic on this component.
         * @param dt The delta time in milliseconds since the last frame.
         */
        public update( dt: number ): void {
            if ( this._isAnimating ) {

                // Accumulate time, then flip to next frame when framerate expires.
                this._accumulatedFrameTime += dt;
                if ( this._accumulatedFrameTime > this._frameTimeMS ) {
                    this._currentAnimationFrame++;
                    if ( this._currentAnimationFrame >= this._currentAnimation.frameIndices.length ) {
                        this._currentAnimationFrame = 0;
                    }
                    this.updateFrame();

                    this._accumulatedFrameTime -= this._frameTimeMS;
                }
            }
        }

        /**
         * Clones this component.
         */
        public clone(): AnimatedSpriteComponent {
            return new AnimatedSpriteComponent( this._config as AnimatedSpriteComponentConfig );
        }

        /**
         * Processes messages for this component.
         * @param message The message to be processed.
         */
        public onMessage( message: Message ): void {
            if ( !this.gameObject ) {
                console.warn( "Trying to process a message on a MoveComponent which has no attached game object." );
                return;
            }

            // TODO: Might want to have a context object which contains specific data about the action.
            // BullShift.Message.createAndSend("animatedTestComponent:SetAnimation", null, "animB");
            switch ( message.name ) {
                case this.name + AnimatedSpriteCommands.SET_ANIMATION:
                    this.setAnimation( message.context as string );
                    break;
                case this.name + AnimatedSpriteCommands.PLAY_ANIMATION:
                    if ( message.context !== undefined ) {
                        this.setAnimation( message.context as string );
                    }
                    this._isAnimating = true;
                case this.name + AnimatedSpriteCommands.PAUSE_ANIMATION:
                    this._isAnimating = false;
                    break;
                case this.name + AnimatedSpriteCommands.STOP_ANIMATION:
                    this._isAnimating = false;
                    this._currentAnimationFrame = 0;
                    this._accumulatedFrameTime = 0;
                    break;
            }
        }

        private setAnimation( animationName: string ): void {
            this._currentAnimation = ( this._config as AnimatedSpriteComponentConfig ).animations[animationName];
            this._frameRate = this._currentAnimation.frameRate;
            this._currentAnimationFrame = 0;
            this._accumulatedFrameTime = 0;
            this.calculateFrameTimeMS();
            this.updateFrame();
        }

        private updateFrame(): void {
            this._currentFrame = this._currentAnimation.frameIndices[this._currentAnimationFrame];
            this._sprite.texture = this._frames[this._currentFrame];
        }

        private calculateFrameTimeMS(): void {
            let msPerFrame = 1000 / 60;
            let ratio = 60 / this._frameRate;
            this._frameTimeMS = msPerFrame * ratio;
        }
    }
}