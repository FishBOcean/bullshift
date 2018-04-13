module BullShift {

    /**
     * Represents configuration for a tile set component.
     */
    export class TileSetConfig implements IComponentConfig {

        /**
         * The name of this tile set.
         */
        public name: string;

        /**
         * The collection of tile names for this configuration.
         */
        public tiles: string[] = [];

        /**
         * Populates this tile set from the provided configuration.
         * @param jsonConfiguration The JSON configuration.
         */
        public populateFromJson( jsonConfiguration: any ): void {
            if ( jsonConfiguration.name === undefined ) {
                throw new Error( "Tile set components must have a name!" );
            }
            this.name = jsonConfiguration.name;

            // Tile names
            if ( jsonConfiguration.tiles === undefined ) {
                throw new Error( "Tile set components must have an array of tiles!" );
            }
            this.tiles = jsonConfiguration.tiles;
        }
    }

    /**
     * Represents a set of tiles for use with a tile map.
     */
    export class TileSetComponent extends BaseGameObjectComponent {

        private _tileComponentNames: string[] = [];
        private _tileComponents: TileComponent[] = [];

        /**
         * Creates a new tile set component using the specified configuration.
         * @param config The tile set configuration.
         */
        public constructor( config: TileSetConfig ) {
            super( config );

            this._tileComponentNames = config.tiles;
        }

        /**
         * Returns a clone of the tile component with the requested identifier. 
         * @param id The identifier to select.
         */
        public getTileById( id: number ): TileComponent {
            return this._tileComponents[id].clone();
        }

        /**
         * Indicates whether or not this tile set is preloading.
         */
        public preloading(): boolean {
            for ( let c in this._tileComponents ) {
                if ( this._tileComponents[c].preloading() ) {
                    return true;
                }
            }
            return false;
        }

        /**
         * Initializes this component and passes through the specified components for linking.
         * @param components The collection of all components for linking purposes.
         */
        public initialize( components: ComponentDictionary ): void {
            for ( let c in this._tileComponentNames ) {
                let component = components[this._tileComponentNames[c]];
                if ( component === undefined ) {
                    throw new Error( "Tile set is trying to link to a component that does not exist." );
                }

                // Push a clone of the component to the internal collection. This will be cloned again down the road.
                let clone = component.clone() as TileComponent;
                clone.initialize( components );
                this._tileComponents.push( clone );
            }
        }

        /**
         * Loads this component.
         */
        public load(): void {
            for ( let c in this._tileComponents ) {
                this._tileComponents[c].load();
            }
        }

        /**
         * Unloads this component.
         */
        public unload(): void {
            for ( let c in this._tileComponents ) {
                this._tileComponents[c].unload();
            }
        }

        /**
         * Destroys this component.
         */
        public destroy(): void {
            for ( let c in this._tileComponents ) {
                this._tileComponents[c].destroy();
            }
        }

        /**
         * Updates this component.
         * @param dt The delta time since the last frame in milliseconds.
         */
        public update( dt: number ): void {
            for ( let c in this._tileComponents ) {
                this._tileComponents[c].update( dt );
            }
        }

        /**
         * Clones this component.
         */
        public clone(): TileSetComponent {
            return new TileSetComponent( this._config as TileSetConfig );
        }
    }
}