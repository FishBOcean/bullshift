module BullShift {

    export type ComponentDictionary = { [key: string]: IGameObjectComponent };

    export interface IComponentFactory {
        getComponents( configuration: any ): ComponentDictionary;
    }
}