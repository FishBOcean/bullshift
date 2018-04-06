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

        public abstract get internalData(): any;

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
        //private _isLoaded: boolean = false;
        private _loader: PIXI.loaders.Loader;

        public constructor( name: string, assetPath: string ) {
            super( name, assetPath );

            //this._loader = new PIXI.loaders.Loader();
            //this._loader.add( this.assetPath, this.assetPath );
            //this._loader.onLoad = this.onLoaded.bind( this );
            //this._loader.load();
            //this._internalTexture.baseTexture.

            this._internalTexture = PIXI.Texture.fromImage( this.assetPath );
            
        }

        public get internalData(): PIXI.Texture {
            return this._internalTexture;
        }

        public isLoaded(): boolean {
            //return this._isLoaded;
            //return this._internalTexture.baseTexture.hasLoaded;
            console.log( "texture loaded:" + this._internalTexture.baseTexture.hasLoaded, this._internalTexture.baseTexture );
            return this._internalTexture.baseTexture.hasLoaded;
        }
        
        public destroy(): void {
            if ( this._internalTexture ) {
                this._internalTexture.destroy();
            }
        }

        private onLoaded( loader: PIXI.loaders.Loader, texture: PIXI.Texture ): void {
            console.log( "Texture asset loaded!" );
            this._internalTexture = texture;
            //this._isLoaded = true;
        }
    }

    export class AssetManager {

        private static _inst;
        private _assets: { [name: string]: BaseAsset } = {};

        public static initialize(): void {
            if ( !AssetManager._inst ) {
                AssetManager._inst = new AssetManager();
            }
        }

        public static getAsset( assetPath: string ): BaseAsset {
            if ( AssetManager._inst._assets[assetPath] ) {
                return AssetManager._inst._assets[assetPath];
            } else {

                // Create new
                let ext = StringUtils.getFileExtension( assetPath );

                let asset: BaseAsset;

                // TODO: This is far from ideal, but it works for now.
                switch ( ext ) {
                    case "jpg":
                    case "jpeg":
                    case "gif":
                    case "png":
                        asset = new TextureAsset( assetPath, assetPath );
                        break;
                    default:
                        throw new Error( "The file extension " + ext + " is not supported." );
                }

                return asset;
            }
        }

        
    }
}