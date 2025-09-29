# 🧪 Guia de Testes - Escalabilidade e Resiliência

Este documento contém exemplos práticos para testar todas as funcionalidades de escalabilidade e resiliência implementadas no projeto.

## 📋 Pré-requisitos

1. Certifique-se de que o servidor está rodando:
```bash
npm run start:dev
```

2. O servidor deve estar disponível em: `http://localhost:3000`

---

## 🧪 Testes de Funcionalidades

### 1. ✅ Health Check (Monitoramento)

**Objetivo:** Verificar o status do sistema

```bash
curl http://localhost:3000/health
```

**Resposta esperada:**
```json
{
  "status": "ok",
  "timestamp": "2025-09-29T19:27:00.000Z",
  "uptime": 123.45,
  "memoryUsage": {
    "rss": 50000000,
    "heapTotal": 20000000,
    "heapUsed": 15000000
  },
  "nodeVersion": "v18.0.0",
  "platform": "win32"
}
```

---

### 2. 📄 Paginação

**Objetivo:** Testar a paginação de produtos

**Teste 1: Primeira página (10 itens)**
```bash
curl "http://localhost:3000/demo/produtos?page=1&limit=10"
```

**Teste 2: Segunda página (20 itens)**
```bash
curl "http://localhost:3000/demo/produtos?page=2&limit=20"
```

**Teste 3: Limite máximo (50 itens)**
```bash
curl "http://localhost:3000/demo/produtos?page=1&limit=50"
```

**Teste 4: Tentativa de exceder limite (deve retornar apenas 50)**
```bash
curl "http://localhost:3000/demo/produtos?page=1&limit=100"
```

**Resposta esperada:**
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

---

### 3. 💾 Cache

**Objetivo:** Verificar o funcionamento do cache

**Teste 1: Primeira chamada (sem cache)**
```bash
curl http://localhost:3000/demo/produtos/1
```
**Resultado:** `"source": "database"`

**Teste 2: Segunda chamada imediata (com cache)**
```bash
curl http://localhost:3000/demo/produtos/1
```
**Resultado:** `"source": "cache"`

**Teste 3: Aguarde 1 minuto e faça nova chamada (cache expirado)**
```bash
# Aguarde 60 segundos
timeout 60
curl http://localhost:3000/demo/produtos/1
```
**Resultado:** `"source": "database"` (cache expirou)

---

### 4. 🌐 API Externa com Cache, Timeout e Fallback

**Objetivo:** Testar integração com API externa

**Teste 1: Primeira chamada (busca da API externa)**
```bash
curl http://localhost:3000/demo/externo
```
**Resultado esperado:** `"source": "live"`

**Teste 2: Segunda chamada (retorna do cache)**
```bash
curl http://localhost:3000/demo/externo
```
**Resultado esperado:** `"source": "cache"`

**Teste 3: Simular falha (desconecte a internet ou aguarde timeout)**
- Se a API externa falhar, o sistema retorna um fallback
**Resultado esperado:** `"source": "fallback"`

---

### 5. 🚦 Rate Limiting (Proteção contra Abuso)

**Objetivo:** Testar o limite de requisições

#### Teste no Windows PowerShell:

```powershell
# Fazer 25 requisições rapidamente (limite é 20/min)
for ($i=1; $i -le 25; $i++) { 
  $response = curl http://localhost:3000/demo/produtos -UseBasicParsing
  Write-Host "Request $i - Status: $($response.StatusCode)"
  Start-Sleep -Milliseconds 100
}
```

**Resultado esperado:**
- Requisições 1-20: Status 200 (OK)
- Requisições 21+: Status 429 (Too Many Requests)

```json
{
  "statusCode": 429,
  "message": "ThrottlerException: Too Many Requests"
}
```

#### Teste no Linux/Mac:

```bash
# Fazer 25 requisições rapidamente
for i in {1..25}; do
  echo "Request $i"
  curl http://localhost:3000/demo/produtos
  sleep 0.1
done
```

---

### 6. 📦 Compressão GZIP

**Objetivo:** Verificar se as respostas estão sendo comprimidas

