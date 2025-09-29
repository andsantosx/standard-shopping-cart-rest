import { Module } from '@nestjs/common'
import { APP_GUARD } from '@nestjs/core'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler'
import { CacheModule } from '@nestjs/cache-manager'
import { HttpModule } from '@nestjs/axios'
import { GraphQLModule } from '@nestjs/graphql'
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo'
import { join } from 'path'
import { redisStore } from 'cache-manager-redis-store'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { CartController } from './controller/CartController'
import { CartService } from './service/CartService'
import { ProductService } from './service/ProductService'
import { ProductResolver } from './app.resolver'
import { HealthModule } from './health/health.module'
import { DemoModule } from './demo/demo.module'
import { ProductsModule } from './products/products.module'
import { CartModule } from './cart/cart.module'

@Module({
  imports: [
    // Config module for environment variables
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Rate limiting (100 requests per 15 minutes per IP)
    ThrottlerModule.forRoot([
      {
        ttl: 900, // 15 minutes in seconds
        limit: 100,
      },
    ]),

    // Cache configuration with Redis Cloud support
    CacheModule.registerAsync({
      isGlobal: true,
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const redisHost = configService.get('REDIS_HOST')
        const redisPort = configService.get('REDIS_PORT')
        const redisPassword = configService.get('REDIS_PASSWORD')

        // Se o host do Redis estiver configurado, tenta conectar
        if (redisHost && redisPort) {
          try {
            const isLocal = redisHost === 'localhost' || redisHost === '127.0.0.1'
            console.log(`🔄 Tentando conectar ao Redis ${isLocal ? 'Local (Docker)' : 'Cloud'}...`)

            const storeConfig: any = {
              socket: {
                host: redisHost,
                port: parseInt(redisPort),
              },
            }

            // Adiciona senha apenas se estiver configurada (Redis Cloud precisa, local não)
            if (redisPassword) {
              storeConfig.password = redisPassword
              storeConfig.username = configService.get('REDIS_USERNAME') || 'default'
            }

            const store = await redisStore(storeConfig)
            console.log(`✅ Redis conectado com sucesso! (${isLocal ? 'Local' : 'Cloud'})`)

            return {
              store,
              ttl: 60000, // 1 minute
            }
          } catch (error) {
            console.error('❌ Erro ao conectar com Redis:', error.message)
            console.log('⚠️  Usando cache em memória como fallback')
            return {
              ttl: 60000,
              max: 200,
            }
          }
        }

        // Fallback: usa cache em memória
        console.log('ℹ️  Redis Cloud não configurado. Usando cache em memória.')
        return {
          ttl: 60000, // 1 minute
          max: 200, // maximum number of items in cache
        }
      },
    }),

    // HTTP client with timeout
    HttpModule.register({
      timeout: 5000, // 5 seconds
      maxRedirects: 3,
    }),

    // GraphQL configuration
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
      debug: process.env.NODE_ENV !== 'production',
      playground: process.env.NODE_ENV !== 'production',
    }),

    // Application modules
    HealthModule,
    DemoModule,
    ProductsModule,
    CartModule,
  ],
  controllers: [AppController, CartController],
  providers: [
    // Apply throttler guard globally
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    AppService,
    ProductService,
    ProductResolver,
    CartService,
  ],
})
export class AppModule {}
