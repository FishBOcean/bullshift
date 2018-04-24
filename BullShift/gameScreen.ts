module BullShift {

    export abstract class GameScreen {
        protected _container: PIXI.Container;
        protected _scene: Scene;
        protected _isActive: boolean;

        public name: string;

        public constructor( container: PIXI.Container, name: string ) {
            this._container = container;
            this.name = name;
            this._isActive = false;
            this._scene = new BullShift.Scene( container, "GSScene_" + name );
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

        public update( dt: number ): void {
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
            obj.addComponent( new UIButtonComponent( name, assetPath, callback ) );
            obj.x = x;
            obj.y = y;
            this._scene.addObject( obj );
            return obj;
        }

        public addTextControl( name: string, x: number, y: number, text: string = "" ) {
            let obj = new GameObject( name );
            let cmp = new TextComponent( TextComponentConfiguration.create( name, text ) );
            obj.addComponent( cmp );
            obj.x = x;
            obj.y = y;
            this._scene.addObject( obj );
            return obj;
        }
    }
}