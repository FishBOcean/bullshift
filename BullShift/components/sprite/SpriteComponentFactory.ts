module BullShift {

    /**
     * A factory for building sprite components from configuration.
     */
    export class SpriteComponentFactory implements IComponentFactory {

        /**
         * Gets all components created by this type of factory from the supplied configuration.
         * @param configuration The configuration JSON to load components from. 
         */
        public getComponents( configuration: any ): ComponentDictionary {
            let components: ComponentDictionary = {};

            // Regular sprites.
            if ( configuration.sprite ) {
                for ( let s in configuration.sprite ) {
                    let config = new SpriteComponentConfig();
                    config.populateFromJson( configuration.sprite[s] );

                    if ( components[config.name] ) {
                        throw new Error( "A component named " + config.name + " already exists. Component names must be unique." );
                    }
                    components[config.name] = new SpriteComponent( config );
                }
            }

            return components;
        }
    }
}