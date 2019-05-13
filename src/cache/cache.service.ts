import { promisify } from 'util';
import { Injectable, CACHE_MANAGER, Inject } from '@nestjs/common';
import ICacheManager from './interfaces/CacheManager';

@Injectable()
export class CacheService {
  private cache!: ICacheManager;
  private getAsync: (key: string) => Promise<any>;
  private mgetAsync: (...args: string[]) => Promise<any[]>;
  private setAsync: (key: string, value: any, options?: { ttl: number }) => Promise<string>;
  private msetAsync: (...args: any[]) => Promise<string>;
  private delAsync: (...args: string[]) => Promise<number>;
  private pingAsync: (message: string) => Promise<string>;

  constructor(@Inject(CACHE_MANAGER) cache: ICacheManager) {
    this.cache = cache.store.getClient();
    this.enAsync();
  }

  private enAsync() {
    this.getAsync = promisify(this.cache.get).bind(this.cache);
    this.mgetAsync = promisify(this.cache.mget).bind(this.cache);

    this.setAsync = promisify(this.cache.set).bind(this.cache);
    this.msetAsync = promisify(this.cache.mset).bind(this.cache);

    this.delAsync = promisify(this.cache.del).bind(this.cache);
    this.pingAsync = promisify(this.cache.ping).bind(this.cache);
  }

  public async get(key: string): Promise<any> {
    return this.getAsync(key);
  }

  public async mget(...args: string[]): Promise<any[]> {
    return this.mgetAsync(...args);
  }

  public async set(key: string, value: any, options?: { ttl: number }): Promise<any> {
    return this.setAsync(key, value, options);
  }

  public async mset(...args: any[]): Promise<string> {
    return this.msetAsync(...args);
  }

  public async del(...args: string[]): Promise<number> {
    return this.delAsync(...args);
  }

  public async ping(message: string): Promise<string> {
    return this.pingAsync(message);
  }

  public async multiIncr(...args: string[]): Promise<number[]> {
    const operations = args.map(ele => ['incr', ele]);
    const multi = this.cache.multi(operations);
    return new Promise((resolve, reject) => {
      multi.exec((err, replies) => {
        if (err) {
          reject(err);
        } else {
          resolve(replies);
        }
      });
    });
  }
}
