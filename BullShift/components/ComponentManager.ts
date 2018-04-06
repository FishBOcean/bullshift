
module BullShift {

    export class ComponentManager {

        private static _inst: ComponentManager;

        private _factories: IComponentFactory[] = [];

        private constructor() {

            // Add new factories here.
            this._factories.push( new SpriteComponentFactory() );
            this._factories.push( new MoveComponentFactory() );
            this._factories.push( new AnimatedSpriteComponentFactory() );
        }

        public static initialize(): void {
            if ( !ComponentManager._inst ) {
                ComponentManager._inst = new ComponentManager();
            }
        }

        /**
         * Gets components from the provided configuration.
         * @param configuration The JSON-formatted configuration.
         * @returns A dictionary of the name/components created from configuration.
         */
        public static getComponentsFromConfiguration( configuration: any ): ComponentDictionary {
            let components: ComponentDictionary = {};

            if ( configuration.components ) {
                for ( let f in ComponentManager._inst._factories ) {
                    let extractedComponents = ComponentManager._inst._factories[f].getComponents( configuration.components );
                    for ( let c in extractedComponents ) {
                        let comp = extractedComponents[c];

                        if ( components[comp.name] ) {
                            throw new Error( "A component named " + comp.name + " already exists. Component names must be unique." );
                        }
                        components[comp.name] = comp;
                    }
                }
            }

            return components;
        }
    }
}