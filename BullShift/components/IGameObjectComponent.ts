module BullShift {

    export interface IGameObjectComponent {
        name: string;
        gameObject: GameObject;

        load(): void;

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