export default interface ICacheManager {
  store: any;
  get(key: string): any;
  mget(keys: string[]): any[];
  set(key: string, value: string, options?: { ttl: number }): any;
  mset(...args: any[]): any;
  del(...args: string[]): number;
  multi(): any;
  multi(arg: any[]): any;
  ping(message: string): string;

  sadd(key: string, member: any, callback: Function): any;
  srem(key: string, member: any, callback: Function): any;
  sismember(key: string, member: any, callback: Function): any;
}
