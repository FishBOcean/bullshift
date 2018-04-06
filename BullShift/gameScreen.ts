module BullShift {

    export abstract class GameScreen {
        protected _application: PIXI.Application;
        protected _scene: Scene;
        protected _isActive: boolean;

        public name: string;

        public constructor( application: PIXI.Application, name: string ) {
            this._application = application;
            this.name = name;
            this._isActive = false;
            this._scene = new BullShift.Scene( application, "GSScene_" + name );
        }

        public get preloading(): boolean {
            return this._scene.preloading();
        }

        public initialize(): void {
            this._scene.initialize( undefined );
        }

        public load(): void {
            if ( this.preloading ) {
                throw new Error( "GameScreen load called before preload finished!" );
            }
            this._scene.load();
        }

        public unload(): void {
            this._scene.unload();
        }

        public activate(): void {
            this._isActive = true;
            this._scene.activate();
        }

        public deactivate(): void {
            this._isActive = false;
            this._scene.deactivate();
        }

        public addButton( name: string, assetPath: string, callback: Function, x: number, y: number ): GameObject {
            let obj = new GameObject( name );
            obj.addComponent( new UIButtonComponent( name = "_component", assetPath, callback ) );
            obj.x = x;
            obj.y = y;
            this._scene.addObject( obj );
            return obj;
        }
    }
}