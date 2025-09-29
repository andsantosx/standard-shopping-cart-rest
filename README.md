# Standard Shopping Cart (REST, NestJS)

API REST de carrinho de compras construída com NestJS e TypeScript.  
O objetivo é expor endpoints para adicionar, atualizar e remover itens do carrinho, com respostas e códigos HTTP padronizados, prontos para testes via Postman ou cURL.

> Observação  
> Este projeto parte do esqueleto padrão do NestJS (scripts start, start:dev, start:prod, test, test:e2e, test:cov). Caso você ainda não tenha alterado os scripts, utilize-os conforme a seção Scripts abaixo. 

---

## Sumário

- Arquitetura
- Requisitos
- Instalação e Execução
- Variáveis de Ambiente
- Modelo de Dados
- Especificação da API
- Criar/Obter carrinho
- Adicionar item ao carrinho
- Atualizar item do carrinho
- Excluir item do carrinho
- Códigos de status
- Exemplos (cURL)
- Testes
- Coleção Postman
- Padronização de código
- Swagger (opcional)
- Roadmap
- Observabilidade & Healthcheck

---

## Arquitetura

- NestJS (Node.js + TypeScript) — Estrutura modular, com controllers, services e DTOs.
- Armazenamento: inicialmente em memória (para facilitar avaliação).  
  > Pode ser substituído por banco (ex.: PostgreSQL, SQLite, MongoDB) no futuro.
- Validação: via class-validator/class-transformer (recomendado).
- Testes: unitários e e2e com Jest (scripts padrão do NestJS).

Estrutura sugerida:

src/
app.module.ts
main.ts
carts/
  carts.controller.ts
  carts.service.ts
dto/
  add-item.dto.ts
  update-item.dto.ts
entities/
  cart.entity.ts
  cart-item.entity.ts

---

## Requisitos

- Node.js 18+  
- npm 9+ (ou pnpm/yarn, se preferir)

---

## Instalação e Execução

1) Instalar dependências  
npm install

2) Rodar em desenvolvimento (hot reload)  
npm run start:dev

3) Produção (build + start)  
npm run start:prod

Scripts como start, start:dev, start:prod, test, test:e2e e test:cov fazem parte do boilerplate do NestJS e devem estar no package.json deste projeto.

A API sobe por padrão em: http://localhost:3000

---

## Variáveis de Ambiente

Crie um arquivo .env na raiz (opcional, mas recomendado):

PORT=3000
# DB_URL=postgres://user:pass@localhost:5432/cart   # (futuro)

O main.ts pode ler process.env.PORT para definir a porta.

---

## Modelo de Dados

Cart (Carrinho)

{
  "id": "string",               
  "items": [
    {
      "productId": "string",    
      "name": "string",         
      "price": 99.9,            
      "quantity": 1             
    }
  ],
  "total": 99.9                 
}

Regra: total é calculado no serviço sempre que itens são adicionados/atualizados/removidos.

---

## Especificação da API

Base URL: http://localhost:3000

### Criar/Obter carrinho

POST /carts  
Cria um novo carrinho vazio.  
201 Created → body com objeto Cart.

GET /carts/:cartId  
Retorna o carrinho.  
200 OK → body com Cart.  
404 Not Found se não existir.

---

### Adicionar item ao carrinho

POST /carts/:cartId/items

Body:
{
  "productId": "abc-123",
  "name": "Produto X",
  "price": 59.9,
  "quantity": 2
}

201 Created → item criado e carrinho atualizado.  
400 Bad Request para corpo inválido.  
404 Not Found se cartId não existir.

Comportamento sugerido: se o productId já estiver no carrinho, somar quantity.

---

### Atualizar item do carrinho

PUT /carts/:cartId/items/:productId

Body (exemplos):
{ "quantity": 3 }

ou
{ "price": 49.9, "quantity": 1 }

200 OK → item atualizado e carrinho recalculado.  
400 Bad Request para corpo inválido.  
404 Not Found se carrinho/item não existir.

---

### Excluir item do carrinho

