module BullShift {

    /**
     * Represents an object which will handle incoming messages. This must be implemented in order to utilize messages.
     */
    export interface IMessageHandler {

        /**
         * The callback which is made when the message is recieved for this handler.
         */
        onMessage( message: Message ): void;
    }

    /**
     * Represents a message which gets sent via the messaging system.
     */
    export class Message {

        /**
         * The name of the message. This should match what the handler is subscribed to.
         */
        public name: string;

        /**
         * The object sending the message.
         */
        public sender: any;

        /**
         * Contextual data to be sent along with the message.
         */
        public context: any;

        /**
         * Creates a new message.
         * @param name The name of the message. This should match what the handler is subscribed to.
         * @param sender The object sending the message.
         * @param context Contextual data to be sent along with the message.
         */
        public constructor( name: string, sender: any, context?: any ) {
            this.name = name;
            this.sender = sender;
            this.context = context;
        }

        /**
         * Creates and immediately sends a message.
         * @param name The name of the message. This should match what the handler is subscribed to.
         * @param sender The object sending the message.
         * @param context Contextual data to be sent along with the message.
         */
        public static createAndSend( name: string, sender: any, context?: any ): void {
            new Message( name, sender, context ).send();
        }

        /**
         * Creates a subscription to the provided message name.
         * @param name The name of the message. This should match the name of a message being sent.
         * @param handler A handler to recieve the message.
         */
        public static subscribe( name: string, handler: IMessageHandler ): void {
            MessageBus.addSubscriber( name, handler );
        }

        /**
         * Removes a subscription from the provided message name.
         * @param name The name of the message to remove.
         * @param handler The handler to remove.
         */
        public static unsubscribe( name: string, handler: IMessageHandler ): void {
            MessageBus.removeSubscriber( name, handler );
        }

        /**
         * Sends this message.
         */
        public send(): void {
            MessageBus.post( this );
        }

        /**
         * Boradcasts this message.
         */
        public broadcast(): void {
            MessageBus.broadcast( this );
        }
    }

    /**
     * The messaging system. Messages are used to decouple components from one another, yet still communicate.
     */
    export class MessageBus {
        private static _inst: MessageBus;

        private _subscriptions: { [key: string]: IMessageHandler[] } = {};

        /**
         * Private constructor to enforce singleton pattern.
         */
        private constructor() {
            if ( MessageBus._inst ) {
                throw new Error( "Message bus already exists!" );
            }
        }

        /**
         * Sets up the messaging system.
         */
        public static initialize(): void {
            MessageBus._inst = new MessageBus();
        }

        /**
         * Adds a subscriber to the system.
         * @param name The name of the message to subscribe to.
         * @param handler The handler for the subscription.
         */
        public static addSubscriber( name: string, handler: IMessageHandler ): void {
            console.log( "Adding subscription for: " + name );
            if ( !MessageBus._inst._subscriptions[name] ) {
                MessageBus._inst._subscriptions[name] = [];
            }

            MessageBus._inst._subscriptions[name].push( handler );
        }

        /**
         * Removes a subscriber from the system.
         * @param name The name of the message to unsubscribe from.
         * @param handler The handler to unsubscribe.
         */
        public static removeSubscriber( name: string, handler: IMessageHandler ): void {
            console.log( "Removing subscription for: " + name );
            if ( !MessageBus._inst._subscriptions[name] ) {
                console.warn( "Subscription does not exist:" + name );
            }

            let index = MessageBus._inst._subscriptions[name].indexOf( handler );

            MessageBus._inst._subscriptions[name].splice( index, 1 );
        }

        /**
         * Posts a message to the system to be sent to subscribers.
         * @param message The message to be sent.
         */
        public static post( message: Message ): void {
            if ( MessageBus._inst._subscriptions[message.name] ) {
                for ( let s in MessageBus._inst._subscriptions[message.name] ) {
                    MessageBus._inst._subscriptions[message.name][s].onMessage( message );
                }
            } else {
                console.warn( "Nothing is subscribed to message named " + message.name );
            }
        }

        /**
         * Broadcasts message to every subscriber in the system.
         * @param message The message to be broadast.
         */
        public static broadcast( message: Message ): void {
            for ( let s in MessageBus._inst._subscriptions ) {
                let sub = MessageBus._inst._subscriptions[s];
                for ( let i = 0; i < sub.length; ++i ) {
                    sub[i].onMessage( message );
                }
            }
        }
    }
}