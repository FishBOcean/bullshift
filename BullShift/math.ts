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
}