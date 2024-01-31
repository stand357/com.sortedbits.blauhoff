/**
 * Represents a BlauHoff device.
 */
export interface BlauHoffDevice {
    id: string;
    serial: string;
    model: string;
    lastStatusUpdate: Date;
}
