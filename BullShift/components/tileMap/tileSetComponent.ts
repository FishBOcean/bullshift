module BullShift {

    export class TileSetConfig implements IComponentConfig {
        public name: string;
        public tiles: string[] = [];

        public populateFromJson( jsonConfiguration: any ): void {

        }
    }

    export class TileSetComponent extends BaseGameObjectComponent {

        private _tileComponentNames: string[] = [];
        private _tileComponents: TileComponent[] = [];

        public constructor( config: TileSetConfig ) {
            super( config );

            this._tileComponentNames = config.tiles;
        }

        public preloading(): boolean {
            for ( let c in this._tileComponents ) {
                if ( this._tileComponents[c].preloading() ) {
                    return true;
                }
            }
            return false;
        }

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

        public load(): void {
            for ( let c in this._tileComponents ) {
                this._tileComponents[c].load();
            }
        }

        public unload(): void {
            for ( let c in this._tileComponents ) {
                this._tileComponents[c].unload();
            }
        }

        public update( dt: number ): void {
            for ( let c in this._tileComponents ) {
                this._tileComponents[c].update( dt );
            }
        }

        public clone(): TileSetComponent {
            return new TileSetComponent( this._config as TileSetConfig );
        }
    }
}