```bash
curl -H "Accept-Encoding: gzip" -i http://localhost:3000/demo/produtos?page=1&limit=50
```

**Verifique nos headers da resposta:**
```
Content-Encoding: gzip
```

**Comparação de tamanho:**

Sem compressão:
```bash
curl http://localhost:3000/demo/produtos?page=1&limit=50 | wc -c
```

Com compressão:
```bash
curl -H "Accept-Encoding: gzip" --compressed http://localhost:3000/demo/produtos?page=1&limit=50 | wc -c
```

A resposta comprimida deve ser significativamente menor (até 70% de redução).

---

## 📊 Teste de Carga (Opcional)

### Usando Apache Bench (ab)

Instale o Apache Bench e execute:

```bash
# 1000 requisições, 10 concorrentes
ab -n 1000 -c 10 http://localhost:3000/demo/produtos
```

### Usando Artillery (Node.js)

```bash
npm install -g artillery

# Criar arquivo de teste: load-test.yml
artillery quick --count 100 --num 10 http://localhost:3000/demo/produtos
```

---

## ✅ Checklist de Validação

Marque cada item após testar:

- [ ] Health check retorna status 200 com informações do sistema
- [ ] Paginação funciona com diferentes valores de page e limit
- [ ] Limite máximo de 50 itens por página é respeitado
- [ ] Cache funciona na primeira e segunda chamada
- [ ] Cache expira após 1 minuto
- [ ] API externa retorna dados com sucesso
- [ ] Fallback funciona quando API externa falha
- [ ] Rate limiting bloqueia após 20 requisições/minuto
- [ ] Compressão GZIP está ativa (header Content-Encoding)
- [ ] Timeout de 5 segundos está configurado

---

## 🎯 Demonstração para Avaliação

Para demonstrar as funcionalidades implementadas:

1. **Inicie o servidor:**
   ```bash
   npm run start:dev
   ```

2. **Mostre o Health Check:**
   ```bash
   curl http://localhost:3000/health
   ```

3. **Demonstre a Paginação:**
   ```bash
   curl "http://localhost:3000/demo/produtos?page=1&limit=10"
   curl "http://localhost:3000/demo/produtos?page=2&limit=10"
   ```

4. **Demonstre o Cache:**
   ```bash
   # Primeira chamada (database)
   curl http://localhost:3000/demo/produtos/1
   
   # Segunda chamada (cache)
   curl http://localhost:3000/demo/produtos/1
   ```

5. **Demonstre o Rate Limiting:**
   ```powershell
   # Execute 25 requisições e mostre o erro 429
   for ($i=1; $i -le 25; $i++) { 
     curl http://localhost:3000/demo/produtos
   }
   ```

6. **Demonstre o Fallback:**
   ```bash
   # Mostre que a API externa funciona
   curl http://localhost:3000/demo/externo
   ```

---

## 📝 Notas Importantes

- **Rate Limiting Global:** 100 requisições por 15 minutos por IP
- **Rate Limiting por Endpoint:**
  - `/demo/produtos`: 20 req/min
  - `/demo/externo`: 10 req/min
- **Cache TTL:** 1 minuto (60.000ms)
- **HTTP Timeout:** 5 segundos
- **Compressão:** Automática para todas as respostas

---

## 🎓 Conceitos Demonstrados

### Escalabilidade:
- ✅ **Compressão GZIP** - Reduz uso de banda
- ✅ **Cache em Memória** - Reduz carga no backend
- ✅ **Paginação** - Permite lidar com grandes volumes

### Resiliência:
- ✅ **Rate Limiting** - Protege contra abuso
- ✅ **Timeout** - Evita travamentos
- ✅ **Fallback** - Garante disponibilidade

### Monitoramento:
- ✅ **Health Check** - Facilita observabilidade

---

**Projeto:** standard-shopping-cart-rest  
**Tecnologias:** NestJS, TypeScript, @nestjs/throttler, @nestjs/cache-manager, compression  
**Objetivo:** Demonstrar técnicas de escalabilidade e resiliência em APIs REST
