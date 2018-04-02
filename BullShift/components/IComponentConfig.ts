module BullShift {

    export interface IComponentConfig {
        name: string;
        
        populateFromJson( jsonConfiguration: any ): void;
    }
}