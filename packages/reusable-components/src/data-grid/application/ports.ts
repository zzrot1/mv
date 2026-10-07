import type { ServerGridQuery } from "./server-query";

export type ConfirmPort = (message: string) => boolean | Promise<boolean>;

export type GridQueryListener = (query: ServerGridQuery) => void;
