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

