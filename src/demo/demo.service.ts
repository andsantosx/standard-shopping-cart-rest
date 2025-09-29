import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Inject, Injectable, Logger } from '@nestjs/common'
import type { Cache } from 'cache-manager'
import { HttpService } from '@nestjs/axios'
import { firstValueFrom } from 'rxjs'

@Injectable()
export class DemoService {
  private readonly logger = new Logger(DemoService.name)
  private readonly produtos = Array.from({ length: 500 }, (_, i) => ({
    id: i + 1,
    nome: `Produto ${i + 1}`,
    preco: Math.floor(Math.random() * 1000) + 1,
    estoque: Math.floor(Math.random() * 100),
    categoria: ['eletronicos', 'livros', 'moveis', 'esportes', 'moda'][Math.floor(Math.random() * 5)],
    criadoEm: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString(),
  }))

  constructor(
    @Inject(CACHE_MANAGER) private cache: Cache,
    private http: HttpService,
  ) {}

  async listar(page: number = 1, limit: number = 10) {
    // Simulate database query delay
    await new Promise(resolve => setTimeout(resolve, 100))

    const start = (page - 1) * limit
    const data = this.produtos.slice(start, start + limit)

    return {
      page,
      limit,
      total: this.produtos.length,
      totalPages: Math.ceil(this.produtos.length / limit),
      data,
    }
  }

  async buscarExterno() {
    const key = 'demo:external:data'

    // Try to get from cache first
    const cached = await this.cache.get<any>(key)
    if (cached) {
      this.logger.log('Returning cached external data')
      return { source: 'cache', data: cached }
    }

    try {
      this.logger.log('Fetching external data from API')
      const { data } = await firstValueFrom(this.http.get('https://jsonplaceholder.typicode.com/todos/1'))

      // Cache for 1 minute
      await this.cache.set(key, data, 60000)

      return { source: 'live', data }
    } catch (error) {
      this.logger.error('Failed to fetch external data', error)

      // Fallback response
      return {
        source: 'fallback',
        data: {
          id: 0,
          title: 'Serviço temporariamente indisponível',
          description:
            'Estamos enfrentando problemas para acessar o serviço externo. Por favor, tente novamente mais tarde.',
          timestamp: new Date().toISOString(),
        },
      }
    }
  }

  async getProductById(id: number) {
    const key = `demo:product:${id}`

    // Try cache first
    const cached = await this.cache.get<any>(key)
    if (cached) {
      return { source: 'cache', data: cached }
    }

    // Simulate database lookup
    const product = this.produtos.find(p => p.id === id)

    if (!product) {
      throw new Error('Product not found')
    }

    // Cache for 5 minutes
    await this.cache.set(key, product, 300000)

    return { source: 'database', data: product }
  }
}
