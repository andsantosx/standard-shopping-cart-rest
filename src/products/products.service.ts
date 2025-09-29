import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Inject, Injectable, Logger } from '@nestjs/common'
import type { Cache } from 'cache-manager'

export interface Product {
  id: number
  name: string
  price: number
  description: string
  category: string
  stock: number
  createdAt: string
}

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name)
  
  // Banco de dados em memória (simulação)
  private readonly products: Product[] = Array.from({ length: 500 }, (_, i) => ({
    id: i + 1,
    name: `Produto ${i + 1}`,
    price: Math.floor(Math.random() * 1000) + 10,
    description: `Descrição do produto ${i + 1}`,
    category: ['Eletrônicos', 'Livros', 'Móveis', 'Esportes', 'Moda'][Math.floor(Math.random() * 5)],
    stock: Math.floor(Math.random() * 100),
    createdAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString(),
  }))

  constructor(@Inject(CACHE_MANAGER) private cache: Cache) {}

  // GET /products - Lista todos os produtos com paginação
  async findAll(page: number = 1, limit: number = 10) {
    // Simula latência de banco de dados
    await new Promise(resolve => setTimeout(resolve, 50))

    const start = (page - 1) * limit
    const data = this.products.slice(start, start + limit)

    this.logger.log(`Listando produtos - página ${page}, limite ${limit}`)

    return {
      page,
      limit,
      total: this.products.length,
      totalPages: Math.ceil(this.products.length / limit),
      data,
    }
  }

  // GET /products/{id} - Retorna detalhes de um produto (COM CACHE)
  async findOne(id: number) {
    const cacheKey = `product:${id}`

    // 1. Tenta buscar no cache
    const cachedProduct = await this.cache.get<Product>(cacheKey)
    if (cachedProduct) {
      this.logger.log(`✅ Cache HIT: Produto ${id} encontrado no cache`)
      return {
        source: 'cache',
        data: cachedProduct,
      }
    }

    // 2. Cache MISS: busca no "banco de dados"
    this.logger.log(`❌ Cache MISS: Buscando produto ${id} no banco de dados`)
    
    // Simula latência de banco de dados
    await new Promise(resolve => setTimeout(resolve, 100))

    const product = this.products.find(p => p.id === id)

    if (!product) {
      return null
    }

    // 3. Salva no cache para próximas consultas (TTL: 5 minutos)
    await this.cache.set(cacheKey, product, 300000)
    this.logger.log(`💾 Produto ${id} salvo no cache`)

    return {
      source: 'database',
      data: product,
    }
  }

  // Método auxiliar para obter produto sem cache (para comparação)
  async findOneWithoutCache(id: number) {
    await new Promise(resolve => setTimeout(resolve, 100))
    return this.products.find(p => p.id === id)
  }
}