DELETE /carts/:cartId/items/:productId  
200 OK (ou 204 No Content) ao remover.  
404 Not Found se carrinho/item não existir.

---

## Códigos de status

201 Created — criação de carrinho/itens.  
200 OK — leitura/atualização/remoção bem-sucedida.  
204 No Content — alternativa para remoção sem body.  
400 Bad Request — corpo inválido.  
404 Not Found — carrinho ou item inexistente.  
409 Conflict — conflito de regra de negócio (opcional).  
500 Internal Server Error — erro inesperado.  

---

## Exemplos (cURL)

Criar carrinho:  
curl -X POST http://localhost:3000/carts

Obter carrinho:  
curl http://localhost:3000/carts/<CART_ID>

Adicionar item:  
curl -X POST http://localhost:3000/carts/<CART_ID>/items \
  -H "Content-Type: application/json" \
  -d '{"productId": "abc-123", "name": "Camisa", "price": 79.9, "quantity": 2}'

Atualizar item:  
curl -X PUT http://localhost:3000/carts/<CART_ID>/items/abc-123 \
  -H "Content-Type: application/json" \
  -d '{"quantity": 3}'

Remover item:  
curl -X DELETE http://localhost:3000/carts/<CART_ID>/items/abc-123

---

## Testes

# unit  
npm run test

# end-to-end  
npm run test:e2e

# cobertura  
npm run test:cov

Recomendação: criar testes unitários para CartsService e testes e2e para os fluxos REST.

---

## Coleção Postman

1. Abra o Postman.  
2. Crie uma Collection chamada “Shopping Cart REST”.  
3. Adicione as requests:  
   - POST /carts  
   - GET /carts/:cartId  
   - POST /carts/:cartId/items  
   - PUT /carts/:cartId/items/:productId  
   - DELETE /carts/:cartId/items/:productId  
4. Exporte a collection se quiser versionar em postman/collection.json.

---

## Padronização de código

- ESLint/Prettier configurados.  
- Husky + lint-staged (opcional).  
- Commits seguindo Conventional Commits (opcional).  

---

## Swagger (opcional)

Para documentação automática:

npm i @nestjs/swagger swagger-ui-express

No main.ts:
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

const config = new DocumentBuilder()
  .setTitle('Shopping Cart API')
  .setDescription('API REST do carrinho de compras')
  .setVersion('1.0')
  .build();

const document = SwaggerModule.createDocument(app, config);
SwaggerModule.setup('docs', app, document);

Acesse em: http://localhost:3000/docs

---

## Roadmap

- Persistência em banco relacional (TypeORM/Prisma).  
- Autenticação/JWT e carrinho por usuário.  
- Política de merge vs. conflito ao adicionar item existente.  
- Descontos, cupons e frete.  
- Integração com microsserviço de Produtos.  
- Versionamento de API (/v1, /v2).  
- Observabilidade (logger estruturado, métricas Prometheus).  
- Dockerfile + docker-compose.  

---

## 🚀 Escalabilidade e Resiliência

Este projeto implementa técnicas avançadas de **escalabilidade** e **resiliência** para garantir alta performance e disponibilidade sob carga.

### ✅ Funcionalidades Implementadas

#### 📦 Escalabilidade

1. **Compressão GZIP**
   - Todas as respostas HTTP são comprimidas automaticamente
   - Reduz o tamanho dos payloads em até 70%
   - Implementado em `src/main.ts`

2. **Cache Inteligente (3 Opções)**
   - **Opção 1 - Redis Local (Docker):** Para desenvolvimento local
     - 🐳 **[Guia: Redis Local com Docker](./REDIS_LOCAL_DOCKER.md)**
     - Rápido, fácil, sem necessidade de conta externa
     - Inclui RedisInsight (interface gráfica)
   - **Opção 2 - Redis Cloud:** Para produção/nuvem
     - ☁️ **[Guia: Redis Cloud](./REDIS_CLOUD_SETUP.md)**
     - Cache persistente e escalável
     - Free tier de 30MB
   - **Opção 3 - Cache em Memória:** Fallback automático
     - Usado quando Redis não está configurado
     - Ideal para testes rápidos
   - Sistema de cache configurado com TTL (Time To Live)
   - Reduz chamadas a APIs externas e banco de dados
   - Configuração: TTL de 1 minuto, 200 itens máximo (memória)
   - Implementado com `@nestjs/cache-manager` + `cache-manager-redis-store`

