import { Injectable, Logger, RequestTimeoutException } from '@nestjs/common'

export interface CartItem {
  productId: number
  quantity: number
  addedAt: string
}

export interface Cart {
  id: string
  items: CartItem[]
  totalItems: number
}

@Injectable()
export class CartService {
  private readonly logger = new Logger(CartService.name)
  
  // Banco de dados em memória para carrinhos
  private readonly carts = new Map<string, Cart>()

  // POST /cart/add - Adiciona item ao carrinho (COM ATRASO ARTIFICIAL)
  async addItem(cartId: string, productId: number, quantity: number, timeout: number = 5000) {
    this.logger.log(`Adicionando produto ${productId} ao carrinho ${cartId}`)

    // Simula processamento demorado (2-4 segundos aleatório)
    const processingTime = Math.floor(Math.random() * 2000) + 2000
    
    this.logger.log(`⏳ Processando... (${processingTime}ms)`)

    // Implementa timeout
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new RequestTimeoutException('Operação excedeu o tempo limite')), timeout)
    })

    const processingPromise = new Promise(resolve => {
      setTimeout(() => {
        // Busca ou cria carrinho
        let cart = this.carts.get(cartId)
        
        if (!cart) {
          cart = {
            id: cartId,
            items: [],
            totalItems: 0,
          }
        }

        // Adiciona item
        const existingItem = cart.items.find(item => item.productId === productId)
        
        if (existingItem) {
          existingItem.quantity += quantity
        } else {
          cart.items.push({
            productId,
            quantity,
            addedAt: new Date().toISOString(),
          })
        }

        // Atualiza total
        cart.totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0)

        // Salva carrinho
        this.carts.set(cartId, cart)

        this.logger.log(`✅ Item adicionado com sucesso (${processingTime}ms)`)
        
        resolve({
          success: true,
          cart,
          processingTime: `${processingTime}ms`,
        })
      }, processingTime)
    })

    // Race entre processamento e timeout
    return Promise.race([processingPromise, timeoutPromise])
  }

  // GET /cart/{id} - Consulta quantidade de itens no carrinho
  async getCart(cartId: string) {
    const cart = this.carts.get(cartId)

    if (!cart) {
      return {
        id: cartId,
        items: [],
        totalItems: 0,
        message: 'Carrinho vazio ou não encontrado',
      }
    }

    return cart
  }

  // Limpar carrinho (útil para testes)
  clearCart(cartId: string) {
    this.carts.delete(cartId)
    this.logger.log(`🗑️  Carrinho ${cartId} limpo`)
  }
}
