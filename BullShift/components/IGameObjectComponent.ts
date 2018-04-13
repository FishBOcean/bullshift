/// <reference path="../gameobject.ts" />

module BullShift {

    /**
     * An interface which all components should implement. 
     */
    export interface IGameObjectComponent {

        /**
         * The name of this component.
         */
        name: string;

        /**
         * The game object to which this component belongs.
         */
        gameObject: GameObject;

        /**
         * Initializes this component and links the provided components if needed.
         * @param components A collection of components created by the factories.
         */
        initialize( components: ComponentDictionary ): void;

        /**
         * Indicates if this component is pre-loading.
         */
        preloading(): boolean;

        /**
         * Loads this component.
         */
        load(): void;

        /**
         * Unloads this component.
         */
        unload(): void;

        /**
         * Destroys this component.
         */
        destroy(): void;

        /**
         * Updates this component.
         * @param dt The delta time since the last frmae in milliseconds.
         */
        update( dt: number ): void;

        /**
         * Clones this component.
         */
        clone(): IGameObjectComponent;
    }

    /**
     * Represents a special type of component that renders to the screen.
     */
    export interface IRenderableComponent extends IGameObjectComponent {

        /**
         * Gets internal data required by the underlying renderer.
         */
        internalData: PIXI.DisplayObject;

        /**
         * The x position.
         */
        x: number;

        /**
         * The y position.
         */
        y: number;

        /**
         * The width.
         */
        width: number;

        /**
         * The height.
         */
        height: number;
    }
}