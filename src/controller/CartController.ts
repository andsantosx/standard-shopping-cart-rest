import { Body, Controller, Delete, Get, Param, Post, Put, Res } from '@nestjs/common'
import { Response } from 'express'
import { CartService } from '../service/CartService'

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post()
  createCart() {
    return this.cartService.createCart()
  }

  @Get(':cartId')
  getCart(@Param('cartId') cartId: string) {
    return this.cartService.getCart(cartId)
  }

  @Post('items')
  addItem(@Body() body: { cartId: string; productId: string; quantity?: number }, @Res() res: Response) {
    try {
      const { cartId, productId, quantity = 1 } = body
      const cart = this.cartService.addItem(cartId, productId, quantity)
      return res.status(200).json(cart)
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.message === 'Produto não encontrado' || error.message === 'Carrinho não encontrado') {
          return res.status(404).json({ message: error.message })
        }
        if (error.message === 'Produto fora de estoque') {
          return res.status(400).json({ message: error.message })
        }
      }
      return res.status(500).json({ message: 'Erro interno do servidor' })
    }
  }

  @Put('items/:productId')
  updateItemQuantity(
    @Param('productId') productId: string,
    @Body() body: { cartId: string; quantity: number },
    @Res() res: Response,
  ) {
    try {
      const { cartId, quantity } = body
      const cart = this.cartService.updateItemQuantity(cartId, productId, quantity)
      return res.status(200).json(cart)
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.message === 'Item não encontrado no carrinho' || error.message === 'Carrinho não encontrado') {
          return res.status(404).json({ message: error.message })
        }
      }
      return res.status(500).json({ message: 'Erro interno do servidor' })
    }
  }

  @Delete('items/:productId')
  removeItem(@Param('productId') productId: string, @Body() body: { cartId: string }, @Res() res: Response) {
    try {
      const { cartId } = body
      const cart = this.cartService.removeItem(cartId, productId)
      return res.status(200).json(cart)
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.message === 'Item não encontrado no carrinho' || error.message === 'Carrinho não encontrado') {
          return res.status(404).json({ message: error.message })
        }
      }
      return res.status(500).json({ message: 'Erro interno do servidor' })
    }
  }
}
