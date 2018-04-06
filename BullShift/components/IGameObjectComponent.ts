/// <reference path="../gameobject.ts" />

module BullShift {

    export interface IGameObjectComponent {
        name: string;
        gameObject: GameObject;

        initialize( components: ComponentDictionary ): void;

        preloading(): boolean;

        load(): void;

        unload(): void;

        update( dt: number ): void;

        clone(): IGameObjectComponent;
    }

    export interface IRenderableComponent extends IGameObjectComponent {
        internalData: PIXI.DisplayObject;
        x: number;
        y: number;
        width: number;
        height: number;
    }
}