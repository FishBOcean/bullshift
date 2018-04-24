module BullShift {

    /**
     * A factory for building text components from configuration.
     */
    export class TextComponentFactory implements IComponentFactory {

        /**
         * Gets all components created by this type of factory from the supplied configuration.
         * @param configuration The configuration JSON to load components from. 
         */
        public getComponents( configuration: any ): ComponentDictionary {
            let components: ComponentDictionary = {};

            // Regular text.
            if ( configuration.text ) {
                for ( let s in configuration.text ) {
                    let config = new TextComponentConfiguration();
                    config.populateFromJson( configuration.text[s] );

                    if ( components[config.name] ) {
                        throw new Error( "A component named " + config.name + " already exists. Component names must be unique." );
                    }
                    components[config.name] = new TextComponent( config );
                }
            }

            return components;
        }
    }
}