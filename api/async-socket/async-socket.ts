import { Socket } from 'net';

export class AsyncSocket {
    readonly port: number;
    readonly host: string;
    readonly timeout: number;

    private socket?: Socket;

    public connected: boolean = false;

    constructor(port: number, host: string, timeout: number = 5) {
        this.port = port;
        this.host = host;
        this.timeout = timeout;
    }

    async connect(): Promise<boolean> {
        this.socket = new Socket();
        this.socket.setTimeout(this.timeout * 1000);

        this.socket.on('end', () => {
            this.connected = false;
        });

        return new Promise((resolve, reject) => {
            try {
                this.socket?.connect(this.port, this.host, () => {
                    this.connected = true;
                    resolve(true);
                });
            } catch (error) {
                reject(error);
            }
        });
    }

    async write(buffer: Buffer): Promise<Buffer> {
        return new Promise((resolve, reject) => {
            this.socket?.once('data', (data) => {
                resolve(data);
            });

            this.socket?.once('timeout', () => {
                reject(new Error('Timeout'));
            });

            this.socket?.once('error', (error) => {
                reject(error);
            });

            this.socket?.write(buffer, (error) => {
                if (error) {
                    reject(error);
                }
            });
        });
    }

    async disconnect(): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
                this.socket?.end(() => {
                    resolve();
                });
            } catch (error) {
                resolve();
            }
        });
    }
}
