module BullShift {

    export class Scene {

        private _application: PIXI.Application;
        private _isActive: boolean = false;
        private _container: PIXI.Container;

        private _gameObjects: { [key: string]: GameObject } = {};

        public name: string;

        public constructor( application: PIXI.Application, name: string ) {
            this._application = application;
            this.name = name;

            this._container = new PIXI.Container();
        }

        public addObject( obj: GameObject ): void {
            if ( this._gameObjects[obj.name] ) {
                throw new Error( "Error: this scene already contains an game object called " + obj.name + ". Object names must be unique." );
            }
            this._gameObjects[obj.name] = obj;

            this._container.addChild( obj.internalData );
            obj.onSceneAdd( this );
        }

        public activate(): void {
            this._isActive = true;
            this._application.stage.addChild( this._container );
        }

        public deactivate(): void {
            this._isActive = false;
            this._application.stage.removeChild( this._container );
        }

        public load(): void {
            for ( let o in this._gameObjects ) {
                this._gameObjects[o].load();
            }
        }
    }
}