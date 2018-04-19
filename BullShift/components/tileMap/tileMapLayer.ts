module BullShift {

    /**
     * Tile map layer configuration.
     */
    export class TileMapLayerConfiguration {

        /**
         * The tile identifiers in this layer.
         */
        public tileIDs: number[] = [];

        /**
         * How many tiles wide this layer is. Must match lower layers.
         */
        public tilesWide: number;

        /**
         * How many tiles high this layer is. Must match lower layers.
         */
        public tilesHigh: number;

        /**
         * Creates a new tile map layer configuration object.
         * @param layerConfigurationJson A JSON object which contains an array of tile identifiers in a property called tileIDS.
         */
        public constructor( layerConfigurationJson: any, tilesWide: number, tilesHigh: number ) {
            if ( layerConfigurationJson.tileIDs === undefined ) {
                throw new Error( "Tile layer configuration must have an array of tileIDs!" );
            }
            this.tileIDs = layerConfigurationJson.tileIDs;
            this.tilesWide = tilesWide;
            this.tilesHigh = tilesHigh;
        }
    }

    /**
     * Represents a layer of a tile map. Though the structure resembles a component, it merely resembles it at an interface level.
     * It is not created, loaded or called in the same way components are. It is managed directly by the tile map component
     * which created it.
     */
    export class TileMapLayer {

        private _config: TileMapLayerConfiguration;

        private _container: PIXI.Container;

        private _tilesWide: number;
        private _tilesHigh: number;
        private _tiles: TileComponent[] = [];

        /**
         * Creates a new tile map layer with the provided configuration.
         * @param config The layer configuration.
         */
        public constructor( config: TileMapLayerConfiguration ) {
            this._container = new PIXI.Container();
            this._config = config;
            this._tilesWide = config.tilesWide;
            this._tilesHigh = config.tilesHigh;
        }

        /**
         * Gets the internal data for this layer
         */
        public get internalData(): PIXI.DisplayObject {
            return this._container;
        }

        /**
         * Gets the tile by the given index.
         * @param index The index of the tile to get.
         */
        public getTileByIndex( index: number ): TileComponent {
            return this._tiles[index];
        }

        /**
         * Indicates whether or not this layer is preloading.
         */
        public preloading(): boolean {
            for ( let i = 0; i < this._tiles.length; ++i ) {
                if ( this._tiles[i].preloading() ) {
                    return true;
                }
            }
            return false;
        }

        /**
         * Initializes this layer with the specified components and tile set.
         * @param components The components to pass down.
         * @param tileSet The tile set to be used.
         */
        public initialize( components: ComponentDictionary, tileSet: TileSetComponent ): void {
            for ( let i = 0; i < this._config.tileIDs.length; ++i ) {
                let tile = tileSet.getTileById( this._config.tileIDs[i] );

                tile.initialize( components );
                
                this._tiles.push( tile );
            }
        }

        /**
         * Loads this layer.
         */
        public load(): void {
            for ( let i = 0; i < this._tiles.length; ++i ) {
                let tile = this._tiles[i];
                tile.load();

                // This is done because layers aren't true components.
                this._container.addChild( tile.internalData );

                // Calculate x/y. Note: Offset row by -1?
                let row = BSMath.intDivide( i, this._tilesWide );
                let col = i % this._tilesWide;

                tile.x = Game.TILE_SIZE * col;
                tile.y = Game.TILE_SIZE * row;
            }
        }

        /**
         * Unloads this layer.
         */
        public unload(): void {
            for ( let i = 0; i < this._tiles.length; ++i ) {
                this._tiles[i].unload();
            }
        }

        /**
         * Destroys this component.
         */
        public destroy(): void {
            for ( let i = 0; i < this._tiles.length; ++i ) {
                this._tiles[i].destroy();
            }
        }

        /**
         * Updates this layer.
         * @param dt The delta time since the last frame in milliseconds.
         */
        public update( dt: number ): void {
            for ( let i = 0; i < this._tiles.length; ++i ) {
                this._tiles[i].update( dt );
            }
        }
    }
}