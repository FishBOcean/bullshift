﻿/// <reference path="../basegameobjectcomponent.ts" />

module BullShift {

    export class MoveComponentMessageConfig {
        public name: string;
        public axis: string;
        public amount: number;

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

    export class MoveComponentConfig implements IComponentConfig {
        public name;

        public messages: MoveComponentMessageConfig[] = [];

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

    export class MoveComponent extends BaseGameObjectComponent {

        private _subscribedMessages: MoveComponentMessageConfig[] = [];

        public constructor( config: MoveComponentConfig ) {
            super( config );
        }

        public preloading(): boolean {
            return false;
        }

        public load(): void {

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

        public update( dt: number ): void {
        }

        public clone(): MoveComponent {
            return new MoveComponent( this._config as MoveComponentConfig );
        }

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