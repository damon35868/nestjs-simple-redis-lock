import { DynamicModule, Logger, Module, OnModuleInit, Provider } from "@nestjs/common";
import { RedisLockAsyncOptions, RedisLockOptions, RedisLockOptionsFactory } from "./interfaces/redisLockOptions.interface";
import { REDIS_LOCK_OPTIONS } from "./redisLock.constants";
import { RedisLockService } from "./redisLock.service";

function createRedisLockProvider(options: RedisLockOptions): any[] {
  const { isGlobal, ...value } = options || {};
  return [{ provide: REDIS_LOCK_OPTIONS, useValue: value || {} }];
}

@Module({
  imports: [],
  providers: [RedisLockService],
  exports: [RedisLockService]
})
export class RedisLockModule implements OnModuleInit {
  onModuleInit() {
    const logger = new Logger("RedisLockModule", { timestamp: true });
    logger.log("RedisLockModule dependencies initialized");
  }

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
