import { Controller, Get, Query, Param, UseInterceptors, ClassSerializerInterceptor } from '@nestjs/common'
import { Throttle } from '@nestjs/throttler'
import { DemoService } from './demo.service'

@Controller('demo')
@UseInterceptors(ClassSerializerInterceptor)
export class DemoController {
  constructor(private readonly demoService: DemoService) {}

  @Get('produtos')
  @Throttle({ default: { limit: 20, ttl: 60000 } }) // 20 requests per minute per IP
  async listarProdutos(@Query('page') page: string = '1', @Query('limit') limit: string = '10') {
    const pageNum = Math.max(parseInt(page, 10) || 1, 1)
    const limitNum = Math.min(parseInt(limit, 10) || 10, 50)

    return this.demoService.listar(pageNum, limitNum)
  }

  @Get('produtos/:id')
  async buscarProduto(@Param('id') id: string) {
    return this.demoService.getProductById(parseInt(id, 10))
  }

  @Get('externo')
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 requests per minute per IP
  async buscarDadosExternos() {
    return this.demoService.buscarExterno()
  }

  @Get('cache/limpar')
  limparCache() {
    // In a real application, you would clear the entire cache or specific keys
    // This is just a demo endpoint to show cache invalidation
    return {
      status: 'success',
      message: 'Cache cleared (demo only - in a real app this would clear the cache)',
    }
  }
}
