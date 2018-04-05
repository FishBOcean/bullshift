/// <reference path="../basegameobjectcomponent.ts" />

module BullShift {

    export class SpriteComponentConfig implements IComponentConfig {
        public name: string;
        public assetPath: string;

        public constructor() {
        }

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

        public static create( name, assetPath ): SpriteComponentConfig {
            let config = new SpriteComponentConfig();
            config.name = name;
            config.assetPath = assetPath;
            return config;
        }
    }

    export class SpriteComponent extends BaseGameObjectComponent {

        protected _sprite: PIXI.Sprite;
        protected _assetPath: string;

        public constructor( config: SpriteComponentConfig ) {
            super( config );

            this._assetPath = config.assetPath;
        }

        public get internalData(): PIXI.DisplayObject {
            return this._sprite;
        }

        public get x(): number {
            return this._sprite.x;
        }

        public set x( value: number ) {
            this._sprite.x = value;
        }

        public get y(): number {
            return this._sprite.y;
        }

        public set y( value: number ) {
            this._sprite.y = value;
        }

        public get width(): number {
            return this._sprite.width;
        }

        public get height(): number {
            return this._sprite.height;
        }

        public load(): void {
            this._sprite = PIXI.Sprite.fromImage( this._assetPath );
        }

        public update( dt: number ): void {
        }

        public clone(): SpriteComponent {
            return new SpriteComponent( this._config as SpriteComponentConfig );
        }
    }
}