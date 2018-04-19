module BullShift {

    /**
     * A factory which creates Sokoban Controller components from JSON configuration.
     */
    export class SokobanControllerComponentFactory implements IComponentFactory {

        /**
         * Returns a collection of components created from configuration in this factory.
         * @param configuration
         */
        public getComponents( configuration: any ): ComponentDictionary {
            let components: ComponentDictionary = {};

            if ( configuration.sokobanController ) {
                for ( let s in configuration.sokobanController ) {
                    let config = new SokobanControllerComponentConfig();
                    config.populateFromJson( configuration.sokobanController[s] );

                    if ( components[config.name] ) {
                        throw new Error( "A component named " + config.name + " already exists. Component names must be unique." );
                    }
                    console.info( "Sokoban Controller component created:" + config.name );
                    components[config.name] = new SokobanControllerComponent( config );
                }
            }

            return components;
        }
    }
}