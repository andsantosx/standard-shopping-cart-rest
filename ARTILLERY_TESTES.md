# 🎯 Guia Completo: Testes de Carga com Artillery CLI

Este guia mostra como usar o Artillery para testar a performance e escalabilidade da sua API NestJS.

---

## 📋 O que é Artillery?

Artillery é uma ferramenta moderna de teste de carga que permite:
- ✅ Simular múltiplos usuários simultâneos
- ✅ Medir latência e throughput
- ✅ Identificar gargalos de performance
- ✅ Testar escalabilidade
- ✅ Validar rate limiting

---

## 🚀 Passo 1: Instalação

### Instalar Artillery globalmente:

```bash
npm install -g artillery
```

### Verificar instalação:

```bash
artillery --version
```

Você deve ver algo como: `2.0.0` ou superior

---

## 📝 Passo 2: Criar Scripts de Teste

Vou criar vários scripts de teste para diferentes cenários.

### Script 1: Teste Básico de Health Check

Crie o arquivo `artillery-health.yml`:

```yaml
config:
  target: "http://localhost:3000"
  phases:
    - duration: 30
      arrivalRate: 5
      name: "Warm up"
    - duration: 60
      arrivalRate: 20
      name: "Sustained load"

scenarios:
  - name: "Health Check"
    flow:
      - get:
          url: "/health"
```

### Script 2: Teste de Paginação com Cache

Crie o arquivo `artillery-produtos.yml`:

```yaml
config:
  target: "http://localhost:3000"
  phases:
    - duration: 60
      arrivalRate: 10
      name: "Test pagination and cache"

scenarios:
  - name: "List products with pagination"
    flow:
      - get:
          url: "/demo/produtos?page=1&limit=10"
      - think: 1
      - get:
          url: "/demo/produtos?page=2&limit=10"
      - think: 1
      - get:
          url: "/demo/produtos?page=1&limit=20"
```

### Script 3: Teste de Cache Individual

Crie o arquivo `artillery-cache.yml`:

```yaml
config:
  target: "http://localhost:3000"
  phases:
    - duration: 60
      arrivalRate: 15
      name: "Test product cache"

scenarios:
  - name: "Get product by ID (cache test)"
    flow:
      - get:
          url: "/demo/produtos/{{ $randomNumber(1, 100) }}"
```

### Script 4: Teste de Rate Limiting

Crie o arquivo `artillery-ratelimit.yml`:

```yaml
config:
  target: "http://localhost:3000"
  phases:
    - duration: 30
      arrivalRate: 25
      name: "Trigger rate limit"

scenarios:
  - name: "Test rate limiting"
    flow:
      - get:
          url: "/demo/produtos"
          expect:
            - statusCode: [200, 429]
```

### Script 5: Teste Completo (Todos os Endpoints)

Crie o arquivo `artillery-full.yml`:

```yaml
config:
  target: "http://localhost:3000"
  phases:
    - duration: 30
      arrivalRate: 5
      name: "Warm up"
    - duration: 60
      arrivalRate: 15
      name: "Ramp up"
    - duration: 120
      arrivalRate: 30
      name: "Sustained load"
    - duration: 30
      arrivalRate: 5
      name: "Cool down"

scenarios:
  - name: "Mixed workload"
    weight: 40
    flow:
      - get:
          url: "/demo/produtos?page={{ $randomNumber(1, 10) }}&limit=10"
      - think: 2

  - name: "Product detail"
    weight: 30
    flow:
      - get:
          url: "/demo/produtos/{{ $randomNumber(1, 500) }}"
      - think: 3

  - name: "External API"
    weight: 20
    flow:
      - get:
          url: "/demo/externo"
      - think: 5

  - name: "Health check"
    weight: 10
    flow:
      - get:
          url: "/health"
      - think: 1
```

---

## 🧪 Passo 3: Executar os Testes

### Antes de começar:

1. **Certifique-se de que o servidor está rodando:**
   ```bash
   npm run start:dev
   ```

