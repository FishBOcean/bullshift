/// <reference path="gameobject.ts" />

module BullShift {

    export class Scene {

        private _application: PIXI.Application;
        private _isActive: boolean = false;
        private _container: PIXI.Container;
        private _worldContainer: PIXI.Container;

        private _gameObjects: { [key: string]: GameObject } = {};

        public name: string;

        public constructor( worldContainer: PIXI.Container, name: string ) {
            this._worldContainer = worldContainer;
            this.name = name;

            this._container = new PIXI.Container();
        }

        public get isActive(): boolean {
            return this._isActive;
        }

        public addObject( obj: GameObject ): void {
            if ( this._gameObjects[obj.name] ) {
                debugger;
                throw new Error( "Error: this scene already contains an game object called " + obj.name + ". Object names must be unique." );
            }
            this._gameObjects[obj.name] = obj;

            this._container.addChild( obj.internalData );
            obj.onSceneAdd( this );
        }

        public getObject( objectName: string ): GameObject {
            return this._gameObjects[objectName];
        }

        public activate(): void {
            this._isActive = true;
            this._worldContainer.addChild( this._container );
        }

        public deactivate(): void {
            this._isActive = false;
            this._worldContainer.removeChild( this._container );
        }

        public preloading(): boolean {
            for ( let o in this._gameObjects ) {
                if ( this._gameObjects[o].preloading() ) {
                    return true;
                }
            }
            return false;
        }

        public initialize( components: ComponentDictionary ): void {
            for ( let o in this._gameObjects ) {
                this._gameObjects[o].initialize( components );
            }
        }

        public load(): void {
            for ( let o in this._gameObjects ) {
                this._gameObjects[o].load();
            }
        }

        public unload(): void {
            for ( let o in this._gameObjects ) {
                this._gameObjects[o].unload();
            }
        }

        public destroy(): void {
            for ( let o in this._gameObjects ) {
                this._gameObjects[o].destroy();
                delete this._gameObjects[o];
            }
        }

        public update( dt: number ): void {
            for ( let o in this._gameObjects ) {
                this._gameObjects[o].update( dt );
            }
        }
    }
}