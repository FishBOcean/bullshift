
module BullShift {

    /**
     * Represents a level in a game. Only one of these may be loaded at a time.
     */
    export class Level {

        private _jsonAsset: string;
        private _lookup: string;
        private _preloadingDone: boolean = false;
        private _configuration: any;
        private _scene: Scene;
        private _application: PIXI.Application;
        private _components: ComponentDictionary = {};

        /**
         * The name of this level.
         */
        public name: string;

        /**
         * Creates a new level.
         * @param application The application handle.
         * @param name The name of this level.
         * @param jsonAssetPath The JSON configuration path for this level.
         */
        public constructor( application: PIXI.Application, name: string, jsonAssetPath: string ) {
            this.name = name;
            this._application = application;
            this._jsonAsset = jsonAssetPath;
            this._lookup = name + "_levelFile"

            this._scene = new Scene( this._application, this.name + "_scene" );

            let loader = new PIXI.loaders.Loader();
            loader.add( this._lookup, this._jsonAsset );
            loader.load( this.onConfigLoaded.bind( this ) );
        }

        /**
         * Indicates if the configuration file is still being loaded.
         */
        public get configPreloading(): boolean {
            return !this._preloadingDone;
        }

        /**
         * Indicates if this level is preloading. Returns true if any object or component contained is still preloading.
         * @returns True if any game object or component is loading; otherwise, false.
         */
        public get preloading(): boolean {
            return this._scene.preloading();
        }

        /**
         * Indicates whether this level is active.
         */
        public get isActive(): boolean {
            return this._scene.isActive;
        }
        
        /**
         * Initializes this level. This in turn loads up components from configuration and calls
         * initialization routines all the way down the line.
         */
        public initialize(): void {
            this._components = ComponentManager.getComponentsFromConfiguration( this._configuration );

            if ( this._configuration.scene && this._configuration.scene.objects ) {
                let configSection = this._configuration.scene.objects;
                this.createObjects( configSection, undefined );
            }

            this._scene.initialize( this._components );
        }

        /**
         * Loads this level.
         */
        public load(): void {
            if ( !this._preloadingDone ) {
                throw new Error( "Level load called before preload finished!" );
            }
            this._scene.load();
        }

        /**
         * Unloads this level.
         */
        public unload(): void {
            this._scene.unload();
        }

        /**
         * Activates this level.
         */
        public activate(): void {
            this._scene.activate();
        }

        /**
         * Deactivates this level. Objects contained within will not receive messages while inactive.
         */
        public deactivate(): void {
            this._scene.deactivate();
        }

        /**
         * Updates this level.
         * @param dt The delta time since the last frame in milliseconds.
         */
        public update( dt: number ): void {
            this._scene.update( dt );
        }

        public addObject( object: GameObject ): void {
            this._scene.addObject( object );
        }

        private createObjects( configSection: any, parentObject: GameObject ): void {
            for ( let o in configSection ) {
                let objConfig = configSection[o];

                if ( !objConfig.name ) {
                    throw new Error( "All game objects must have a name." );
                }

                let obj = new GameObject( objConfig.name );
                console.info( "Object:", obj );
                // TODO: Check if a game object with that name already exists.

                // TODO: pass config to game object and let it parse the config.
                if ( objConfig.x ) {
                    obj.x = objConfig.x;
                }
                if ( objConfig.y ) {
                    obj.y = objConfig.y;
                }

                if ( objConfig.visible !== undefined ) {
                    obj.visible = objConfig.visible;
                }


                // Link components.
                if ( objConfig.components ) {
                    for ( let c in objConfig.components ) {
                        let componentName = objConfig.components[c];
                        if ( !this._components[componentName] ) {
                            throw new Error( "Component not found during linking: " + componentName );
                        }
                        obj.addComponent( this._components[componentName].clone() );
                    }
                }

                // Child game objects if there are any.
                if ( objConfig.children ) {
                    this.createObjects( objConfig.children, obj );
                }

                // If in a child, make sure to parent it. Otherwise, add it directly to the scene.
                if ( parentObject ) {
                    parentObject.addChild( obj );
                } else {
                    this._scene.addObject( obj );
                }
            }
        }

        private onConfigLoaded( loader: PIXI.loaders.Loader, resources: any ): void {
            if ( resources[this._lookup].error ) {
                console.error( "Error loading level config:", resources[this._lookup].error );
            }
            console.info( "data:", resources[this._lookup].data );
            this._preloadingDone = true;
            this._configuration = resources[this._lookup].data;
        }
    }
}