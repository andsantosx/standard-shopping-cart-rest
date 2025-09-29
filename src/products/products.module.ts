import { Module } from '@nestjs/common'
import { CacheModule } from '@nestjs/cache-manager'
import { ProductsController } from './products.controller'
import { ProductsService } from './products.service'

@Module({
  imports: [CacheModule.register()],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}
