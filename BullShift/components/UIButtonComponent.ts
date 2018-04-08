/// <reference path="sprite/spritecomponent.ts" />

module BullShift {

    /**
     * A component which represents a user interface button.
     */
    export class UIButtonComponent extends SpriteComponent {

        protected _callback: Function;

        /**
         * Creates a new UIButton component.
         * @param name The name of this component.
         * @param assetPath The path of the asset to use with this component.
         * @param callback The fallback to be made once the component is loaded.
         */
        public constructor( name: string, assetPath: string, callback: Function ) {
            super( SpriteComponentConfig.create( name, assetPath ) );

            this._callback = callback;
        }

        /**
         * Loads this component.
         */
        public load(): void {
            super.load();

            this._sprite.on( 'pointerup', this._callback );
            this._sprite.interactive = true;
            this._sprite.buttonMode = true;
        }

        /**
         * Updates this component.
         * @param dt The delta time since the last frame in milliseconds.
         */
        public update( dt: number ): void {
        }

        /**
         * Clones this component.
         */
        public clone(): UIButtonComponent {
            return new UIButtonComponent( this.name, this._assetPath, this._callback );
        }
    }
}