/// <reference path="../basegameobjectcomponent.ts" />

module BullShift {

    /**
     * Represents configuration for a spawn component.
     */
    export class SpawnComponentConfig implements IComponentConfig {

        /**
         * The name of this component.
         */
        public name;

        /**
         * The message that triggers the spawn.
         */
        public triggerMessage: string;

        /**
         * The name of the object to spawn.
         */
        public objectName: string;

        /**
         * The x component of the spawn position.
         */
        public spawnPositionX: number;

        /**
         * The y component of the spawn position.
         */
        public spawnPositionY: number;

        /**
         * Components to be added to the object
         */
        public components: string[];

        /**
         * Populates the values in this configuration with those from the provided JSON.
         * @param jsonConfiguration The JSON configuration object.
         */
        public populateFromJson( jsonConfiguration: any ): void {
            if ( !jsonConfiguration.name ) {
                throw new Error( "SpawnComponentConfig json must contain a name!" );
            }
            this.name = jsonConfiguration.name;

            if ( !jsonConfiguration.triggerMessage ) {
                throw new Error( "SpawnComponentConfig requires triggerMessage to be set" );
            }
            this.triggerMessage = jsonConfiguration.triggerMessage;

            if ( !jsonConfiguration.objectName ) {
                throw new Error( "SpawnComponentConfig requires objectName to be set" );
            }
            this.objectName = jsonConfiguration.objectName;

            if ( jsonConfiguration.spawnPositionX === undefined ) {
                throw new Error( "SpawnComponentConfig requires spawnPositionX to be set" );
            }
            this.spawnPositionX = jsonConfiguration.spawnPositionX;

            if ( jsonConfiguration.spawnPositionY === undefined ) {
                throw new Error( "SpawnComponentConfig requires spawnPositionY to be set" );
            }
            this.spawnPositionY = jsonConfiguration.spawnPositionY;

            if ( !jsonConfiguration.components ) {
                throw new Error( "SpawnComponentConfig requires components to be set" );
            }
            this.components = jsonConfiguration.components;
        }
    }

    /**
     * A component which handles spawning of a game object on a trigger.
     */
    export class SpawnComponent extends BaseGameObjectComponent {

        private _triggerMessage: string;
        private _objectName: string;
        private _spawnPositionX: number;
        private _spawnPositionY: number;
        private _componentNames: string[];
        private _components: ComponentDictionary;

        /**
         * Creates a new spawn component.
         * @param config The component configuration.
         */
        public constructor( config: SpawnComponentConfig ) {
            super( config );

            this._triggerMessage = config.triggerMessage;
            this._objectName = config.objectName;
            this._spawnPositionX = config.spawnPositionX;
            this._spawnPositionY = config.spawnPositionY;
            this._componentNames = config.components;

            console.log( "Created: " + this.name );
        }

        /**
         * Initializes and links this components to other components it needs.
         * @param components The listing of all components created from configuration.
         */
        public initialize( components: ComponentDictionary ): void {
            console.log( "initialize: " ) + this.name;
            this._components = components;
            Message.subscribe( this._triggerMessage, this );
            console.info( "Subscribed to: " + this._triggerMessage );
        }

        /**
         * Indicates whether this component is preloading.
         */
        public preloading(): boolean {

            // This component doesn't load any assets, so immediately return false here.
            return false;
        }

        /**
         * Loads this component.
         */
        public load(): void {
        }

        /**
         * Unloads this component.
         */
        public unload(): void {
            Message.unsubscribe( this._triggerMessage, this );
        }

        /**
         * Destroys this component.
         */
        public destroy(): void {
        }

        /**
         * Updates this component.
         * @param dt The delta time in milliseconds since the last frame.
         */
        public update( dt: number ): void {
        }

        /**
         * Clones this component.
         */
        public clone(): SpawnComponent {
            return new SpawnComponent( this._config as SpawnComponentConfig );
        }

        /**
         * The message handler for this component, called when a subscribed message is sent.
         * @param message The message being handled.
         */
        public onMessage( message: Message ): void {
            if ( !this.gameObject ) {
                console.warn( "Trying to process a message on a Spawn which has no attached game object." );
                return;
            }

            if ( message.name === this._triggerMessage ) {
                this.spawn();
            }
        }

        private spawn(): void {
            let obj: GameObject = new GameObject( this._objectName );
            obj.x = this._spawnPositionX;
            obj.y = this._spawnPositionY;

            for ( let c in this._componentNames ) {
                let comp = this._componentNames[c];
                if ( !this._components[comp] ) {
                    throw new Error( "Unable to link required component: " + comp );
                }

                obj.addComponent( this._components[comp].clone() );
            }

            obj.initialize( this._components );

            Game.getActiveLevel().addObject( obj );

            obj.load();
        }
    }
}