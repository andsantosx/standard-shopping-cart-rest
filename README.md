# Standard Shopping Cart (REST, NestJS)

API REST de **carrinho de compras** construída com **NestJS** e **TypeScript**.  
O objetivo é expor endpoints para **adicionar**, **atualizar** e **remover** itens do carrinho, com respostas e códigos HTTP padronizados, prontos para testes via **Postman** ou **cURL**.

> Observação  
> Este projeto parte do esqueleto padrão do NestJS (scripts `start`, `start:dev`, `start:prod`, `test`, `test:e2e`, `test:cov`). Caso você ainda não tenha alterado os scripts, utilize-os conforme a seção **Scripts** abaixo. 

---

## Sumário

- [Arquitetura](#arquitetura)
- [Requisitos](#requisitos)
- [Instalação e Execução](#instalação-e-execução)
- [Variáveis de Ambiente](#variáveis-de-ambiente)
- [Modelo de Dados](#modelo-de-dados)
- [Especificação da API](#especificação-da-api)
- [Criar/Obter carrinho](#criarobter-carrinho)
- [Adicionar item ao carrinho](#adicionar-item-ao-carrinho)
- [Atualizar item do carrinho](#atualizar-item-do-carrinho)
- [Excluir item do carrinho](#excluir-item-do-carrinho)
- [Códigos de status](#códigos-de-status)
- [Exemplos (cURL)](#exemplos-curl)
- [Testes](#testes)
- [Coleção Postman](#coleção-postman)
- [Padronização de código](#padronização-de-código)
- [Swagger (opcional)](#swagger-opcional)
- [Roadmap](#roadmap)
- [Licença](#licença)

---

## Arquitetura

- **NestJS (Node.js + TypeScript)** — Estrutura modular, com `controllers`, `services` e `DTOs`.
- **Armazenamento**: inicialmente **em memória** (para facilitar avaliação).  
  > Pode ser substituído por banco (ex.: PostgreSQL, SQLite, MongoDB) no futuro.
- **Validação**: via `class-validator`/`class-transformer` (recomendado).
- **Testes**: unitários e e2e com **Jest** (scripts padrão do NestJS).

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

yaml
Copiar código

---

## Requisitos

- Node.js 18+  
- npm 9+ (ou pnpm/yarn, se preferir)

---

## Instalação e Execução

```bash
# 1) Instalar dependências
npm install

# 2) Rodar em desenvolvimento (hot reload)
npm run start:dev

# 3) Produção (build + start)
npm run start:prod
Scripts como start, start:dev, start:prod, test, test:e2e e test:cov fazem parte do boilerplate do NestJS e devem estar no package.json deste projeto.

A API sobe por padrão em: http://localhost:3000

Variáveis de Ambiente
Crie um arquivo .env na raiz (opcional, mas recomendado):

env
Copiar código
PORT=3000
# DB_URL=postgres://user:pass@localhost:5432/cart   # (futuro)
O main.ts pode ler process.env.PORT para definir a porta.

Modelo de Dados
Cart (Carrinho)
json
Copiar código
{
  "id": "string",               // UUID do carrinho
  "items": [
    {
      "productId": "string",    // ID do produto
      "name": "string",         // Nome do produto (opcional)
      "price": 99.9,            // Preço unitário (>= 0)
      "quantity": 1             // Quantidade (>= 1, inteiro)
    }
  ],
  "total": 99.9                 // Soma de (price * quantity)
}
Regra: total é calculado no serviço sempre que itens são adicionados/atualizados/removidos.

Especificação da API
Base URL: http://localhost:3000

Criar/Obter carrinho
POST /carts
Cria um novo carrinho vazio.
201 Created → body com objeto Cart.

GET /carts/:cartId
Retorna o carrinho.
200 OK → body com Cart.
404 Not Found se não existir.

Adicionar item ao carrinho
POST /carts/:cartId/items
Body:

json
Copiar código
{
  "productId": "abc-123",
  "name": "Produto X",
  "price": 59.9,
  "quantity": 2
}
201 Created → item criado e carrinho atualizado.
400 Bad Request para corpo inválido.
404 Not Found se cartId não existir.

Comportamento sugerido:

Se o productId já estiver no carrinho, somar quantity (ou retornar 409; escolha e documente—neste README sugerimos somar para UX simples).

Atualizar item do carrinho
PUT /carts/:cartId/items/:productId
Body (exemplos):

json
Copiar código
{ "quantity": 3 }
ou

json
Copiar código
{ "price": 49.9, "quantity": 1 }
200 OK → item atualizado e carrinho recalculado.
400 Bad Request para corpo inválido.
404 Not Found se carrinho/item não existir.

Nota: Use PUT para atualização completa do item; PATCH poderia ser habilitado para alterações parciais.

Excluir item do carrinho
DELETE /carts/:cartId/items/:productId
200 OK (ou 204 No Content) ao remover.
404 Not Found se carrinho/item não existir.

Códigos de status
201 Created — criação de carrinho/itens.

200 OK — leitura/atualização/remoção bem-sucedida.

204 No Content — alternativa para remoção sem body.

400 Bad Request — corpo inválido, tipos incorretos, etc.

404 Not Found — carrinho ou item inexistente.

409 Conflict — conflito de regra de negócio (opcional).

500 Internal Server Error — erro inesperado.

Exemplos (cURL)
Criar carrinho
bash
Copiar código
curl -X POST http://localhost:3000/carts
Obter carrinho
bash
Copiar código
curl http://localhost:3000/carts/<CART_ID>
Adicionar item
bash
Copiar código
curl -X POST http://localhost:3000/carts/<CART_ID>/items \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "abc-123",
    "name": "Camisa",
    "price": 79.9,
    "quantity": 2
  }'
Atualizar item
bash
Copiar código
curl -X PUT http://localhost:3000/carts/<CART_ID>/items/abc-123 \
  -H "Content-Type: application/json" \
  -d '{"quantity": 3}'
Remover item
bash
Copiar código
curl -X DELETE http://localhost:3000/carts/<CART_ID>/items/abc-123
Testes
bash
Copiar código
# unit
npm run test

# end-to-end
npm run test:e2e

# cobertura
npm run test:cov
Recomendação: criar testes unitários para CartsService (cálculo de total, merge de itens), e2e para fluxos REST (criar → adicionar → atualizar → remover → obter).

Coleção Postman
Abra o Postman.

Crie uma Collection chamada “Shopping Cart REST”.

Adicione as requests:

POST /carts (salvar cartId usando Tests → pm.collectionVariables.set("cartId", pm.response.json().id)).

GET /carts/:cartId (use {{cartId}}).

POST /carts/:cartId/items (body raw JSON com o item).

PUT /carts/:cartId/items/:productId.

DELETE /carts/:cartId/items/:productId.

Exporte a collection se quiser versionar em postman/collection.json.

Padronização de código
ESLint/Prettier configurados (arquivos .prettierrc.js, eslint.config.mjs).

Recomenda-se Husky + lint-staged (opcional) para checar antes de commits.

Commits seguindo Conventional Commits (opcional).

Swagger (opcional)
Para documentação automática:

bash
Copiar código
npm i @nestjs/swagger swagger-ui-express
No main.ts:

ts
Copiar código
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

const config = new DocumentBuilder()
  .setTitle('Shopping Cart API')
  .setDescription('API REST do carrinho de compras')
  .setVersion('1.0')
  .build();

const document = SwaggerModule.createDocument(app, config);
SwaggerModule.setup('docs', app, document);
Acesse em: http://localhost:3000/docs

Roadmap
 Persistência em banco relacional (TypeORM/Prisma).

 Autenticação/JWT e carrinho por usuário.

 Política de merge vs. conflito ao adicionar item existente.

 Descontos, cupons e frete.

 Integração com microsserviço de Produtos.

 Versionamento de API (/v1, /v2).

 Observabilidade (logger estruturado, métricas Prometheus).

 Dockerfile + docker-compose.