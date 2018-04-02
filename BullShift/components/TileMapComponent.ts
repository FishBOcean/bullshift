
module BullShift {

    export class TileMapComponent implements IRenderableComponent {

        private _assetPath: string;
        private _container: PIXI.Container;
        private _tileSize: number;
        private _tilesWide: number;
        private _tilesHigh: number;

        private _tiles: SpriteComponent[] = [];

        public name: string;
        public gameObject: GameObject;

        public constructor( name: string, assetPath: string ) {
            this.name = name;
            this._assetPath = assetPath;
        }

        public get internalData(): PIXI.DisplayObject {
            return this._container;
        }

        public get x(): number {
            return this._container.x;
        }

        public set x( value: number ) {
            this._container.x = value;
        }

        public get y(): number {
            return this._container.y;
        }

        public set y( value: number ) {
            this._container.y = value;
        }

        public get width(): number {
            return this._tileSize * this._tilesWide;
        }

        public get height(): number {
            return this._tileSize * this._tilesHigh;
        }

        public load(): void {
            //this._sprite = PIXI.Sprite.fromImage( this._assetPath );
        }

        public update( dt: number ): void {
        }

        public clone(): TileMapComponent {
            return new TileMapComponent( this.name, this._assetPath );
        }
    }
}