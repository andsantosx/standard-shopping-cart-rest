# 🐳 Redis Local com Docker - Guia Completo

Este guia mostra como configurar o Redis localmente usando Docker para desenvolvimento.

---

## 📋 Pré-requisitos

### Instalar Docker Desktop

1. **Download:**
   - Windows/Mac: https://www.docker.com/products/docker-desktop
   - Linux: https://docs.docker.com/engine/install/

2. **Instalar e iniciar o Docker Desktop**

3. **Verificar instalação:**
   ```bash
   docker --version
   ```

---

## 🚀 Passo 1: Executar Redis com Docker

### Opção 1: Redis Stack (Recomendado - inclui RedisInsight)

```bash
docker run -d \
  --name redis-stack \
  -p 6379:6379 \
  -p 8001:8001 \
  redis/redis-stack:latest
```

**O que este comando faz:**
- `-d` - Executa em segundo plano (detached)
- `--name redis-stack` - Nome do contêiner
- `-p 6379:6379` - Porta do Redis
- `-p 8001:8001` - Porta do RedisInsight (interface gráfica)
- `redis/redis-stack:latest` - Imagem oficial com RedisInsight

### Opção 2: Redis Simples (apenas Redis, sem interface)

```bash
docker run -d \
  --name redis \
  -p 6379:6379 \
  redis:latest
```

---

## ✅ Passo 2: Verificar se está Rodando

```bash
# Listar contêineres ativos
docker ps

# Você deve ver algo como:
# CONTAINER ID   IMAGE                    STATUS    PORTS
# abc123def456   redis/redis-stack:latest Up        0.0.0.0:6379->6379/tcp, 0.0.0.0:8001->8001/tcp
```

---

## 🎨 Passo 3: Acessar RedisInsight (Interface Gráfica)

Se você usou o Redis Stack:

1. Abra o navegador
2. Acesse: http://localhost:8001
3. Clique em "Connect to Redis Database"
4. Use as configurações padrão:
   - **Host:** localhost
   - **Port:** 6379
   - **Name:** Local Redis

Agora você pode visualizar suas chaves, executar comandos e monitorar o Redis em tempo real!

---

## 🔧 Passo 4: Configurar no Projeto NestJS

### 4.1 Atualizar arquivo `.env`

Crie ou edite o arquivo `.env` na raiz do projeto:

```env
# Redis Local (Docker)
REDIS_HOST=localhost
REDIS_PORT=6379
# Deixe vazio para Redis local sem senha
REDIS_PASSWORD=
REDIS_USERNAME=

# Application
PORT=3000
NODE_ENV=development
```

### 4.2 Iniciar o servidor

```bash
npm run start:dev
```

### 4.3 Verificar logs

Você deve ver:
```
🔄 Tentando conectar ao Redis...
✅ Redis conectado com sucesso!
[Nest] LOG [NestFactory] Starting Nest application...
```

---

## 🧪 Passo 5: Testar o Cache

### Teste 1: Cache básico

```bash
# Primeira chamada (cache miss - busca no "banco")
curl http://localhost:3000/demo/produtos/1

# Segunda chamada (cache hit - retorna do Redis)
curl http://localhost:3000/demo/produtos/1
```

### Teste 2: Verificar no RedisInsight

1. Abra http://localhost:8001
2. Vá em "Browser"
3. Você verá as chaves criadas: `demo:product:1`, `demo:external:data`, etc.
4. Clique em uma chave para ver seu valor e TTL

### Teste 3: Usar Redis CLI no Docker

```bash
# Entrar no contêiner
docker exec -it redis-stack redis-cli

# Comandos úteis:
KEYS *                    # Listar todas as chaves
GET demo:product:1        # Ver valor de uma chave
TTL demo:product:1        # Ver tempo restante (segundos)
DEL demo:product:1        # Deletar uma chave
FLUSHALL                  # Limpar tudo (cuidado!)
INFO memory               # Informações de memória
exit                      # Sair do CLI
```

---

## 🔄 Gerenciamento do Contêiner

### Comandos úteis:

```bash
# Parar o Redis
docker stop redis-stack

# Iniciar o Redis novamente
docker start redis-stack

# Reiniciar o Redis
docker restart redis-stack

# Ver logs do Redis
docker logs redis-stack

# Remover o contêiner (dados serão perdidos!)
docker rm -f redis-stack

# Ver uso de recursos
docker stats redis-stack
```

