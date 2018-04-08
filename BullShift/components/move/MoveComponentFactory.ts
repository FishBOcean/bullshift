module BullShift {

    /**
     * A factory which creates move components from JSON configuration.
     */
    export class MoveComponentFactory implements IComponentFactory {

        /**
         * Returns a collection of components created from configuration in this factory.
         * @param configuration
         */
        public getComponents( configuration: any ): ComponentDictionary {
            let components: ComponentDictionary = {};

            if ( configuration.move ) {
                for ( let s in configuration.move ) {
                    let config = new MoveComponentConfig();
                    config.populateFromJson( configuration.move[s] );

                    if ( components[config.name] ) {
                        throw new Error( "A component named " + config.name + " already exists. Component names must be unique." );
                    }
                    components[config.name] = new MoveComponent( config );
                }
            }

            return components;
        }
    }
}