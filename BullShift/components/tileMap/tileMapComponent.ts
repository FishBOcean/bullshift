
module BullShift {

    
    /**
     * Tile map component configuration.
     */
    export class TileMapConfiguration implements IComponentConfig {

        public name: string;
        public tileSet: string;
        public tilesWide: number;
        public tilesHigh: number;

        public layers: TileMapLayerConfiguration[] = [];

        public populateFromJson( jsonConfiguration: any ): void {
            if ( jsonConfiguration.name === undefined ) {
                throw new Error( "Tile map components must have a name!" );
            }
            this.name = jsonConfiguration.name;

            // Tile set name
            if ( jsonConfiguration.tileSet === undefined ) {
                throw new Error( "Tile map components must have a tileSet!" );
            }
            this.tileSet = jsonConfiguration.tileSet;

            // Tiles wide
            if ( jsonConfiguration.tilesWide === undefined ) {
                throw new Error( "Tile map components must have a tilesWide property!" );
            }
            this.tilesWide = jsonConfiguration.tilesWide;

            // Tiles high
            if ( jsonConfiguration.tilesHigh === undefined ) {
                throw new Error( "Tile map components must have a tilesHigh property!" );
            }
            this.tilesHigh = jsonConfiguration.tilesHigh;

            // Layers
            if ( jsonConfiguration.layers === undefined ) {
                throw new Error( "Tile map components must have an array of layers!" );
            }
            for ( let layer in jsonConfiguration.layers ) {
                let layerConfig = new TileMapLayerConfiguration( jsonConfiguration.layers[layer], this.tilesWide, this.tilesHigh );

                this.layers.push( layerConfig );
            }
        }
    }

    /**
     * A tile map component.
     */
    export class TileMapComponent extends BaseGameObjectComponent implements IRenderableComponent {

        private _tileSize: number;
        private _tilesWide: number;
        private _tilesHigh: number;

        private _tileSetName: string;
        private _tileSet: TileSetComponent;

        private _container: PIXI.Container;
        private _layers: TileMapLayer[] = [];

        public constructor( config: TileMapConfiguration ) {
            super( config );

            this._container = new PIXI.Container();

            this._tileSetName = config.tileSet;
            for ( let i = 0; i < config.layers.length; ++i ) {
                let layer = new TileMapLayer( config.layers[i] );
                this._layers.push( layer );
            }
        }

        public get internalData(): PIXI.DisplayObject {
            return this._container;
        }

        public get x(): number {
            return this._container.x;
        }

        public set x( value: number ) {
            this._container.x = value;
        }

        public get y(): number {
            return this._container.y;
        }

        public set y( value: number ) {
            this._container.y = value;
        }

        public get width(): number {
            return this._tileSize * this._tilesWide;
        }

        public get height(): number {
            return this._tileSize * this._tilesHigh;
        }

        public preloading(): boolean {
            for ( let i = 0; i < this._layers.length; ++i ) {
                if ( this._layers[i].preloading() ) {
                    return true;
                }
            }
            return false;
        }

        public initialize( components: ComponentDictionary ): void {
            let component = components[this._tileSetName];
            if ( component === undefined ) {
                throw new Error( "Tile map is trying to link to a component that does not exist." );
            } else {
                this._tileSet = component.clone() as TileSetComponent;
                this._tileSet.initialize( components );
            }

            // Note: might need to do this on load instead.
            for ( let i = 0; i < this._layers.length; ++i ) {
                this._container.addChild( this._layers[i].internalData );
                this._layers[i].initialize( components, this._tileSet );
            }
        }

        public load(): void {
            this._tileSet.load();
            for ( let i = 0; i < this._layers.length; ++i ) {
                this._layers[i].load();
            }
        }

        public unload(): void {
            this._tileSet.unload();
            for ( let i = 0; i < this._layers.length; ++i ) {
                this._layers[i].unload();
            }
        }

        public update( dt: number ): void {
            //this._tileSet.update( dt );
            for ( let i = 0; i < this._layers.length; ++i ) {
                this._layers[i].update( dt );
            }
        }

        public clone(): TileMapComponent {
            return new TileMapComponent( this._config as TileMapConfiguration );
        }
    }
}