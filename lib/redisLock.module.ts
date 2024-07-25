import { Module, DynamicModule, Provider } from "@nestjs/common";
import { RedisLockService } from "./redisLock.service";
import { RedisLockOptions, RedisLockAsyncOptions, RedisLockOptionsFactory } from "./interfaces/redisLockOptions.interface";
import { REDIS_LOCK_OPTIONS } from "./redisLock.constants";

function createRedisLockProvider(options: RedisLockOptions): any[] {
  const { isGlobal, ...value } = options || {};
  return [{ provide: REDIS_LOCK_OPTIONS, useValue: value || {} }];
}

@Module({
  imports: [],
  providers: [RedisLockService],
  exports: [RedisLockService]
})
export class RedisLockModule {
  static register(options: RedisLockOptions): DynamicModule {
    return {
      global: !!options.isGlobal,
      module: RedisLockModule,
      providers: createRedisLockProvider(options)
    };
  }

  static registerAsync(options: RedisLockAsyncOptions): DynamicModule {
    return {
      global: !!options.isGlobal,
      module: RedisLockModule,
      imports: options.imports || [],
      providers: this.createAsyncProviders(options)
    };
  }

  private static createAsyncProviders(options: RedisLockAsyncOptions): Provider[] {
    if (options.useExisting || options.useFactory) {
      return [this.createAsyncOptionsProvider(options)];
    }
    return [this.createAsyncOptionsProvider(options), { provide: options.useClass, useClass: options.useClass }];
  }

  private static createAsyncOptionsProvider(options: RedisLockAsyncOptions): Provider {
    if (options.useFactory) {
      return {
        provide: REDIS_LOCK_OPTIONS,
        useFactory: options.useFactory,
        inject: options.inject || []
      };
    }
    return {
      provide: REDIS_LOCK_OPTIONS,
      useFactory: async (optionsFactory: RedisLockOptionsFactory) => await optionsFactory.createRedisLockOptions(),
      inject: [options.useExisting || options.useClass]
    };
  }
}
