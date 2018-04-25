/// <reference path="../basegameobjectcomponent.ts" />

module BullShift {

    /**
     * A configuration object for use with sprite components.
     */
    export class SpriteComponentConfig implements IComponentConfig {
        
        /**
         * The name of this configuration.
         */
        public name: string;

        /**
         * The name of this configuration.
         */
        public assetPath: string;

        /**
         * Creates a new sprite component configuration.
         */
        public constructor() {
        }

        /**
         * Populates the values of this configuration using the provided JSON configuration.
         * @param jsonConfiguration The JSON configuration.
         */
        public populateFromJson( jsonConfiguration: any ): void {
            if ( !jsonConfiguration.name ) {
                throw new Error( "SpriteComponentConfig json must contain a name!" );
            }
            this.name = jsonConfiguration.name;

            if ( !jsonConfiguration.asset ) {
                throw new Error( "SpriteComponentConfig json must contain an asset!" );
            }

            this.assetPath = jsonConfiguration.asset;
        }

        /**
         * Creates and returns a new sprite component configuration using the supplied 
         * name and asset path.
         * @param name The name of the configuration.
         * @param assetPath The path to the asset to be used.
         */
        public static create( name, assetPath ): SpriteComponentConfig {
            let config = new SpriteComponentConfig();
            config.name = name;
            config.assetPath = assetPath;
            return config;
        }
    }

    /**
     * A component which renders a sprite to the screen.
     */
    export class SpriteComponent extends BaseGameObjectComponent implements IRenderableComponent {

        protected _setMultiplyBlend: boolean = false;

        protected _sprite: PIXI.Sprite;
        protected _textureAsset: TextureAsset;
        protected _assetPath: string;

        /**
         * Creates a new sprite component using the supplied configuration.
         * @param config The configuration to be used when creating this sprite component.
         */
        public constructor( config: SpriteComponentConfig ) {
            super( config );

            this._assetPath = config.assetPath;
        }

        /**
         * Gets the internal display object data to be used by the underlying renderer.
         */
        public get internalData(): PIXI.DisplayObject {
            return this._sprite;
        }

        /**
         * Gets the x position.
         */
        public get x(): number {
            return this._sprite.x;
        }

        /**
         * Sets the x position.
         */
        public set x( value: number ) {
            this._sprite.x = value;
        }

        /**
         * Gets the y position.
         */
        public get y(): number {
            return this._sprite.y;
        }

        /**
         * Sets the y position.
         */
        public set y( value: number ) {
            this._sprite.y = value;
        }

        /**
         * Gets the width.
         */
        public get width(): number {
            return this._sprite.width;
        }

        /**
         * Gets the height.
         */
        public get height(): number {
            return this._sprite.height;
        }

        public enableMultiplyBlendMode() {
            if ( this._sprite !== undefined ) {
                this._sprite.blendMode = PIXI.BLEND_MODES.MULTIPLY;
            } else {
                this._setMultiplyBlend = true;
            }
        }

        /**
         * Initializes this component and links any depending components from those passed in.
         * @param components The components created from configuration.
         */
        public initialize( components: ComponentDictionary ): void {
            console.log( "SpriteComponent initializing..." );
            this._textureAsset = AssetManager.getAsset( this._assetPath ) as TextureAsset;
        }

        /**
         * Indicates whether or not this component is still preloading.
         */
        public preloading(): boolean {
            return !this._textureAsset.isLoaded();
        }

        /**
         * Loads this component.
         */
        public load(): void {
            this._sprite = new PIXI.Sprite( this._textureAsset.internalData as PIXI.Texture );
            if ( this._setMultiplyBlend ) {
                this._sprite.blendMode = PIXI.BLEND_MODES.MULTIPLY;
                this._setMultiplyBlend = false;
            }
        }

        /**
         * Unloads this component.
         */
        public unload(): void {
            this._textureAsset.unload();
        }

        /**
         * Destroys this component.
         */
        public destroy(): void {
            this._sprite.destroy();
        }

        /**
         * Updates this component.
         * @param dt The delta time since the last frame in milliseconds.
         */
        public update( dt: number ): void {
            if ( this._setMultiplyBlend ) {
                this._sprite.blendMode = PIXI.BLEND_MODES.MULTIPLY;
                this._setMultiplyBlend = false;
            }
        }

        /**
         * Clones this component.
         */
        public clone(): SpriteComponent {
            return new SpriteComponent( this._config as SpriteComponentConfig );
        }
    }
}