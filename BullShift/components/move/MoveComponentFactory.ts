module BullShift {

    export class MoveComponentFactory implements IComponentFactory {

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