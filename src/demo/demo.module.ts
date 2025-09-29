import { Module } from '@nestjs/common'
import { CacheModule } from '@nestjs/cache-manager'
import { HttpModule } from '@nestjs/axios'
import { DemoController } from './demo.controller'
import { DemoService } from './demo.service'

@Module({
  imports: [CacheModule.register(), HttpModule],
  controllers: [DemoController],
  providers: [DemoService],
  exports: [DemoService],
})
export class DemoModule {}
