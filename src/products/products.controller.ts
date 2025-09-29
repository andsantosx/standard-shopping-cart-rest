import { Controller, Get, Param, Query, NotFoundException } from '@nestjs/common'
import { Throttle } from '@nestjs/throttler'
import { ProductsService } from './products.service'

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  // GET /products - Lista todos os produtos com paginação
  @Get()
  @Throttle({ default: { limit: 100, ttl: 60000 } }) // 100 req/min
  async findAll(@Query('page') page: string = '1', @Query('limit') limit: string = '10') {
    const pageNum = Math.max(parseInt(page, 10) || 1, 1)
    const limitNum = Math.min(parseInt(limit, 10) || 10, 50)

    const startTime = Date.now()
    const result = await this.productsService.findAll(pageNum, limitNum)
    const endTime = Date.now()

    return {
      ...result,
      responseTime: `${endTime - startTime}ms`,
    }
  }

  // GET /products/{id} - Retorna detalhes de um produto (COM CACHE)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const startTime = Date.now()
    const result = await this.productsService.findOne(parseInt(id, 10))
    const endTime = Date.now()

    if (!result) {
      throw new NotFoundException(`Produto com ID ${id} não encontrado`)
    }

    return {
      ...result,
      responseTime: `${endTime - startTime}ms`,
      cached: result.source === 'cache',
    }
  }
}
