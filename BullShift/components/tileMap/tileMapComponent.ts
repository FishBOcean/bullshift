
module BullShift {

    export class TileMapConfiguration implements IComponentConfig {

        public name: string;
        public tileSet: string;

        public populateFromJson( jsonConfiguration: any ): void {

        }
    }

    export class TileMapComponent extends BaseGameObjectComponent {

        private _tileSize: number;
        private _tilesWide: number;
        private _tilesHigh: number;

        private _tileSetName: string;
        private _tileSet: TileSetComponent;

        public constructor( config: TileMapConfiguration ) {
            super( config );

            this._tileSetName = config.tileSet;
        }


        public get width(): number {
            return this._tileSize * this._tilesWide;
        }

        public get height(): number {
            return this._tileSize * this._tilesHigh;
        }

        public preloading(): boolean {
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

            // TODO: Loop through actual positional mapping and clone components for all tiles.
        }

        public load(): void {
            this._tileSet.load();
        }

        public unload(): void {
            this._tileSet.unload();
        }

        public update( dt: number ): void {
            this._tileSet.update( dt );
        }

        public clone(): TileMapComponent {
            return new TileMapComponent( this._config as TileMapConfiguration );
        }
    }
}