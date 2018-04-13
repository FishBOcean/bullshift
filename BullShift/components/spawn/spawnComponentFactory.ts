module BullShift {

    /**
     * A factory which creates spawn components from JSON configuration.
     */
    export class SpawnComponentFactory implements IComponentFactory {

        /**
         * Returns a collection of components created from configuration in this factory.
         * @param configuration
         */
        public getComponents( configuration: any ): ComponentDictionary {
            let components: ComponentDictionary = {};

            if ( configuration.spawn ) {
                for ( let s in configuration.spawn ) {
                    let config = new SpawnComponentConfig();
                    config.populateFromJson( configuration.spawn[s] );

                    if ( components[config.name] ) {
                        throw new Error( "A component named " + config.name + " already exists. Component names must be unique." );
                    }
                    console.info( "Spawn component created:" + config.name );
                    components[config.name] = new SpawnComponent( config );
                }
            }

            return components;
        }
    }
}