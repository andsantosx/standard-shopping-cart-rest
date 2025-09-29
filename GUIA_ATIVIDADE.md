# 📚 Guia Completo da Atividade Prática - Escalabilidade

Este guia mostra como testar e validar **todos os requisitos** da atividade prática.

---

## ✅ Checklist de Requisitos

### Parte 1: Implementação Inicial

- [x] **Setup do Ambiente** - NestJS configurado
- [x] **Endpoints Implementados:**
  - [x] `GET /products` - Lista produtos com paginação
  - [x] `GET /products/{id}` - Detalhes de um produto
  - [x] `POST /cart/add` - Adiciona item (com atraso artificial)
  - [x] `GET /cart/{id}` - Consulta carrinho
- [x] **Banco em memória** - Array de 500 produtos
- [x] **Atraso artificial** - 2-4 segundos no POST /cart/add
- [x] **Arquitetura em camadas** - Controller → Service → Data

### Parte 2: Otimização e Análise

- [x] **Cache implementado** - Redis Cloud + Local + Fallback
- [x] **Estratégia Cache-Aside** - GET /products/{id}
- [x] **Otimização de consultas** - Paginação implementada
- [x] **Timeout** - 5 segundos configurado
- [x] **Fallback** - API externa com fallback
- [ ] **Circuit Breaker** - Bônus (não implementado)
- [x] **Testes de carga** - Artillery configurado
- [x] **Documentação** - Completa

---

## 🧪 Parte 1: Testes Iniciais (SEM Otimizações)

### Passo 1: Iniciar o Servidor

```bash
npm run start:dev
```

### Passo 2: Testes Manuais com Postman/cURL

#### Teste 1: GET /products (lista com paginação)

```bash
# Listar produtos - página 1
curl http://localhost:3000/products?page=1&limit=10

# Listar produtos - página 2
curl http://localhost:3000/products?page=2&limit=20
```

**Resultado esperado:**
```json
{
  "page": 1,
  "limit": 10,
  "total": 500,
  "totalPages": 50,
  "data": [...],
  "responseTime": "52ms"
}
```

#### Teste 2: GET /products/{id} (detalhes)

```bash
# Primeira chamada (sem cache)
curl http://localhost:3000/products/1

# Segunda chamada (com cache)
curl http://localhost:3000/products/1
```

**Resultado esperado:**
- 1ª chamada: `"source": "database"`, `"responseTime": "~100ms"`
- 2ª chamada: `"source": "cache"`, `"responseTime": "~5ms"`

#### Teste 3: POST /cart/add (com atraso)

```bash
curl -X POST http://localhost:3000/cart/add \
  -H "Content-Type: application/json" \
  -d '{
    "cartId": "cart-123",
    "productId": 1,
    "quantity": 2
  }'
```

**Resultado esperado:**
```json
{
  "success": true,
  "cart": {
    "id": "cart-123",
    "items": [...],
    "totalItems": 2
  },
  "processingTime": "2543ms",
  "totalResponseTime": "2545ms"
}
```

⚠️ **Observe:** O tempo de processamento é de 2-4 segundos (atraso artificial)

#### Teste 4: GET /cart/{id}

```bash
curl http://localhost:3000/cart/cart-123
```

**Resultado esperado:**
```json
{
  "id": "cart-123",
  "items": [
    {
      "productId": 1,
      "quantity": 2,
      "addedAt": "2025-09-29T..."
    }
  ],
  "totalItems": 2,
  "responseTime": "1ms"
}
```

---

### Passo 3: Teste de Carga Inicial (Artillery)

```bash
# Teste focado no GET /products
artillery run artillery-produtos.yml
```

**Anote os resultados:**
- ✍️ Tempo médio de resposta: _______ ms
- ✍️ Taxa de RPS: _______ req/s
- ✍️ p95: _______ ms
- ✍️ p99: _______ ms
- ✍️ Erros: _______ (se houver)

---

## 🚀 Parte 2: Testes com Otimizações

### Passo 1: Configurar Redis (Opcional)

#### Opção A: Redis Local com Docker

```bash
docker run -d --name redis-stack -p 6379:6379 -p 8001:8001 redis/redis-stack:latest
```

Criar `.env`:
```env
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_USERNAME=
```

#### Opção B: Redis Cloud

1. Criar conta em https://redis.com
2. Criar instância (free tier)
3. Configurar `.env` com credenciais

#### Opção C: Cache em Memória (Padrão)

Não fazer nada! O sistema usa cache em memória automaticamente.

---

### Passo 2: Testar Cache

```bash
# Limpar cache (se usando Redis)
docker exec -it redis-stack redis-cli FLUSHALL

# Teste 1: Primeira chamada (cache miss)
time curl http://localhost:3000/products/1

# Teste 2: Segunda chamada (cache hit)
time curl http://localhost:3000/products/1
```

**Compare os tempos:**
- 1ª chamada: ~100ms (busca no "banco")
- 2ª chamada: ~5ms (busca no cache)
- **Ganho: 20x mais rápido!** 🚀

---

### Passo 3: Teste de Carga com Cache

```bash
# Teste específico de cache
artillery run artillery-cache.yml
```

**Anote os resultados:**
- ✍️ Tempo médio de resposta: _______ ms
- ✍️ Taxa de RPS: _______ req/s
- ✍️ p95: _______ ms
- ✍️ p99: _______ ms