3. **Paginação**
   - Endpoint `/demo/produtos` suporta paginação
   - Parâmetros: `?page=1&limit=10`
   - Limite máximo de 50 itens por página

#### 🛡️ Resiliência

1. **Rate Limiting (Throttling)**
   - Proteção contra abuso e DDoS
   - Limite global: 100 requisições por 15 minutos por IP
   - Limites específicos por endpoint:
     - `/demo/produtos`: 20 req/min
     - `/demo/externo`: 10 req/min
   - Implementado com `@nestjs/throttler`

2. **Timeout em Requisições HTTP**
   - Timeout de 5 segundos para chamadas externas
   - Evita que requisições lentas travem o sistema
   - Configurado no `HttpModule`

3. **Fallback para Falhas**
   - Endpoint `/demo/externo` com fallback automático
   - Retorna resposta padrão quando API externa falha
   - Logs detalhados de erros

#### 🩺 Monitoramento

1. **Health Check**
   - Endpoint: `GET /health`
   - Retorna status do sistema, uptime, memória, versão Node.js
   - Útil para Docker, Kubernetes e ferramentas de monitoramento

### 🧪 Endpoints da Atividade Prática

#### Endpoints Principais (Conforme Atividade)

**1. GET /products** - Lista produtos com paginação
```bash
curl "http://localhost:3000/products?page=1&limit=10"
```

**2. GET /products/{id}** - Detalhes de um produto (COM CACHE)
```bash
curl http://localhost:3000/products/1
```

**3. POST /cart/add** - Adiciona item ao carrinho (COM ATRASO ARTIFICIAL)
```bash
curl -X POST http://localhost:3000/cart/add \
  -H "Content-Type: application/json" \
  -d '{"cartId": "cart-123", "productId": 1, "quantity": 2}'
```

**4. GET /cart/{id}** - Consulta carrinho
```bash
curl http://localhost:3000/cart/cart-123
```

📖 **[Guia Completo da Atividade](./GUIA_ATIVIDADE.md)**

---

### 🧪 Endpoints de Demonstração

#### 1. Health Check
```bash
GET http://localhost:3000/health
```
Resposta:
```json
{
  "status": "ok",
  "timestamp": "2025-09-29T19:27:00.000Z",
  "uptime": 123.45,
  "memoryUsage": { "rss": 50000000, "heapTotal": 20000000, "heapUsed": 15000000 },
  "nodeVersion": "v18.0.0",
  "platform": "win32"
}
```

#### 2. Listar Produtos (com Paginação e Rate Limit)
```bash
GET http://localhost:3000/demo/produtos?page=1&limit=10
```
Resposta:
```json
{
  "page": 1,
  "limit": 10,
  "total": 500,
  "totalPages": 50,
  "data": [
    {
      "id": 1,
      "nome": "Produto 1",
      "preco": 450,
      "estoque": 75,
      "categoria": "eletronicos",
      "criadoEm": "2025-09-15T10:30:00.000Z"
    }
  ]
}
```

#### 3. Buscar Produto por ID (com Cache)
```bash
GET http://localhost:3000/demo/produtos/1
```
Resposta:
```json
{
  "source": "cache",  // ou "database" na primeira chamada
  "data": {
    "id": 1,
    "nome": "Produto 1",
    "preco": 450,
    "estoque": 75,
    "categoria": "eletronicos",
    "criadoEm": "2025-09-15T10:30:00.000Z"
  }
}
```

