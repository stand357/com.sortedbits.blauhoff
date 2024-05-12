interface CacheItem {
    key: string;
    value: any;
    ttl: number;
}

export class Cache {
    private static instance: Cache;
    private cache: CacheItem[] = [];

    private constructor() {}

    public static getInstance(): Cache {
        if (!Cache.instance) {
            Cache.instance = new Cache();
        }

        return Cache.instance;
    }

    public set(key: string, value: any, ttl: number): void {
        this.cache.push({ key, value, ttl });
    }

    public get(key: string): any {
        const item = this.cache.find((x) => x.key === key);

        if (item) {
            if (item.ttl < Date.now()) {
                this.cache = this.cache.filter((x) => x.key !== key);
                return undefined;
            }
            return item.value;
        }

        return undefined;
    }

    public clear(): void {
        this.cache = [];
    }
}
