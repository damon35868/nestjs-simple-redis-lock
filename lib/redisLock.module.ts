import { Module, DynamicModule, Provider } from "@nestjs/common";
import { RedisLockService } from "./redisLock.service";
import { RedisLockOptions, RedisLockAsyncOptions, RedisLockOptionsFactory } from "./interfaces/redisLockOptions.interface";
import { REDIS_LOCK_OPTIONS } from "./redisLock.constants";

function createRedisLockProvider(options: RedisLockOptions): any[] {
  return [{ provide: REDIS_LOCK_OPTIONS, useValue: options || {} }];
}

@Module({
  imports: [],
  providers: [RedisLockService],
  exports: [RedisLockService]
})
export class RedisLockModule {
  static register(options: RedisLockOptions, global: boolean = false): DynamicModule {
    return {
      global,
      module: RedisLockModule,
      providers: createRedisLockProvider(options)
    };
  }

  static registerAsync(options: RedisLockAsyncOptions, global: boolean = false): DynamicModule {
    return {
      global,
      module: RedisLockModule,
      imports: options.imports || [],
      providers: this.createAsyncProviders(options)
    };
  }

  private static createAsyncProviders(options: RedisLockAsyncOptions): Provider[] {
    if (options.useExisting || options.useFactory) {
      return [this.createAsyncOptionsProvider(options)];
    }
    return [
      this.createAsyncOptionsProvider(options),
      {
        provide: options.useClass,
        useClass: options.useClass
      }
    ];
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
