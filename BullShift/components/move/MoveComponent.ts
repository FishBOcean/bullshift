/// <reference path="../basegameobjectcomponent.ts" />

module BullShift {

    /**
     * Configures what to do when a message is recieved relative to a move component.
     */
    export class MoveComponentMessageConfig {

        /**
         * The name of this configuration.
         */
        public name: string;

        /**
         * The axis to move along (should be either "x" or "y").
         */
        public axis: string;

        /**
         * The amount to move by.
         */
        public amount: number;

        /**
         * Creates a new move component message configuration.
         * @param name The name of this configuration.
         * @param axis The axis to move along.
         * @param amount The amount to move by.
         */
        public constructor( name: string, axis: string, amount: number ) {
            this.name = name;
            this.axis = axis;
            if ( this.axis !== "x" && this.axis !== "y" && this.axis !== "X" && this.axis !== "Y" ) {
                throw new Error( "Move component message axis must be either x or y." );
            }
            if ( this.axis === "X" ) {
                this.axis = "x";
            }
            if ( this.axis === "Y" ) {
                this.axis = "y";
            }
            this.amount = amount;
        }
    }

    /**
     * Represents configuration for a move component.
     */
    export class MoveComponentConfig implements IComponentConfig {

        /**
         * The name of this component.
         */
        public name;

        /**
         * The messages this component should subscribe to and what to do when one of them is sent.
         */
        public messages: MoveComponentMessageConfig[] = [];

        /**
         * Populates the values in this configuration with those from the provided JSON.
         * @param jsonConfiguration The JSON configuration object.
         */
        public populateFromJson( jsonConfiguration: any ): void {
            if ( !jsonConfiguration.name ) {
                throw new Error( "SpriteComponentConfig json must contain a name!" );
            }
            this.name = jsonConfiguration.name;

            if ( !jsonConfiguration.messages ) {
                throw new Error( "MoveComponentConfig requires messages to be set" );
            }

            for ( let m in jsonConfiguration.messages ) {
                let cfg = jsonConfiguration.messages[m];
                let mcmc = new MoveComponentMessageConfig( cfg.name as string, cfg.axis as string, cfg.amount as number );
                this.messages.push( mcmc );
            }
        }
    }

    /**
     * A component which handles movement along a provided axis when a message is recieved.
     */
    export class MoveComponent extends BaseGameObjectComponent {

        private _subscribedMessages: MoveComponentMessageConfig[] = [];

        /**
         * Creates a new move component.
         * @param config The component configuration.
         */
        public constructor( config: MoveComponentConfig ) {
            super( config );
        }

        /**
         * Initializes and links this components to other components it needs.
         * @param components The listing of all components created from configuration.
         */
        public initialize( components: ComponentDictionary ): void {

            // Subscribe to messages here instead of the constructor because only components which are
            // actually loaded should be subscribed. Otherwise, template instances of components will
            // be registered for messages which in this component will cause errors to be thrown.
            let messageConfigs = ( this._config as MoveComponentConfig ).messages;
            for ( let m in messageConfigs ) {
                let mcfg = messageConfigs[m];
                this._subscribedMessages.push( mcfg );
                Message.subscribe( mcfg.name, this );
            }
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
        public clone(): MoveComponent {
            return new MoveComponent( this._config as MoveComponentConfig );
        }

        /**
         * The message handler for this component, called when a subscribed message is sent.
         * @param message The message being handled.
         */
        public onMessage( message: Message ): void {
            if ( !this.gameObject ) {
                console.warn( "Trying to process a message on a MoveComponent which has no attached game object." );
                return;
            }

            let matches = this._subscribedMessages.filter( x => x.name == message.name );
            if ( matches.length > 0 ) {
                let msgCfg = matches[0];
                switch ( msgCfg.axis ) {
                    case "x":
                        this.gameObject.x += msgCfg.amount;
                        break;
                    case "y":
                        this.gameObject.y += msgCfg.amount;
                        break;
                }
            }
        }
    }
}