2. **Abra outro terminal para executar os testes**

### Executar testes individuais:

```bash
# Teste de health check
artillery run artillery-health.yml

# Teste de paginação
artillery run artillery-produtos.yml

# Teste de cache
artillery run artillery-cache.yml

# Teste de rate limiting
artillery run artillery-ratelimit.yml

# Teste completo
artillery run artillery-full.yml
```

### Executar com relatório HTML:

```bash
# Gera relatório visual
artillery run --output report.json artillery-full.yml
artillery report report.json
```

Isso abrirá um relatório HTML no navegador com gráficos e métricas detalhadas!

---

## 📊 Passo 4: Entender os Resultados

### Métricas Importantes:

#### 1. **Summary Report**
```
Summary report @ 16:59:15(-0300)
  Scenarios launched:  600
  Scenarios completed: 600
  Requests completed:  1200
  Mean response/sec:   20
  Response time (msec):
    min: 5
    max: 150
    median: 12
    p95: 45
    p99: 89
  Codes:
    200: 1150
    429: 50
```

**Análise:**
- ✅ **Scenarios launched/completed:** Todos os cenários completaram (sem timeouts)
- ✅ **Mean response/sec:** 20 requisições por segundo
- ✅ **Response time:**
  - `min: 5ms` - Resposta mais rápida (provavelmente cache hit)
  - `median: 12ms` - Metade das requisições em 12ms ou menos
  - `p95: 45ms` - 95% das requisições em 45ms ou menos
  - `p99: 89ms` - 99% das requisições em 89ms ou menos
- ✅ **Codes:**
  - `200: 1150` - Requisições bem-sucedidas
  - `429: 50` - Rate limit funcionando!

#### 2. **O que cada métrica significa:**

| Métrica | O que significa | Ideal |
|---------|-----------------|-------|
| **p50 (median)** | 50% das requisições | < 100ms |
| **p95** | 95% das requisições | < 200ms |
| **p99** | 99% das requisições | < 500ms |
| **RPS** | Requisições por segundo | Quanto maior, melhor |
| **Error rate** | Taxa de erro | < 1% |

---

## 🎯 Cenários de Teste Práticos

### Cenário 1: Validar Cache

**Objetivo:** Verificar se o cache está funcionando

```bash
artillery run artillery-cache.yml
```

**O que observar:**
- ✅ Primeira requisição: latência maior (cache miss)
- ✅ Requisições seguintes: latência menor (cache hit)
- ✅ p50 deve ser < 20ms com cache

### Cenário 2: Validar Rate Limiting

**Objetivo:** Confirmar que o rate limit está ativo

```bash
artillery run artillery-ratelimit.yml
```

**O que observar:**
- ✅ Códigos 200 no início
- ✅ Códigos 429 após atingir o limite
- ✅ Mensagem: "Too Many Requests"

### Cenário 3: Teste de Stress

**Objetivo:** Encontrar o limite da aplicação

Crie `artillery-stress.yml`:

```yaml
config:
  target: "http://localhost:3000"
  phases:
    - duration: 60
      arrivalRate: 50
      name: "High load"
    - duration: 60
      arrivalRate: 100
      name: "Very high load"
    - duration: 60
      arrivalRate: 200
      name: "Extreme load"

scenarios:
  - flow:
      - get:
          url: "/demo/produtos?page=1&limit=10"
```

```bash
artillery run artillery-stress.yml
```

**O que observar:**
- ⚠️ Em que ponto a latência aumenta drasticamente?
- ⚠️ Quantos RPS a aplicação aguenta?
- ⚠️ Há erros 5xx (erro do servidor)?

---

## 📈 Comparando Performance: Com e Sem Cache

### Teste 1: Sem Cache (primeira vez)

```bash
# Limpar cache do Redis (se estiver usando)
docker exec -it redis-stack redis-cli FLUSHALL

# Executar teste
artillery run artillery-cache.yml
```

**Resultado esperado:**
- Latência: ~100-200ms (busca no "banco")

