module BullShift {

    /**
     * BullShift Math utility class.
     */
    export class BSMath {

        /**
         * Forces an integer division of of the provided numbers.
         * @param a The dividend.
         * @param b The divisor.
         * @returns An integer representation of a/b.
         */
        public static intDivide( a: number, b: number ): number {

            let result = a / b;
            if ( result >= 0 ) {
                return Math.floor( result );
            } else {
                return Math.ceil( result );
            }
        }
    }

    export class Vector2 {
        public x: number = 0;
        public y: number = 0;

        public clone(): Vector2 {
            let v = new Vector2();
            v.x = this.x;
            v.y = this.y;
            return v;
        }

        public equals( v: Vector2 ): boolean {
            return ( v.x === this.x && v.y === this.y );
        }
    }

    export class Vector3 {
        public x: number = 0;
        public y: number = 0;
        public z: number = 0;

        public clone(): Vector3 {
            let v = new Vector3();
            v.x = this.x;
            v.y = this.y;
            v.z = this.z;
            return v;
        }

        public equals( v: Vector3 ): boolean {
            return ( v.x === this.x && v.y === this.y && v.z === this.z );
        }
    }

    export class Vector4 {
        public x: number = 0;
        public y: number = 0;
        public z: number = 0;
        public w: number = 0;

        public clone(): Vector4 {
            let v = new Vector4();
            v.x = this.x;
            v.y = this.y;
            v.z = this.z;
            v.w = this.w;
            return v;
        }

        public equals( v: Vector4 ): boolean {
            return ( v.x === this.x && v.y === this.y && v.z === this.z && v.w === this.w );
        }
    }
}