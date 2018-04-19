module BullShift {

    export class GameObject {

        private _scene: Scene;
        private _container: PIXI.Container;
        private _name: string;
        private _components: IGameObjectComponent[] = [];
        private _children: GameObject[] = [];

        public constructor( name: string ) {
            this._name = name;
            this._container = new PIXI.Container();
        }

        public get name(): string {
            return this._name;
        }

        public get internalData(): PIXI.DisplayObject {
            return this._container;
        }

        public get x(): number {
            return this._container.x;
        }

        public set x( value: number ) {
            this._container.x = value;
        }

        public get y(): number {
            return this._container.y;
        }

        public set y( value: number ) {
            this._container.y = value;
        }

        public get visible(): boolean {
            return this._container.visible;
        }

        public set visible( visible: boolean ) {
            this._container.visible = visible;
        }

        public onSceneAdd( scene: Scene ): void {
            this._scene = scene;
        }

        public update( dt: number ): void {
            for ( let c in this._components ) {
                this._components[c].update( dt );
            }

            for ( let c in this._children ) {
                this._children[c].update( dt );
            }
        }

        public addChild( child: GameObject ): void {
            this._children.push( child );
        }

        public addComponent( component: IGameObjectComponent ): void {
            component.gameObject = this;
            this._components.push( component );
        }

        public getComponent( componentName: string ): IGameObjectComponent {
            for ( let c in this._components ) {
                if ( this._components[c].name == componentName ) {
                    return this._components[c];
                }
            }

            return undefined;
        }

        public initialize( components: ComponentDictionary ): void {
            for ( let c in this._components ) {
                this._components[c].initialize( components );
            }
            for ( let o in this._children ) {
                this._children[o].initialize( components );
            }
        }

        public preloading(): boolean {
            for ( let c in this._components ) {
                if ( this._components[c].preloading() ) {
                    return true;
                }
            }
            for ( let o in this._children ) {
                if ( this._children[o].preloading() ) {
                    return true;
                }
            }
            return false;
        }

        public load(): void {
            for ( let c in this._components ) {
                this._components[c].load();
                let comp = this._components[c];
                if ( isRenderable( comp ) ) {
                    this._container.addChild( comp.internalData );
                }
            }
            for ( let o in this._children ) {
                this._children[o].load();
            }
        }

        public unload(): void {
            for ( let c in this._components ) {
                let comp = this._components[c];
                if ( isRenderable( comp ) ) {
                    this._container.removeChild( comp.internalData );
                }
                comp.unload();
            }
            for ( let o in this._children ) {
                this._children[o].unload();
            }
        }

        public destroy(): void {
            for ( let c in this._components ) {
                this._components[c].destroy();
            }
            this._components.length = 0;

            for ( let o in this._children ) {
                this._children[o].destroy();
            }
            this._children.length = 0;
        }
    }

    export function isRenderable( object: any ): object is IRenderableComponent {
        const myInterface = object as IRenderableComponent;
        return myInterface.internalData !== undefined;
    }
}