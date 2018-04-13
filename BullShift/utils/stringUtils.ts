
module BullShift {

    export class StringUtils {
        public static getFileExtension( filePath: string ): string {
            let baseName = StringUtils.getFullFileName( filePath );
            let pos = baseName.lastIndexOf( "." );

            if ( baseName === "" || pos < 1 ) {
                return "";
            }

            return baseName.slice( pos + 1 );
        }

        public static getFullFileName( filePath: string ): string {
            return filePath.split( /[\\/]/ ).pop();            
        }

        public static getPaddedNumberString( n: number, padAmount: number ): string {
            let str = "" + n;
            let pad = "";
            for ( let i = 0; i < padAmount; ++i ) {
                pad += "0";
            }

            return pad.substring( 0, pad.length - str.length ) + str;
        }
    }
}