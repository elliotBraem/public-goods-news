declare module "bun:sqlite" {
  export interface Database {
    prepare<T = unknown>(sql: string): Statement<T>;
    query<T = unknown>(sql: string): Statement<T>;
    run(sql: string, ...params: any[]): void;
    transaction<T>(cb: () => T): T;
    close(): void;
  }

  export interface Statement<T = unknown> {
    run(...params: any[]): void;
    get(...params: any[]): T;
    all(...params: any[]): T[];
    values(...params: any[]): any[][];
    finalize(): void;
  }

  export class SQLiteError extends Error {
    constructor(message: string);
  }

  export const Database: {
    new (filename: string): Database;
  };
}
