export interface Repository<T> {
    findMany(offset: number, limit: number): Promise<T[]>;
}