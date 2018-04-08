
module BullShift {

    /**
     * A base class from which all components should inherit. Provides basic configuration 
     * properties and assignments.
     */
    export abstract class BaseGameObjectComponent implements IGameObjectComponent {

        /**
         * The name of this component.
         */
        public name: string;

        /**
         * The game object to which this component belongs.
         */
        public gameObject: GameObject;

        /**
         * The configuration loaded from the constructor.
         */
        protected _config: IComponentConfig;

        /**
         * Creates a new component from the provided configuration.
         * @param config The configuration to use while creating this component.
         */
        public constructor( config: IComponentConfig ) {
            this.name = config.name;
            this._config = config;
        }

        /**
         * Initializes this component and links the provided components if needed.
         * @param components A collection of components created by the factories.
         */
        public abstract initialize( components: ComponentDictionary ): void;

        /**
         * Indicates if this component is pre-loading.
         */
        public abstract preloading(): boolean;

        /**
         * Loads this component.
         */
        public abstract load(): void;

        /**
         * Unloads this component.
         */
        public abstract unload(): void;

        /**
         * Updates this component.
         * @param dt The delta time since the last frmae in milliseconds.
         */
        public abstract update( dt: number ): void;

        /**
         * Clones this component.
         */
        public abstract clone(): IGameObjectComponent;
    }
}