import { LoggerPort } from "port/out";

export class LoggerAdapter implements LoggerPort {
    info(message: string): void {
        console.log(message);
    }

    error(error: unknown): void {
        const message = error instanceof Error ? error.message : `${error}`;
        console.error(message);
    }
}
