module BullShift {

    export abstract class BaseAsset {
        protected _references: number = 0;
        protected _loaded: boolean = false;

        public name: string;
        public assetPath: string;

        public constructor( name: string, assetPath: string ) {
            this.name = name;
            this.assetPath = assetPath;
        }

        public load(): void {
            this._references++;
        }

        public unload(): void {
            this._references--;
            if ( this._references === 0 ) {
                this.destroy;
            }
        }

        public abstract isLoaded(): boolean;

        public abstract destroy(): void;
    }

    export class TextureAsset extends BaseAsset {

        private _internalTexture: PIXI.Texture;
        private _isLoaded: boolean = false;

        public constructor( name: string, assetPath: string ) {
            super( name, assetPath );

            this._internalTexture = PIXI.Texture.fromImage( this.assetPath );

            // TODO: set _isLoaded on loaded
        }

        public isLoaded(): boolean {
            return this._isLoaded;
        }
        
        public destroy(): void {
            if ( this._internalTexture ) {
                this._internalTexture.destroy();
            }
        }
    }

    export class AssetManager {




    }
}