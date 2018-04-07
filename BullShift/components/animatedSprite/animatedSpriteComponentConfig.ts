module BullShift {

    /**
     * Represents the configuration of an animation for an animated sprite.
     */
    export class AnimatedSpriteAnimationConfig {

        /**
         * The name of this animation.
         */
        public name: string;

        /**
         * The frame indices that make up this animation.
         */
        public frameIndices: number[] = [];

        /**
         * The frame rate of this animation.
         */
        public frameRate: number = 3;

        /**
         * Creates a new animated sprite animation configuration, which defines an animation sequence of an animated sprite.
         * @param name The name of the animation.
         * @param frameIndices An array of array indices. Optional.
         * @param frameRate The number of frames per second for this animation. Optional.
         */
        public constructor( name: string, frameIndices?: number[], frameRate?: number ) {
            this.name = name;
            if ( frameIndices !== undefined ) {
                this.frameIndices = frameIndices;
            }
            if ( frameRate === undefined ) {
                this.frameRate = frameRate;
            }
        }

        /**
         * Creates a new animated sprite animation configuration from a JSON object, which defines an 
         * animation sequence of an animated sprite.
         * @param jsonConfiguration The JSON configuration.
         */
        public static fromJsonConfiguration( jsonConfiguration: any ): AnimatedSpriteAnimationConfig {

            if ( jsonConfiguration.name === undefined ) {
                throw new Error( "AnimatedSpriteAnimationConfig must have a name" );
            }
            let config = new AnimatedSpriteAnimationConfig( jsonConfiguration.name );

            if ( jsonConfiguration.frameIndices !== undefined ) {
                config.frameIndices = jsonConfiguration.frameIndices;
            } else {
                throw new Error( "AnimatedSpriteAnimationConfig created with no frameIndices." );
            }

            if ( jsonConfiguration.frameRate !== undefined ) {
                config.frameRate = jsonConfiguration.frameRate;
            }

            return config;
        }
    }

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
         * The total number of frames in the sprite sheet.
         */
        public totalFrames: number;

        /**
         * The frames to display per second. 
         */
        public frameRate: number = 3;

        /**
         * The animation which plays by default.
         */
        public defaultAnimation: string = "default";

        /**
         * A collection of animation info. If this is empty, a default animation is created which
         */
        public animations: { [name: string]: AnimatedSpriteAnimationConfig } = {};

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

            // Load animations
            if ( jsonConfiguration.animations !== undefined ) {
                for ( let a in jsonConfiguration.animations ) {
                    let anim = AnimatedSpriteAnimationConfig.fromJsonConfiguration( jsonConfiguration.animations[a] );
                    this.animations[anim.name] = anim;

                }
            }

            if ( jsonConfiguration.defaultAnimation !== undefined ) {
                this.defaultAnimation = jsonConfiguration.defaultAnimation;
            } else {
                this.defaultAnimation = "default";
            }

            // In no animations are loaded, create a default one.
            if ( Object.keys( this.animations ).length === 0 ) {
                let frameIndices: number[] = [];
                for ( let i = 0; i < this.totalFrames; ++i ) {
                    frameIndices.push( i );
                }
                this.animations["default"] = new AnimatedSpriteAnimationConfig( "default", frameIndices, this.frameRate );
                this.defaultAnimation = "default";
            }

            // Validation
            if ( this.animations[this.defaultAnimation] === undefined ) {
                throw new Error( "AnimatedSpriteAnimationConfig - Default animation '" + this.defaultAnimation + "' does not exist!" );
            }
        }
    }
}