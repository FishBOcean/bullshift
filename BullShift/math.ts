module BullShift {

    export class BSMath {

        public static intDivide( a: number, b: number ): number {

            let result = a / b;
            if ( result >= 0 ) {
                return Math.floor( result );
            } else {
                return Math.ceil( result );
            }
        }
    }
}