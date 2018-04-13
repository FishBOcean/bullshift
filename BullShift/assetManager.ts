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
                console.debug( "Destroying asset:" + this.name );
                this.destroy;
                AssetManager.removeAsset( this.name );
            }
        }

        public abstract isLoaded(): boolean;

        public abstract destroy(): void;
    }

    export class TextureAsset extends BaseAsset {

        private _internalTexture: PIXI.Texture;
        private _loader: PIXI.loaders.Loader;

        public constructor( name: string, assetPath: string ) {
            super( name, assetPath );

            this._loader = new PIXI.loaders.Loader();
            this._loader.add( this.assetPath, this.assetPath );
            this._loader.load( this.onLoaded.bind( this ) );
        }

        public get internalData(): PIXI.Texture {
            return this._internalTexture;
        }

        public isLoaded(): boolean {
            if ( !this._internalTexture || !this._internalTexture.baseTexture ) {
                return false;
            }
            return this._internalTexture.baseTexture.hasLoaded;
        }

        public destroy(): void {
            if ( this._internalTexture ) {
                this._internalTexture.destroy();
            }
        }

        private onLoaded( loader: PIXI.loaders.Loader, resources: any ): void {
            let resource = resources[Object.keys( resources )[0]];
            console.log( "Texture asset loaded!", loader, resource );

            this._internalTexture = resource.texture;

            // Load offscreen first. This ensures the asset sizes are obtainable.
            let temp = new PIXI.Sprite( this._internalTexture );
            temp.x = -9999;
            temp.y = -9999;
        }
    }

    export class AssetManager {

        private static _inst: AssetManager;
        private _assets: { [name: string]: BaseAsset } = {};
        private _application: PIXI.Application;
        private _sceneObj: PIXI.Container;

        private constructor( application: PIXI.Application ) {
            this._application = application;
            this._sceneObj = new PIXI.Container();
            this._application.stage.addChild( this._sceneObj );
        }

        public static initialize( application: PIXI.Application ): void {
            if ( !AssetManager._inst ) {
                AssetManager._inst = new AssetManager( application );
            }
        }

        public static removeAsset( assetName: string ): void {
            AssetManager._inst._assets[assetName] = undefined;
            delete AssetManager._inst._assets[assetName];
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

                AssetManager._inst._assets[assetPath] = asset;
                return asset;
            }
        }
    }
}