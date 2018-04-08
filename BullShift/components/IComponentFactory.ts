module BullShift {

    /**
     * A type definition for a component dictionary.
     */
    export type ComponentDictionary = { [key: string]: IGameObjectComponent };

    /**
     * Represents a component factory which is used to create components from configuration.
     */
    export interface IComponentFactory {

        /**
         * Gets a collection of components which are loaded by this factory from the 
         * provided configuration.
         * @param configuration The configuration to load from.
         */
        getComponents( configuration: any ): ComponentDictionary;
    }
}