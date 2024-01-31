export interface ILogger {
    /**
     * Log a message to the console (stdout)
     * @param {...*} args
     */
    log(...args: any[]): void;
    /**
     * Log a message to the console (stderr)
     * @param {...*} args
     */
    error(...args: any[]): void;
}

export class Logger implements ILogger {

    log(...args: any[]): void {
        console.log(...args);
    }

    error(...args: any[]): void {
        console.error(...args);
    }

}
