import { Module } from '@nestjs/common'
import { APP_GUARD } from '@nestjs/core'
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler'
import { CacheModule } from '@nestjs/cache-manager'
import { HttpModule } from '@nestjs/axios'
import { GraphQLModule } from '@nestjs/graphql'
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo'
import { join } from 'path'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { CartController } from './controller/CartController'
import { CartService } from './service/CartService'
import { ProductService } from './service/ProductService'
import { ProductResolver } from './app.resolver'
import { HealthModule } from './health/health.module'
import { DemoModule } from './demo/demo.module'

@Module({
  imports: [
    // Rate limiting (100 requests per 15 minutes per IP)
    ThrottlerModule.forRoot([{
      ttl: 900, // 15 minutes in seconds
      limit: 100,
    }]),
    
    // Cache configuration (in-memory cache)
    CacheModule.register({
      ttl: 60000, // 1 minute
      max: 200, // maximum number of items in cache
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
