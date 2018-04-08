module BullShift {

    /**
     * A factory for creating tile maps and their associated components from configuration.
     */
    export class TileMapComponentFactory implements IComponentFactory {

        /**
         * Returns a collection of components created by this factory.
         * @param configuration The JSON configuration to create from.
         */
        public getComponents( configuration: any ): ComponentDictionary {
            let components: ComponentDictionary = {};

            // Tile maps
            if ( configuration.tileMap ) {
                for ( let s in configuration.tileMap ) {
                    let config = new TileMapConfiguration();
                    config.populateFromJson( configuration.tileMap[s] );

                    if ( components[config.name] ) {
                        throw new Error( "A component named " + config.name + " already exists. Component names must be unique." );
                    }
                    components[config.name] = new TileMapComponent( config );
                }
            }

            // Tile sets
            if ( configuration.tileSet ) {
                for ( let s in configuration.tileSet ) {
                    let config = new TileSetConfig();
                    config.populateFromJson( configuration.tileSet[s] );

                    if ( components[config.name] ) {
                        throw new Error( "A component named " + config.name + " already exists. Component names must be unique." );
                    }
                    components[config.name] = new TileSetComponent( config );
                }
            }

            // Tiles
            if ( configuration.tile ) {
                for ( let s in configuration.tile ) {
                    let config = new TileConfig();
                    config.populateFromJson( configuration.tile[s] );

                    if ( components[config.name] ) {
                        throw new Error( "A component named " + config.name + " already exists. Component names must be unique." );
                    }
                    components[config.name] = new TileComponent( config );
                }
            }

            return components;
        }
    }
}