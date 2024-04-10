import { ModuleMetadata, Type } from "@nestjs/common/interfaces";
import Redis from "ioredis";
import { RedisLockService } from "lib/redisLock.service";

export interface RedisLockOptions {
  prefix?: string;
  client?: Redis;
}

export interface RedisLockOptionsFactory {
  createRedisLockOptions(): Promise<RedisLockOptions> | RedisLockOptions;
}

export interface RedisLockAsyncOptions extends Pick<ModuleMetadata, "imports"> {
  useExisting?: Type<RedisLockOptionsFactory>;
  useClass?: Type<RedisLockOptionsFactory>;
  useFactory?: (...args: any[]) => Promise<RedisLockOptions> | RedisLockOptions;
  inject?: any[];
}

export interface ILockOptions {
  expire?: number;
  retryInterval?: number;
  maxRetryTimes?: number;
  single?: boolean;
  errorMessage?: string;
  errorCb?: (name: string, service: RedisLockService) => any;
}