#### 4. API Externa (com Cache, Timeout e Fallback)
```bash
GET http://localhost:3000/demo/externo
```
Resposta (sucesso):
```json
{
  "source": "live",  // ou "cache" se já estiver em cache
  "data": {
    "userId": 1,
    "id": 1,
    "title": "delectus aut autem",
    "completed": false
  }
}
```

Resposta (fallback em caso de falha):
```json
{
  "source": "fallback",
  "data": {
    "id": 0,
    "title": "Serviço temporariamente indisponível",
    "description": "Estamos enfrentando problemas para acessar o serviço externo. Por favor, tente novamente mais tarde.",
    "timestamp": "2025-09-29T19:27:00.000Z"
  }
}
```

### 🧪 Testando Rate Limiting

Para testar o rate limiting, faça múltiplas requisições rapidamente:

```bash
# Windows PowerShell
for ($i=1; $i -le 25; $i++) { 
  curl http://localhost:3000/demo/produtos
  Write-Host "Request $i"
}
```

Após 20 requisições em 1 minuto, você receberá:
```json
{
  "statusCode": 429,
  "message": "ThrottlerException: Too Many Requests"
}
```

### 📊 Configurações

Todas as configurações estão centralizadas em `src/app.module.ts`:

```typescript
// Rate Limiting
ThrottlerModule.forRoot([{
  ttl: 900,      // 15 minutos
  limit: 100,    // 100 requisições
}])

// Cache
CacheModule.register({
  ttl: 60000,    // 1 minuto
  max: 200,      // 200 itens
})

// HTTP Client
HttpModule.register({
  timeout: 5000,      // 5 segundos
  maxRedirects: 3,
})
```

### 🎯 Benefícios

- ✅ **Performance**: Cache e compressão reduzem latência e uso de banda
- ✅ **Escalabilidade**: Paginação permite lidar com grandes volumes de dados
- ✅ **Segurança**: Rate limiting protege contra abuso
- ✅ **Confiabilidade**: Timeout e fallback garantem disponibilidade
- ✅ **Observabilidade**: Health check facilita monitoramento

### 🧪 Testes de Carga com Artillery

Este projeto inclui testes de carga completos usando Artillery CLI:

📖 **[Guia Completo de Testes com Artillery](./ARTILLERY_TESTES.md)**

**Scripts de teste incluídos:**
- `artillery-health.yml` - Teste de health check
- `artillery-produtos.yml` - Teste de paginação
- `artillery-cache.yml` - Teste de cache
- `artillery-ratelimit.yml` - Teste de rate limiting
- `artillery-full.yml` - Teste completo (todos os endpoints)

**Como executar:**
```bash
# Instalar Artillery
npm install -g artillery

# Executar teste
artillery run artillery-full.yml

# Gerar relatório HTML
artillery run --output report.json artillery-full.yml
artillery report report.json
```

**Métricas validadas:**
- ✅ Latência (p50, p95, p99)
- ✅ Throughput (RPS)
- ✅ Taxa de erro
- ✅ Efetividade do cache
- ✅ Rate limiting

---

## Observabilidade & Healthcheck

Adicione endpoints simples para monitoramento e checagem de saúde da API. Útil para Docker, orquestradores (Kubernetes) e ferramentas de observabilidade.

### Endpoints

GET /health  
- Liveness probe.  
- Resposta (200 OK): {"status":"ok","uptime":12345.67,"timestamp":"2025-09-08T14:00:00.000Z"}  
- Resposta (500): {"status":"error","message":"database unreachable"}

GET /ready (opcional)  
- Readiness probe.  
- Resposta (200 OK): {"status":"ready","dependencies":{"database":"ok","cache":"ok"},"timestamp":"2025-09-08T14:00:00.000Z"}

GET /metrics (opcional — Prometheus)  
- Expor métricas para scraping.

### Implementação sugerida
- Criar módulo health com HealthController.  
- Para /metrics, usar prom-client.  
- Configurar probes no deployment.yaml (Kubernetes).

### Benefícios
- Facilita deploys e rollbacks em CI/CD.  
- Integra com Prometheus/Grafana.  
- Ajuda a distinguir problemas transitórios de falhas críticas.  

---

