/// <reference path="../../gameobject.ts" />

module BullShift {

    export class Goal extends GameObject {

        private _tileIndices: Vector2 = new Vector2();
        private _spriteName: string;

        public constructor( xIndex: number, yIndex: number, index: number, spriteName: string ) {
            super( "goal_obj" + index );

            this._tileIndices.x = xIndex;
            this._tileIndices.y = yIndex;
            this._spriteName = spriteName;
        }

        public get tileIndices(): Vector2 {
            return this._tileIndices;
        }

        public initialize( components: ComponentDictionary ): void {
            this.addComponent( components[this._spriteName].clone() );

            super.initialize( components );
        }

        public update( dt: number ): void {
            // TODO: animate opacity

            super.update( dt );
        }
    }
}