---

## 💾 Persistência de Dados

### Opção 1: Volume nomeado (Recomendado)

```bash
docker run -d \
  --name redis-stack \
  -p 6379:6379 \
  -p 8001:8001 \
  -v redis-data:/data \
  redis/redis-stack:latest
```

Agora os dados persistem mesmo se você remover o contêiner!

### Opção 2: Bind mount (pasta local)

```bash
docker run -d \
  --name redis-stack \
  -p 6379:6379 \
  -p 8001:8001 \
  -v $(pwd)/redis-data:/data \
  redis/redis-stack:latest
```

---

## 🐛 Troubleshooting

### Problema: "Port 6379 is already in use"

**Causa:** Outra aplicação está usando a porta 6379

**Soluções:**
1. Parar o outro serviço Redis
2. Usar outra porta:
   ```bash
   docker run -d --name redis-stack -p 6380:6379 -p 8001:8001 redis/redis-stack:latest
   ```
   E no `.env`: `REDIS_PORT=6380`

### Problema: "Cannot connect to Redis"

**Verificações:**
1. Docker está rodando?
   ```bash
   docker ps
   ```
2. Contêiner está ativo?
   ```bash
   docker logs redis-stack
   ```
3. Porta correta no `.env`?

### Problema: RedisInsight não abre

**Soluções:**
1. Verifique se a porta 8001 está mapeada:
   ```bash
   docker ps
   ```
2. Tente acessar: http://127.0.0.1:8001
3. Reinicie o contêiner:
   ```bash
   docker restart redis-stack
   ```

---

## 📊 Comparação: Redis Local vs Redis Cloud

| Aspecto | Redis Local (Docker) | Redis Cloud |
|---------|---------------------|-------------|
| **Setup** | ✅ Rápido (1 comando) | ⚠️ Requer conta |
| **Custo** | ✅ Grátis | ✅ Free tier (30MB) |
| **Performance** | ✅ Muito rápido (local) | ✅ Rápido (rede) |
| **Persistência** | ⚠️ Requer volume | ✅ Automática |
| **Acesso remoto** | ❌ Apenas local | ✅ De qualquer lugar |
| **Monitoramento** | ✅ RedisInsight local | ✅ Dashboard na nuvem |
| **Escalabilidade** | ❌ Limitado à máquina | ✅ Escalável |
| **Backup** | ⚠️ Manual | ✅ Automático |
| **Ideal para** | 🔧 Desenvolvimento | 🚀 Produção |

---

## 🎯 Quando usar cada um?

### Use Redis Local (Docker):
- ✅ Desenvolvimento local
- ✅ Testes rápidos
- ✅ Não quer depender de internet
- ✅ Quer controle total
- ✅ Aprendendo Redis

### Use Redis Cloud:
- ✅ Produção
- ✅ Múltiplos desenvolvedores
- ✅ Deploy em plataformas cloud
- ✅ Precisa de backup automático
- ✅ Quer monitoramento avançado

---

## 🔄 Docker Compose (Opcional)

Para facilitar ainda mais, crie um arquivo `docker-compose.yml`:

```yaml
version: '3.8'

services:
  redis:
    image: redis/redis-stack:latest
    container_name: redis-stack
    ports:
      - "6379:6379"
      - "8001:8001"
    volumes:
      - redis-data:/data
    restart: unless-stopped

volumes:
  redis-data:
```

**Comandos:**
```bash
# Iniciar
docker-compose up -d

# Parar
docker-compose down

# Ver logs
docker-compose logs -f redis
```

---

## ✅ Checklist de Instalação

- [ ] Docker Desktop instalado e rodando
- [ ] Contêiner Redis criado e ativo
- [ ] RedisInsight acessível em http://localhost:8001
- [ ] Arquivo `.env` configurado
- [ ] Servidor NestJS conectado ao Redis
- [ ] Cache testado e funcionando
- [ ] Redis CLI testado

---

## 📚 Recursos Adicionais

- **Docker Hub Redis:** https://hub.docker.com/_/redis
- **Redis Stack:** https://redis.io/docs/stack/
- **RedisInsight:** https://redis.io/docs/ui/insight/
- **Redis Commands:** https://redis.io/commands

---

**Projeto:** standard-shopping-cart-rest  
**Tecnologia:** NestJS + Redis + Docker  
**Objetivo:** Cache local para desenvolvimento
