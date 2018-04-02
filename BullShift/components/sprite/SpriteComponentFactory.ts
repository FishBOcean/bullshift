module BullShift {

    export class SpriteComponentFactory implements IComponentFactory {

        public getComponents( configuration: any ): ComponentDictionary {
            let components: ComponentDictionary = {};

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