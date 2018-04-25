module BullShift {

    export class TextComponentConfiguration implements IComponentConfig {

        public name: string;

        public text: string;

        public populateFromJson( jsonConfiguration: any ): void {
            if ( !jsonConfiguration.name ) {
                throw new Error( "TextComponentConfiguration json must contain a name!" );
            }
            this.name = jsonConfiguration.name;

            if ( jsonConfiguration.text ) {
                this.text = jsonConfiguration.text;
            }
        }

        public static create( name: string, text: string ): TextComponentConfiguration {
            let config = new TextComponentConfiguration();
            config.name = name;
            config.text = text;
            return config;
        }
    }

    /**
     * A component used for displaying text on the screen.
     */
    export class TextComponent extends BaseGameObjectComponent implements IRenderableComponent, IMessageHandler {

        private _text: string = "";
        private _textObj: PIXI.Text;

        public constructor( config: TextComponentConfiguration ) {
            super( config );

            this._text = config.text;
        }


        /**
         * Gets the internal display object data to be used by the underlying renderer.
         */
        public get internalData(): PIXI.DisplayObject {
            return this._textObj;
        }

        /**
         * Gets the x position.
         */
        public get x(): number {
            return this._textObj.x;
        }

        /**
         * Sets the x position.
         */
        public set x( value: number ) {
            this._textObj.x = value;
        }

        /**
         * Gets the y position.
         */
        public get y(): number {
            return this._textObj.y;
        }

        /**
         * Sets the y position.
         */
        public set y( value: number ) {
            this._textObj.y = value;
        }

        /**
         * Gets the width.
         */
        public get width(): number {
            return this._textObj.width;
        }

        /**
         * Gets the height.
         */
        public get height(): number {
            return this._textObj.height;
        }

        /**
         * Gets the text of this component.
         */
        public get text(): string {
            return this._text;
        }

        /**
         * Sets the text of this component.
         */
        public set text( value: string ) {
            this._text = value;
            if ( this._textObj !== undefined ) {
                this._textObj.text = this._text;
            }
        }

        public onMessage( message: Message ): void {
            if ( message.name === "SetText:" + this.name ) {
                this.text = message.context as string;
            }
        }

        /**
         * Initializes this component and links any depending components from those passed in.
         * @param components The components created from configuration.
         */
        public initialize( components: ComponentDictionary ): void {
            Message.subscribe( "SetText:" + this.name, this );
        }

        /**
         * Indicates whether or not this component is still preloading.
         */
        public preloading(): boolean {
            return false;
        }

        /**
         * Loads this component.
         */
        public load(): void {

            // TODO: Build from style in configuration.
            let style = new PIXI.TextStyle( {
                fontFamily: 'Arial',
                fontSize: 18,
                fill: '#ffffff',
                stroke: '#000000',
                strokeThickness: 2,
            } );

            this._textObj = new PIXI.Text( this.text, style );
        }

        /**
         * Unloads this component.
         */
        public unload(): void {
            Message.unsubscribe( "SetText:" + this.name, this );
        }

        /**
         * Destroys this component.
         */
        public destroy(): void {
            this._textObj.destroy();
        }

        /**
         * Updates this component.
         * @param dt The delta time since the last frame in milliseconds.
         */
        public update( dt: number ): void {
        }

        /**
         * Clones this component.
         */
        public clone(): SpriteComponent {
            return new SpriteComponent( this._config as SpriteComponentConfig );
        }


    }
}