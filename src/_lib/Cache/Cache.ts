export interface AppCache<UsableKeys extends string> {
    get(k: UsableKeys): Promise<string | null>
    set(k: UsableKeys, v: any): Promise<any>
}