/// <reference path="../../gameobject.ts" />

module BullShift {

    export class Crate extends GameObject {

        private _currentTileIndices: Vector2 = new Vector2();
        private _spriteName: string;
        private _amountMoved: number = 0;
        private _moveSpeed: number = 4;
        private _direction: PlayerMoveDirection = PlayerMoveDirection.NONE;

        public isOnGoal: boolean = false;

        public constructor( xIndex: number, yIndex: number, index: number, spriteName: string ) {
            super( "crate_obj" + index );

            this._currentTileIndices.x = xIndex;
            this._currentTileIndices.y = yIndex;
            this._spriteName = spriteName;
        }

        public get tileIndices(): Vector2 {
            return this._currentTileIndices;
        }

        public initialize( components: ComponentDictionary ): void {
            this.addComponent( components[this._spriteName].clone() );

            super.initialize( components );
        }

        public update( dt: number ): void {
            if ( this._direction !== PlayerMoveDirection.NONE ) {
                switch ( this._direction ) {
                    case PlayerMoveDirection.LEFT:
                        this.x -= this._moveSpeed;
                        break;
                    case PlayerMoveDirection.RIGHT:
                        this.x += this._moveSpeed;
                        break;
                    case PlayerMoveDirection.UP:
                        this.y -= this._moveSpeed;
                        break
                    case PlayerMoveDirection.DOWN:
                        this.y += this._moveSpeed;
                        break;
                }

                this._amountMoved += this._moveSpeed;

                if ( this._amountMoved >= Game.TILE_SIZE ) {

                    this._direction = PlayerMoveDirection.NONE;
                    this._amountMoved = 0;
                }
            }

            super.update( dt );
        }

        public moveToTilePosition( x: number, y: number ): void {
            console.log("move")
            let intendedDirection = PlayerMoveDirection.NONE;
            if ( x !== this._currentTileIndices.x ) {

                if ( x - this._currentTileIndices.x < 0 ) {
                    intendedDirection = PlayerMoveDirection.LEFT;
                } else {
                    intendedDirection = PlayerMoveDirection.RIGHT;
                }
            }

            if ( y !== this._currentTileIndices.y ) {

                if ( y - this._currentTileIndices.y < 0 ) {
                    intendedDirection = PlayerMoveDirection.UP;
                } else {
                    intendedDirection = PlayerMoveDirection.DOWN;
                }
            }

            if ( intendedDirection !== PlayerMoveDirection.NONE ) {
                this._direction = intendedDirection;
                this._currentTileIndices.x = x;
                this._currentTileIndices.y = y;
            }
        }
    }
}