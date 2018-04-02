module BullShift {


    export interface IMessageHandler {
        onMessage( message: Message ): void;
    }

    export class Message {
        public name: string;
        public sender: any;
        public context: any;

        public constructor( name: string, sender: any, context?: any ) {
            this.name = name;
            this.sender = sender;6
            this.context = context;
        }

        public static createAndSend( name: string, sender: any, context?: any ): void {
            new Message( name, sender, context ).send();
        }

        public static subscribe( name: string, handler: IMessageHandler ): void {
            MessageBus.addSubscriber( name, handler );
        }

        public send(): void {
            MessageBus.post( this );
        }
    }

    export class MessageBus {
        private static _inst: MessageBus;

        private _subscriptions: { [key: string]: IMessageHandler[] } = {};

        private constructor() {
            if ( MessageBus._inst ) {
                throw new Error( "Message bus already exists!" );
            }
        }

        public static initialize(): void {
            MessageBus._inst = new MessageBus();
        }

        public static addSubscriber( name: string, handler: IMessageHandler ) {
            console.log( "Adding subscription for: " + name );
            if ( !MessageBus._inst._subscriptions[name] ) {
                MessageBus._inst._subscriptions[name] = [];
            }

            MessageBus._inst._subscriptions[name].push( handler );
        }

        public static post( message: Message ) {
            if ( MessageBus._inst._subscriptions[message.name] ) {
                for ( let s in MessageBus._inst._subscriptions[message.name] ) {
                    MessageBus._inst._subscriptions[message.name][s].onMessage( message );
                }
            } else {
                console.warn( "Nothing is subscribed to message named " + message.name );
            }
        }
    }
}