### Teste 2: Com Cache (segunda vez)

```bash
# Executar teste novamente (cache populado)
artillery run artillery-cache.yml
```

**Resultado esperado:**
- Latência: ~5-20ms (busca no cache)
- **Melhoria: 10x mais rápido!** 🚀

---

## 🔧 Comandos Úteis do Artillery

### Teste rápido (quick test):

```bash
artillery quick --count 100 --num 10 http://localhost:3000/health
```

- `--count 100`: 100 requisições totais
- `--num 10`: 10 usuários virtuais

### Teste com variáveis de ambiente:

```bash
export TARGET_URL=http://localhost:3000
artillery run -e production artillery-full.yml
```

### Teste com payload JSON (POST):

```yaml
scenarios:
  - flow:
      - post:
          url: "/api/products"
          json:
            name: "Test Product"
            price: 99.99
```

---

## 📊 Exemplo de Relatório Completo

Após executar `artillery run --output report.json artillery-full.yml`:

```bash
artillery report report.json
```

O relatório HTML mostrará:

1. **Timeline de Requisições**
   - Gráfico mostrando RPS ao longo do tempo

2. **Latência**
   - Gráfico de percentis (p50, p95, p99)

3. **Códigos HTTP**
   - Distribuição de status codes

4. **Erros**
   - Lista de erros encontrados

5. **Scenarios**
   - Performance de cada cenário

---

## ✅ Checklist de Testes

Antes de considerar sua API pronta para produção:

- [ ] **Health check** responde em < 50ms
- [ ] **Paginação** funciona sob carga (100+ RPS)
- [ ] **Cache** reduz latência em 80%+
- [ ] **Rate limiting** bloqueia após o limite
- [ ] **p95 < 200ms** sob carga normal
- [ ] **p99 < 500ms** sob carga normal
- [ ] **Taxa de erro < 1%**
- [ ] **API aguenta 50+ RPS** sem degradação
- [ ] **Fallback** funciona quando API externa falha
- [ ] **Compressão** reduz tamanho das respostas

---

## 🎯 Metas de Performance

### Para a Atividade Prática:

| Métrica | Sem Cache | Com Cache | Melhoria |
|---------|-----------|-----------|----------|
| **Latência (p50)** | ~100ms | ~10ms | **10x** |
| **Latência (p95)** | ~200ms | ~20ms | **10x** |
| **RPS** | ~50 | ~500 | **10x** |
| **Taxa de erro** | < 1% | < 0.1% | **10x** |

---

## 🐛 Troubleshooting

### Problema: "ECONNREFUSED"

**Causa:** Servidor não está rodando

**Solução:**
```bash
npm run start:dev
```

### Problema: Latência muito alta

**Possíveis causas:**
1. Cache não está funcionando
2. Banco de dados lento
3. Muitas requisições simultâneas

**Soluções:**
1. Verificar logs do Redis
2. Adicionar índices no banco
3. Reduzir `arrivalRate`

### Problema: Muitos erros 429

**Causa:** Rate limit muito restritivo

**Solução:**
- Ajustar limites em `app.module.ts`
- Ou reduzir `arrivalRate` no teste

---

## 📚 Recursos Adicionais

- **Documentação Artillery:** https://www.artillery.io/docs
- **Exemplos:** https://github.com/artilleryio/artillery/tree/main/examples
- **Plugins:** https://www.artillery.io/docs/guides/plugins

---

## 🎓 Conclusão

Com o Artillery, você pode:

✅ **Validar escalabilidade** - Sua API aguenta a carga?  
✅ **Medir performance** - Quão rápida é sua API?  
✅ **Identificar gargalos** - Onde estão os problemas?  
✅ **Comparar soluções** - Cache vs Sem cache  
✅ **Garantir qualidade** - Antes de ir para produção  

---

**Projeto:** standard-shopping-cart-rest  
**Ferramenta:** Artillery CLI  
**Objetivo:** Testes de carga e performance
