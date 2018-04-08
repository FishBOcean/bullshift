module BullShift {

    /**
     * A component configuration.
     */
    export interface IComponentConfig {

        /**
         * The name of this component.
         */
        name: string;

        /**
         * Populates this component's values with those provided in the JSON configuration.
         * @param jsonConfiguration The JSON configuration.
         */
        populateFromJson( jsonConfiguration: any ): void;
    }
}