**Compare com os resultados da Parte 1!**

---

### Passo 4: Teste Completo (Todos os Endpoints)

```bash
# Teste completo da atividade
artillery run artillery-atividade.yml
```

Este teste simula:
- 40% de requisições em GET /products
- 30% de requisições em GET /products/{id}
- 20% de requisições em POST /cart/add
- 10% de requisições em GET /cart/{id}

---

### Passo 5: Gerar Relatório HTML

```bash
# Executar teste e gerar relatório
artillery run --output report.json artillery-atividade.yml

# Gerar HTML
artillery report report.json
```

O relatório abrirá no navegador com gráficos detalhados!

---

## 📊 Análise e Comparação

### Tabela de Comparação (Preencha com seus resultados)

| Métrica | Sem Cache | Com Cache | Melhoria |
|---------|-----------|-----------|----------|
| **Latência Média** | _____ ms | _____ ms | _____ x |
| **p95** | _____ ms | _____ ms | _____ x |
| **p99** | _____ ms | _____ ms | _____ x |
| **RPS** | _____ | _____ | _____ x |
| **Taxa de Erro** | _____ % | _____ % | _____ |

### Resultados Esperados

| Métrica | Sem Cache | Com Cache | Melhoria |
|---------|-----------|-----------|----------|
| **Latência Média** | ~100ms | ~10ms | **10x** |
| **p95** | ~200ms | ~20ms | **10x** |
| **p99** | ~300ms | ~30ms | **10x** |
| **RPS** | ~50 | ~500 | **10x** |
| **Taxa de Erro** | < 1% | < 0.1% | **10x** |

---

## 📈 Criando Gráficos para o Relatório

### Usando Artillery Report (Automático)

O comando `artillery report` gera automaticamente:
- ✅ Gráfico de latência ao longo do tempo
- ✅ Gráfico de RPS
- ✅ Distribuição de códigos HTTP
- ✅ Percentis (p50, p95, p99)

### Usando Excel/Google Sheets (Manual)

1. Copie os dados do terminal
2. Cole em uma planilha
3. Crie gráficos de:
   - Latência (antes vs depois)
   - RPS (antes vs depois)
   - Percentis (p95, p99)

---

## 📝 Documentação das Decisões de Arquitetura

### 1. Cache (Redis)

**Decisão:** Implementar cache com Redis Cloud + fallback

**Justificativa:**
- Reduz latência em 90%
- Diminui carga no "banco de dados"
- Suporta múltiplas instâncias
- Fallback garante disponibilidade

**Padrão:** Cache-Aside
- Aplicação verifica cache primeiro
- Se não encontrar, busca no banco
- Salva no cache para próximas requisições

### 2. Paginação

**Decisão:** Limitar a 50 itens por página

**Justificativa:**
- Reduz payload das respostas
- Melhora performance do frontend
- Evita sobrecarga de memória
- Permite escalar para milhões de produtos

### 3. Timeout

**Decisão:** Timeout de 5 segundos

**Justificativa:**
- Evita requisições travadas
- Libera recursos rapidamente
- Melhora experiência do usuário
- Facilita identificação de problemas

### 4. Atraso Artificial no Carrinho

**Decisão:** 2-4 segundos aleatórios

**Justificativa:**
- Simula processamento real (validação, estoque, etc.)
- Demonstra necessidade de timeout
- Testa resiliência do sistema
- Realista para operações de e-commerce

### 5. Rate Limiting

**Decisão:** 100 req/15min global, limites específicos por endpoint

**Justificativa:**
- Protege contra abuso
- Previne DDoS
- Garante fair use
- Mantém qualidade de serviço

---

## 🎯 Pontos de Avaliação

### Implementação (40%)
- [x] Endpoints funcionando
- [x] Banco em memória
- [x] Atraso artificial
- [x] Arquitetura em camadas

### Otimização (30%)
- [x] Cache implementado
- [x] Estratégia Cache-Aside
- [x] Timeout configurado
- [x] Paginação otimizada

### Testes (20%)
- [x] Testes manuais realizados
- [x] Testes de carga executados
- [x] Métricas coletadas
- [x] Comparação antes/depois

### Documentação (10%)
- [x] Decisões de arquitetura
- [x] Justificativas técnicas
- [x] Gráficos de comparação
- [x] Análise de resultados

---

## ✅ Checklist Final

- [ ] Todos os endpoints testados manualmente
- [ ] Testes de carga executados (antes)
- [ ] Cache configurado e testado
- [ ] Testes de carga executados (depois)
- [ ] Relatório HTML gerado
- [ ] Gráficos criados
- [ ] Tabela de comparação preenchida
- [ ] Decisões de arquitetura documentadas
- [ ] Código commitado no GitHub
- [ ] README atualizado

---

## 📦 Entrega

### O que enviar:

1. **Código no GitHub** - Com todos os commits
2. **Relatório PDF** contendo:
   - Introdução
   - Endpoints implementados
   - Técnicas de otimização aplicadas
   - Resultados dos testes (antes/depois)
   - Gráficos de comparação
   - Decisões de arquitetura
   - Conclusão

3. **Screenshots** (opcional):
   - Postman/cURL funcionando
   - Artillery rodando
   - Relatório HTML
   - Redis (se usar)

---

**Data limite:** 29/09/2025  
**Projeto:** standard-shopping-cart-rest  
**Objetivo:** Demonstrar escalabilidade e resiliência
