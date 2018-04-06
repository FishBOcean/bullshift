module BullShift {

    export class AnimatedSpriteComponentFactory implements IComponentFactory {

        public getComponents( configuration: any ): ComponentDictionary {
            let components: ComponentDictionary = {};

            // Regular sprites.
            if ( configuration.animatedSprite ) {
                for ( let s in configuration.animatedSprite ) {
                    let config = new AnimatedSpriteComponentConfig();
                    config.populateFromJson( configuration.animatedSprite[s] );

                    if ( components[config.name] ) {
                        throw new Error( "A component named " + config.name + " already exists. Component names must be unique." );
                    }
                    components[config.name] = new AnimatedSpriteComponent( config );
                }
            }

            return components;
        }
    }
}