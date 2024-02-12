export interface IBaseLogger {
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

export class Logger implements IBaseLogger {

    log(...args: any[]): void {
        // eslint-disable-next-line no-console
        console.log(...args);
    }

    error(...args: any[]): void {
        // eslint-disable-next-line no-console
        console.error(...args);
    }

}
