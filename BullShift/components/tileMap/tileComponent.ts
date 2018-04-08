module BullShift {

    export enum TileType {
        BACKGROUND = "background",
        WALL = "wall",
        MOVABLE = "movable",
        ENEMY = "enemy",
        PICKUP = "pickup",
        GOAL = "goal"
    }

    export class TileConfig implements IComponentConfig {
        public name: string;
        public type: TileType;
        public spriteComponent: string;

        public populateFromJson( jsonConfiguration: any ): void {
            if ( jsonConfiguration.type === undefined ) {
                throw new Error( "Tile configuration requires type parameter." );
            } else {

                // TODO: There must be a better way to handle this.
                switch ( jsonConfiguration.type as string ) {
                    case TileType.BACKGROUND:
                        this.type = TileType.BACKGROUND;
                        break;
                    case TileType.WALL:
                        this.type = TileType.WALL;
                        break;
                    case TileType.MOVABLE:
                        this.type = TileType.MOVABLE;
                        break;
                    case TileType.ENEMY:
                        this.type = TileType.ENEMY;
                        break;
                    case TileType.PICKUP:
                        this.type = TileType.PICKUP;
                        break;
                    case TileType.GOAL:
                        this.type = TileType.GOAL;
                        break;
                    default:
                        throw new Error( "Invalid tile type was passed:" + jsonConfiguration.type as string );
                }
            }

            if ( jsonConfiguration.spriteComponent === undefined ) {
                throw new Error( "spriteComponent property expected." );
            }
            this.spriteComponent = jsonConfiguration.spriteComponent;
        }
    }

    export class TileComponent extends BaseGameObjectComponent implements IRenderableComponent {

        private _tileType: TileType;
        private _spriteComponentName: string;
        private _spriteComponent: SpriteComponent;

        public constructor( config: TileConfig ) {
            super( config );

            this._tileType = config.type;
            this._spriteComponentName = config.spriteComponent;
        }

        public get x(): number {
            return this._spriteComponent.x;
        }

        public set x( value: number ) {
            this._spriteComponent.x = value;
        }

        public get y(): number {
            return this._spriteComponent.y;
        }

        public set y( value: number ) {
            this._spriteComponent.y = value;
        }

        public get width(): number {
            return this._spriteComponent.width;
        }

        public get height(): number {
            return this._spriteComponent.height;
        }

        public get internalData(): PIXI.DisplayObject {
            return this._spriteComponent.internalData;
        }

        public preloading(): boolean {
            return this._spriteComponent.preloading();
        }

        public initialize( components: ComponentDictionary ): void {

            // Link the component by name, clone it then initialize the clone.
            this._spriteComponent = components[this._spriteComponentName].clone() as SpriteComponent;
            if ( this._spriteComponent === undefined ) {
                throw new Error( "Sprite component not found: " + this._spriteComponentName );
            }

            this._spriteComponent.initialize( components );
        }

        public load(): void {
            this._spriteComponent.load();
        }

        public unload(): void {
            this._spriteComponent.unload();
        }

        public update( dt: number ): void {
            this._spriteComponent.update( dt );
        }

        public clone(): TileComponent {
            return new TileComponent( this._config as TileConfig );
        }
    }
}