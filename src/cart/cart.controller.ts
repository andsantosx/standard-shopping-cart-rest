import { Controller, Post, Get, Body, Param, HttpCode, HttpStatus } from '@nestjs/common'
import { Throttle } from '@nestjs/throttler'
import { CartService } from './cart.service'

class AddItemDto {
  productId: number
  quantity: number
}

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  // POST /cart/add - Adiciona item ao carrinho (COM ATRASO E TIMEOUT)
  @Post('add')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 30, ttl: 60000 } }) // 30 req/min
  async addItem(@Body() body: { cartId: string; productId: number; quantity: number }) {
    const { cartId, productId, quantity } = body

    const startTime = Date.now()
    
    try {
      const result: any = await this.cartService.addItem(cartId, productId, quantity, 5000)
      const endTime = Date.now()

      return {
        success: result.success,
        cart: result.cart,
        processingTime: result.processingTime,
        totalResponseTime: `${endTime - startTime}ms`,
      }
    } catch (error: any) {
      const endTime = Date.now()

      return {
        success: false,
        error: error.message,
        totalResponseTime: `${endTime - startTime}ms`,
      }
    }
  }

  // GET /cart/{id} - Consulta quantidade de itens no carrinho
  @Get(':id')
  async getCart(@Param('id') id: string) {
    const startTime = Date.now()
    const cart = await this.cartService.getCart(id)
    const endTime = Date.now()

    return {
      ...cart,
      responseTime: `${endTime - startTime}ms`,
    }
  }
}
