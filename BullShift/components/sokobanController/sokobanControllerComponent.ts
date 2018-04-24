module BullShift {

    export class CrateConfig {
        public x: number;
        public y: number;
    }

    export class GoalConfig {
        public x: number;
        public y: number;
    }

    /**
     * Configuration for the sokoban controller.
     */
    export class SokobanControllerComponentConfig implements IComponentConfig {

        public name: string;
        public tileMap: string;
        public tileMapComponent: string;
        public playerSprite: string;
        public crateSprite: string;
        public goalSprite: string;
        public crates: CrateConfig[] = [];
        public goals: GoalConfig[] = [];

        public populateFromJson( jsonConfiguration: any ): void {

            if ( !jsonConfiguration.name ) {
                throw new Error( "SokobanControllerComponentConfig json must contain a name!" );
            }
            this.name = jsonConfiguration.name;

            if ( !jsonConfiguration.tileMap ) {
                throw new Error( "SokobanControllerComponentConfig json must contain a tileMap!" );
            }
            this.tileMap = jsonConfiguration.tileMap;

            if ( !jsonConfiguration.tileMapComponent ) {
                throw new Error( "SokobanControllerComponentConfig json must contain a tileMapComponent!" );
            }
            this.tileMapComponent = jsonConfiguration.tileMapComponent;

            // Player sprite
            if ( !jsonConfiguration.playerSprite ) {
                throw new Error( "SokobanControllerComponentConfig json must contain a playerSprite!" );
            }
            this.playerSprite = jsonConfiguration.playerSprite;

            // Crate sprite
            if ( !jsonConfiguration.crateSprite ) {
                throw new Error( "SokobanControllerComponentConfig json must contain a crateSprite!" );
            }
            this.crateSprite = jsonConfiguration.crateSprite;

            // Crates
            if ( !jsonConfiguration.crates ) {
                throw new Error( "SokobanControllerComponentConfig json must contain a crates!" );
            }
            for ( let c in jsonConfiguration.crates ) {
                this.crates.push( jsonConfiguration.crates[c] as CrateConfig );
            }

            // Goal sprite
            if ( !jsonConfiguration.goalSprite ) {
                throw new Error( "SokobanControllerComponentConfig json must contain a goalSprite!" );
            }
            this.goalSprite = jsonConfiguration.goalSprite;

            // Goals
            if ( !jsonConfiguration.goals ) {
                throw new Error( "SokobanControllerComponentConfig json must contain a goals!" );
            }
            for ( let g in jsonConfiguration.goals ) {
                this.goals.push( jsonConfiguration.goals[g] as GoalConfig );
            }
        }
    }

    export enum PlayerMoveDirection {
        NONE,
        UP,
        DOWN,
        LEFT,
        RIGHT
    }

    /**
     * A custom controller component for this game.
     */
    export class SokobanControllerComponent extends BaseGameObjectComponent implements IMessageHandler {

        private _components: ComponentDictionary;
        private _player: GameObject;
        private _tileMapComponentName: string;
        private _tileMapObjectName: string;
        private _playerSpriteComponentName: string;
        private _crateSpriteName: string;
        private _goalSpriteName: string;

        private _tileMap: TileMapComponent;
        private _moveDirection: PlayerMoveDirection = PlayerMoveDirection.NONE;
        private _amountMoved: number = 0;
        private _moveSpeed: number = 4;
        private _currentTileIndices: Vector2 = new Vector2();

        private _crates: Crate[] = [];
        private _goals: Goal[] = [];

        private _cleared: boolean = false;
        private _moves: number = 0;

        /**
         * The name of this controller.
         */
        public name: string;

        /**
         * The game object this component is attached to.
         */
        public gameObject: GameObject;

        /**
         * Creates a new instance of this controller.
         * @param config
         */
        public constructor( config: SokobanControllerComponentConfig ) {
            super( config );

            this._tileMapComponentName = config.tileMapComponent;
            this._tileMapObjectName = config.tileMap;
            this._playerSpriteComponentName = config.playerSprite;
            this._crateSpriteName = config.crateSprite;
            this._goalSpriteName = config.goalSprite;
        }

        /**
         * Initializes and links this component.
         * @param components
         */
        public initialize( components: ComponentDictionary ): void {
            this._components = components;

            this._player = new GameObject( "player" );

            Message.subscribe( SystemMessageName.LEVEL_READY, this );
            Message.subscribe( "Player:moveLeft", this );
            Message.subscribe( "Player:moveRight", this );
            Message.subscribe( "Player:moveUp", this );
            Message.subscribe( "Player:moveDown", this );

            Message.subscribe( "Key:" + KeyCode[KeyCode.W].toString(), this );
            Message.subscribe( "Key:" + KeyCode[KeyCode.A].toString(), this );
            Message.subscribe( "Key:" + KeyCode[KeyCode.S].toString(), this );
            Message.subscribe( "Key:" + KeyCode[KeyCode.D].toString(), this );
            Message.subscribe( "Key:" + KeyCode[KeyCode.UP].toString(), this );
            Message.subscribe( "Key:" + KeyCode[KeyCode.LEFT].toString(), this );
            Message.subscribe( "Key:" + KeyCode[KeyCode.DOWN].toString(), this );
            Message.subscribe( "Key:" + KeyCode[KeyCode.RIGHT].toString(), this );

        }

        public preloading(): boolean {

            // This component doesn't load any assets directly, so immediately return false here.
            return false;
        }

        public load(): void {
        }

        public unload(): void {
            Message.unsubscribe( SystemMessageName.LEVEL_READY, this );
            Message.unsubscribe( "Player:moveLeft", this );
            Message.unsubscribe( "Player:moveRight", this );
            Message.unsubscribe( "Player:moveUp", this );
            Message.unsubscribe( "Player:moveDown", this );
            Message.unsubscribe( "Key:" + KeyCode[KeyCode.W].toString(), this );
            Message.unsubscribe( "Key:" + KeyCode[KeyCode.A].toString(), this );
            Message.unsubscribe( "Key:" + KeyCode[KeyCode.S].toString(), this );
            Message.unsubscribe( "Key:" + KeyCode[KeyCode.D].toString(), this );
            Message.unsubscribe( "Key:" + KeyCode[KeyCode.UP].toString(), this );
            Message.unsubscribe( "Key:" + KeyCode[KeyCode.LEFT].toString(), this );
            Message.unsubscribe( "Key:" + KeyCode[KeyCode.DOWN].toString(), this );
            Message.unsubscribe( "Key:" + KeyCode[KeyCode.RIGHT].toString(), this );
        }

        public destroy(): void {
            this._player.destroy();
        }

        public update( dt: number ): void {
            this._player.update( dt );

            if ( this._moveDirection !== PlayerMoveDirection.NONE ) {
                this._amountMoved += this._moveSpeed;
            }

            switch ( this._moveDirection ) {
                case PlayerMoveDirection.LEFT:
                    this._player.x -= this._moveSpeed;
                    break;
                case PlayerMoveDirection.RIGHT:
                    this._player.x += this._moveSpeed;
                    break;
                case PlayerMoveDirection.UP:
                    this._player.y -= this._moveSpeed;
                    break
                case PlayerMoveDirection.DOWN:
                    this._player.y += this._moveSpeed;
                    break;
            }

            if ( this._amountMoved >= Game.TILE_SIZE ) {

                // Update the current tile index.
                switch ( this._moveDirection ) {
                    case PlayerMoveDirection.LEFT:
                        this._currentTileIndices.x--;
                        break;
                    case PlayerMoveDirection.RIGHT:
                        this._currentTileIndices.x++;
                        break;
                    case PlayerMoveDirection.UP:
                        this._currentTileIndices.y--;
                        break
                    case PlayerMoveDirection.DOWN:
                        this._currentTileIndices.y++;
                        break;
                }

                this._moveDirection = PlayerMoveDirection.NONE;
                this._amountMoved = 0;
            }
        }

        public onMessage( message: Message ): void {

            // Do not accept any more messages if the level has been cleared.
            if ( this._cleared ) {
                return;
            }

            if ( message.name === SystemMessageName.LEVEL_READY ) {
                this.spawnComponents();
            } else {

                // Note: This is a kinda crappy way to handle this, but the most straightforward for now given the time left.
                // TODO: Refactor this into keybindings later.
                switch ( message.name ) {
                    case "Key:" + KeyCode[KeyCode.A].toString():
                    case "Key:" + KeyCode[KeyCode.LEFT].toString():
                        if ( ( message.context as Key ).isDown ) {
                            Message.createAndSend( "Player:moveLeft", this );
                        }
                        return;
                    case "Key:" + KeyCode[KeyCode.D].toString():
                    case "Key:" + KeyCode[KeyCode.RIGHT].toString():
                        if ( ( message.context as Key ).isDown ) {
                            Message.createAndSend( "Player:moveRight", this );
                        }
                        return;
                    case "Key:" + KeyCode[KeyCode.W].toString():
                    case "Key:" + KeyCode[KeyCode.UP].toString():
                        if ( ( message.context as Key ).isDown ) {
                            Message.createAndSend( "Player:moveUp", this );
                        }
                        return;
                    case "Key:" + KeyCode[KeyCode.S].toString():
                    case "Key:" + KeyCode[KeyCode.DOWN].toString():
                        if ( ( message.context as Key ).isDown ) {
                            Message.createAndSend( "Player:moveDown", this );
                        }
                        return;
                }

                // Only move if we are not currently moving.
                if ( this._moveDirection === PlayerMoveDirection.NONE ) {

                    let checkDirection = PlayerMoveDirection.NONE;
                    switch ( message.name ) {
                        case "Player:moveLeft":
                            checkDirection = PlayerMoveDirection.LEFT;
                            break;
                        case "Player:moveRight":
                            checkDirection = PlayerMoveDirection.RIGHT;
                            break;
                        case "Player:moveUp":
                            checkDirection = PlayerMoveDirection.UP;
                            break
                        case "Player:moveDown":
                            checkDirection = PlayerMoveDirection.DOWN;
                            break;
                    }

                    if ( checkDirection !== PlayerMoveDirection.NONE && this.checkIntendedMove( checkDirection ) === true ) {
                        this._moveDirection = checkDirection;
                    }
                }
            }
        }
        public clone(): IGameObjectComponent {
            return new SokobanControllerComponent( this._config as SokobanControllerComponentConfig );
        }

        private checkIntendedMove( intendedDirection: PlayerMoveDirection ): boolean {

            if ( intendedDirection === PlayerMoveDirection.NONE ) {
                throw new Error( "Cannot check an intended move with no direction!" );
            }

            // Get tiles for all layers in the intended move spot. If it is a wall on *any* level, boot out.
            let intendedCoords = this._currentTileIndices.clone();
            let intendedCoords2Out = this._currentTileIndices.clone();
            switch ( intendedDirection ) {
                default:
                case PlayerMoveDirection.LEFT:
                    intendedCoords.x--;
                    intendedCoords2Out.x -= 2;
                    break;
                case PlayerMoveDirection.RIGHT:
                    intendedCoords.x++;
                    intendedCoords2Out.x += 2;
                    break;
                case PlayerMoveDirection.UP:
                    intendedCoords.y--;
                    intendedCoords2Out.y -= 2;
                    break
                case PlayerMoveDirection.DOWN:
                    intendedCoords.y++;
                    intendedCoords2Out.y += 2;
                    break;
            }

            let tiles = this._tileMap.getTilesAt( intendedCoords.x, intendedCoords.y );
            for ( let t in tiles ) {
                if ( tiles[t].tileType === TileType.WALL ) {
                    return false;
                }
            }

            // Check if there is a crate in the next tile. 
            for ( let c in this._crates ) {
                let crate = this._crates[c];
                if ( crate.tileIndices.equals( intendedCoords ) ) {

                    // Check the crates first
                    for ( let c2 in this._crates ) {
                        if ( this._crates[c2].tileIndices.equals( intendedCoords2Out ) ) {
                            console.log( "crate found! cancelling" );
                            return false;
                        }
                    }

                    // Check for a wall.
                    let tiles2Out = this._tileMap.getTilesAt( intendedCoords2Out.x, intendedCoords2Out.y );
                    for ( let t in tiles2Out ) {
                        if ( tiles2Out[t].tileType === TileType.WALL ) {
                            console.log( "wall found! cancelling" );
                            return false;
                        }
                    }

                    // If we get here, all tests passed. Move the crate along with the player.
                    crate.moveToTilePosition( intendedCoords2Out.x, intendedCoords2Out.y );


                    // TODO: The tile then should check if it is over a goal space. If so, it should notify this controller
                    // that a required tile has been placed on a goal.
                    crate.isOnGoal = false;
                    for ( let g in this._goals ) {
                        if ( crate.tileIndices.equals( this._goals[g].tileIndices ) ) {
                            crate.isOnGoal = true;
                            this.verifyGoalRequirements();
                            break;
                        }
                    }

                }
            }

            // If we get here, a move of some kind occurred. Send a message about this.
            this._moves++;
            Message.createAndSend( "PLAYER_MOVED", this, this._moves );

            return true;
        }

        private spawnComponents(): void {

            let config = this._config as SokobanControllerComponentConfig;

            // Save off a reference to the tile map.
            this._tileMap = Game.getActiveLevel().getObject( this._tileMapObjectName ).getComponent( this._tileMapComponentName ) as TileMapComponent;

            let spawnPos = this._tileMap.tileStartPosition;

            this._currentTileIndices = this._tileMap.tileStartIndices;
            this._player.x = spawnPos.x;
            this._player.y = spawnPos.y;

            this._player.addComponent( this._components[this._playerSpriteComponentName].clone() );


            // Initialize, spawn and load the new player object.
            this._player.initialize( this._components );

            Game.getActiveLevel().addObject( this._player );

            this._player.load();

            // Initialize, spawn and load crates.
            for ( let i = 0; i < config.crates.length; ++i ) {
                this._crates.push( new Crate( config.crates[i].x, config.crates[i].y, i, config.crateSprite ) );
            }

            for ( let c in this._crates ) {
                let crate = this._crates[c];
                crate.x = Game.TILE_SIZE * crate.tileIndices.x;
                crate.y = Game.TILE_SIZE * crate.tileIndices.y;
                crate.initialize( this._components );
                Game.getActiveLevel().addObject( crate );
                crate.load();
            }

            // Initialize, spawn and load goals.
            for ( let i = 0; i < config.goals.length; ++i ) {
                this._goals.push( new Goal( config.goals[i].x, config.goals[i].y, i, config.goalSprite ) );
            }

            for ( let g in this._goals ) {
                let goal = this._goals[g];
                goal.x = Game.TILE_SIZE * goal.tileIndices.x;
                goal.y = Game.TILE_SIZE * goal.tileIndices.y;
                goal.initialize( this._components );
                Game.getActiveLevel().addObject( goal );
                goal.load();
            }

            // Verify that the number of crates equals the number of goals
            if ( this._crates.length !== this._goals.length ) {
                throw new Error( "Invalid level configuration: Number of crates must equal number of goals." );
            }
        }

        private verifyGoalRequirements(): void {
            let onGoalCount = 0;
            for ( let c in this._crates ) {
                if ( this._crates[c].isOnGoal ) {
                    onGoalCount++;
                }
            }

            if ( onGoalCount == this._goals.length ) {
                this._cleared = true;
                Message.createAndSend( "LEVEL_CLEARED", this );
            }
        }
    }
}