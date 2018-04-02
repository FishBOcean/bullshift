/// <reference path="sprite/spritecomponent.ts" />

module BullShift {

    export class UIButtonComponent extends SpriteComponent {

        protected _callback: Function;

        public constructor( name: string, assetPath: string, callback: Function ) {
            super( SpriteComponentConfig.create( name, assetPath ) );

            this._callback = callback;
        }

        public load(): void {
            super.load();

            this._sprite.on( 'pointerup', this._callback );
            this._sprite.interactive = true;
            this._sprite.buttonMode = true;
        }

        public update( dt: number ): void {
        }

        public clone(): UIButtonComponent {
            return new UIButtonComponent( this.name, this._assetPath, this._callback );
        }
    }
}