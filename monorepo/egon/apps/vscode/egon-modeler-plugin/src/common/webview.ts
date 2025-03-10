export type WebviewMessage<T> = {
    type: MessageType;
    data: T;
};

export enum MessageType {
    UPDATE = "UPDATE",
    INFO = "INFO",
    ERROR = "ERROR",
}
