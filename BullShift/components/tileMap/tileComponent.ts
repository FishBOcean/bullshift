module BullShift {

    /**
     * The type of tile.
     */
    export enum TileType {
        BACKGROUND = "background",
        WALL = "wall",
        MOVABLE = "movable",
        ENEMY = "enemy",
        PICKUP = "pickup",
        GOAL = "goal"
    }

    /**
     * Tile component configuration.
     */
    export class TileConfig implements IComponentConfig {

        /**
         * The name of this component.
         */
        public name: string;

        /**
         * The tile type.
         */
        public type: TileType;

        /**
         * The name of the sprite component which will be used by this tile.
         */
        public spriteComponent: string;

        /**
         * Populates the values in this configuration from the provided JSON configuration object.
         * @param jsonConfiguration The JSON configuration object.
         */
        public populateFromJson( jsonConfiguration: any ): void {
            if ( jsonConfiguration.name === undefined ) {
                throw new Error( "Tile components must have a name!" );
            }
            this.name = jsonConfiguration.name;

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

    /**
     * Represents a tile which is used by a tile map.
     */
    export class TileComponent extends BaseGameObjectComponent implements IRenderableComponent {

        private _tileType: TileType;
        private _spriteComponentName: string;
        private _spriteComponent: SpriteComponent;

        /**
         * Creates a new tile component from the provided configuration.
         * @param config The tile configuration.
         */
        public constructor( config: TileConfig ) {
            super( config );

            this._tileType = config.type;
            this._spriteComponentName = config.spriteComponent;
        }

        /**
         * Gets the x position.
         */
        public get x(): number {
            return this._spriteComponent.x;
        }

        /**
         * Sets the x position.
         */
        public set x( value: number ) {
            this._spriteComponent.x = value;
        }

        /**
         * Gets the y position.
         */
        public get y(): number {
            return this._spriteComponent.y;
        }

        /**
         * Sets the y position.
         */
        public set y( value: number ) {
            this._spriteComponent.y = value;
        }

        /**
         * Gets the width.
         */
        public get width(): number {
            return this._spriteComponent.width;
        }

        /**
         * Gets the height.
         */
        public get height(): number {
            return this._spriteComponent.height;
        }

        /**
         * Returns the internal data of this component which is used by the underlying renderer.
         */
        public get internalData(): PIXI.DisplayObject {
            return this._spriteComponent.internalData;
        }

        /**
         * Indicates if this component is preloading.
         */
        public preloading(): boolean {
            return this._spriteComponent.preloading();
        }

        /**
         * Initializes this component and links it to any requird components.
         * @param components A collection of all components to which this component can be linked.
         */
        public initialize( components: ComponentDictionary ): void {

            // Link the component by name, clone it then initialize the clone.
            console.log( "Linking sprite component to tile: " + this._spriteComponentName + "..." );
            this._spriteComponent = components[this._spriteComponentName].clone() as SpriteComponent;
            if ( this._spriteComponent === undefined ) {
                throw new Error( "Sprite component not found: " + this._spriteComponentName );
            }

            this._spriteComponent.initialize( components );
        }

        /**
         * Loads this component.
         */
        public load(): void {
            this._spriteComponent.load();
        }

        /**
         * Unloads this component.
         */
        public unload(): void {
            this._spriteComponent.unload();
        }

        /**
         * Destroys this component.
         */
        public destroy(): void {
            this._spriteComponent.destroy();
        }

        /**
         * Updates this component.
         * @param dt The delta time in milliseconds since the last frame.
         */
        public update( dt: number ): void {
            this._spriteComponent.update( dt );
        }

        /**
         * Clones this component.
         */
        public clone(): TileComponent {
            return new TileComponent( this._config as TileConfig );
        }
    }
}