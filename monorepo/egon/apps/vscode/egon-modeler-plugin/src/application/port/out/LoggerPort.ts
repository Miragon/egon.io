export interface LoggerPort {
    info(message: string): void;

    error(error: unknown): void;
}
