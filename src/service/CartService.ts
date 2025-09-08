import { Injectable, NotFoundException } from '@nestjs/common'
import { products } from '../data/Products'
import { Cart } from '../model/Cart'

@Injectable()
export class CartService {
  private carts: Map<string, Cart> = new Map()
  private cartCounter: number = 0

  createCart(): Cart {
    const cart: Cart = {
      id: (++this.cartCounter).toString(),
      items: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      total: 0,
    }
    this.carts.set(cart.id, cart)
    return cart
  }

  getCart(cartId: string): Cart {
    const cart = this.carts.get(cartId)
    if (!cart) {
      throw new NotFoundException('Carrinho não encontrado')
    }
    return cart
  }

  addItem(cartId: string, productId: string, quantity: number = 1): Cart {
    const cart = this.getCart(cartId)
    const product = products.find(p => p.id === productId)

    if (!product) {
      throw new NotFoundException('Produto não encontrado')
    }

    if (!product.inStock) {
      throw new Error('Produto fora de estoque')
    }

    const existingItemIndex = cart.items.findIndex(item => item.productId === productId)

    if (existingItemIndex > -1) {
      // Update existing item
      cart.items[existingItemIndex].quantity += quantity
    } else {
      // Add new item
      cart.items.push({
        productId: product.id,
        quantity,
        price: product.price,
        name: product.name,
        image: product.image,
      })
    }

    return this.updateCartTotal(cart)
  }

  updateItemQuantity(cartId: string, productId: string, quantity: number): Cart {
    if (quantity <= 0) {
      return this.removeItem(cartId, productId)
    }

    const cart = this.getCart(cartId)
    const item = cart.items.find(item => item.productId === productId)

    if (!item) {
      throw new NotFoundException('Item não encontrado no carrinho')
    }

    item.quantity = quantity
    return this.updateCartTotal(cart)
  }

  removeItem(cartId: string, productId: string): Cart {
    const cart = this.getCart(cartId)
    const initialLength = cart.items.length
    cart.items = cart.items.filter(item => item.productId !== productId)

    if (cart.items.length === initialLength) {
      throw new NotFoundException('Item não encontrado no carrinho')
    }

    return this.updateCartTotal(cart)
  }

  private updateCartTotal(cart: Cart): Cart {
    cart.total = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
    cart.updatedAt = new Date()
    return cart
  }
}
