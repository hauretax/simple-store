export const STORE_ERRORS = {
    NOT_SERIALIZABLE: 'Value is not serializable',
    ACCESS_DENID: "User isn't allow to"
}

export type Action = 'READ' | 'WRITE' | 'SEE_RECORD' | "DELETE"

export type UserType = {
    id: string;
    permission: Array<Action>
}

export type rec = {
    userId: string,
    action: Action,
    time: Date
    data?: object | string,
}