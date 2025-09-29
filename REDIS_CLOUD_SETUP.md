# 🚀 Guia de Configuração do Redis Cloud

Este guia mostra como configurar o Redis Cloud no seu projeto NestJS para ter um cache persistente e escalável na nuvem.

---

## 📋 Passo 1: Criar Conta no Redis Cloud

### 1.1 Acessar o Redis Cloud
1. Acesse: https://redis.com
2. Clique em **"Try Free"**
3. Crie uma conta usando:
   - Email
   - Google
   - GitHub

### 1.2 Verificar Email
- Verifique seu email se necessário
- Faça login no painel do Redis Cloud

---

## 🔧 Passo 2: Criar Instância Redis (Free Tier)

### 2.1 Criar Nova Database
1. No dashboard, clique em **"Create database"** ou **"New database"**
2. Selecione o plano **"Fixed"**
3. Escolha a opção **"Free"** (30MB, sem custo)

### 2.2 Configurar a Instância
- **Database name:** `cache-ecommerce` (ou outro nome descritivo)
- **Region:** Escolha a região mais próxima (ex: `us-east-1`)
- **Redis version:** Mantenha a mais recente
- **Eviction policy:** `allkeys-lru` (remove chaves menos usadas quando memória fica cheia)

### 2.3 Criar
- Clique em **"Create database"**
- Aguarde alguns segundos para provisionamento

---

## 🔑 Passo 3: Obter Credenciais de Conexão

### 3.1 Acessar Detalhes da Instância
1. Clique na instância que você criou
2. Procure pela seção **"Connection details"** ou **"General"**

### 3.2 Informações Importantes
Você precisará de:

- **Endpoint:** Algo como `redis-12345.c1.us-east-1-1.ec2.cloud.redislabs.com:12345`
  - **Host:** `redis-12345.c1.us-east-1-1.ec2.cloud.redislabs.com`
  - **Port:** `12345`
- **Password:** Uma senha gerada automaticamente (clique no ícone de olho para ver)
- **Username:** Geralmente `default` (pode não aparecer explicitamente)

### 3.3 Anotar Credenciais
⚠️ **IMPORTANTE:** Guarde essas informações em local seguro!

---

## 💻 Passo 4: Configurar no Projeto

### 4.1 Criar Arquivo .env
Na raiz do projeto, crie um arquivo `.env` com as credenciais:

```bash
# Redis Cloud Configuration
REDIS_HOST=redis-12345.c1.us-east-1-1.ec2.cloud.redislabs.com
REDIS_PORT=12345
REDIS_PASSWORD=sua-senha-aqui
REDIS_USERNAME=default

# Application
PORT=3000
NODE_ENV=development
```

**Substitua pelos valores reais do seu Redis Cloud!**

### 4.2 Verificar .gitignore
Certifique-se de que o `.env` está no `.gitignore`:

```
.env
```

---

## 🧪 Passo 5: Testar a Conexão

### 5.1 Iniciar o Servidor
```bash
npm run start:dev
```

### 5.2 Verificar Logs
Você deve ver uma das seguintes mensagens:

**✅ Sucesso (Redis Cloud conectado):**
```
🔄 Tentando conectar ao Redis Cloud...
[Nest] LOG [NestFactory] Starting Nest application...
```

**⚠️ Fallback (usando cache em memória):**
```
ℹ️  Redis Cloud não configurado. Usando cache em memória.
```

**❌ Erro de conexão:**
```
❌ Erro ao conectar com Redis Cloud: [mensagem de erro]
⚠️  Usando cache em memória como fallback
```

### 5.3 Testar Endpoints
```bash
# Teste o cache
curl http://localhost:3000/demo/produtos/1
curl http://localhost:3000/demo/produtos/1

# Teste API externa com cache
curl http://localhost:3000/demo/externo
curl http://localhost:3000/demo/externo
```

---

## 🔍 Passo 6: Monitorar no Dashboard

### 6.1 Acessar Métricas
1. Vá para o dashboard do Redis Cloud
2. Clique na sua instância
3. Visualize:
   - Operações por segundo
   - Uso de memória
   - Número de chaves armazenadas
   - Taxa de cache hit/miss

### 6.2 Usar Redis CLI (Web)
No dashboard, procure por **"Redis CLI"** ou **"Try Redis CLI"**

Teste comandos:
```redis
# Listar todas as chaves
KEYS *

# Listar chaves de produtos
KEYS product:*
KEYS demo:*

# Ver valor de uma chave
GET demo:product:1

# Ver tempo restante (TTL)
TTL demo:product:1

# Informações de memória
INFO memory

# Limpar tudo (cuidado!)
FLUSHALL
```

---

## 📊 Comparação: Cache em Memória vs Redis Cloud

| Característica | Cache em Memória | Redis Cloud |
|----------------|------------------|-------------|
| **Persistência** | ❌ Perde ao reiniciar | ✅ Persiste na nuvem |
| **Escalabilidade** | ❌ Limitado à máquina | ✅ Escalável |
| **Monitoramento** | ❌ Básico | ✅ Dashboard completo |
| **Compartilhamento** | ❌ Apenas local | ✅ Múltiplas instâncias |
| **Configuração** | ✅ Simples | ⚠️ Requer conta |
| **Custo** | ✅ Grátis | ✅ Free tier (30MB) |

---

## 🔧 Troubleshooting

### Problema: "Failed to connect to Redis Cloud"

**Possíveis causas:**
1. Credenciais incorretas
2. Firewall bloqueando conexão
3. IP não autorizado

**Soluções:**
1. Verifique as credenciais no `.env`
2. Verifique se o Redis Cloud permite conexões de qualquer IP
3. No dashboard do Redis Cloud, vá em **"Security"** → **"Allow list"** → Adicione `0.0.0.0/0` (desenvolvimento)

### Problema: "WRONGPASS invalid username-password pair"

**Solução:**
- Verifique a senha no `.env`
- Copie a senha novamente do dashboard do Redis Cloud
- Certifique-se de não ter espaços extras

### Problema: Cache não está funcionando

**Verificações:**
1. Servidor está rodando?
2. Arquivo `.env` existe na raiz do projeto?
3. Variáveis estão corretas?
4. Veja os logs do servidor

---

## 🎯 Vantagens do Redis Cloud

✅ **Sem instalação local** - Funciona em qualquer ambiente  
✅ **Sempre disponível** - Não depende da sua máquina  
✅ **Monitoramento** - Dashboard com métricas em tempo real  
✅ **Escalabilidade** - Fácil upgrade quando necessário  
✅ **Backup automático** - Dados seguros na nuvem  
✅ **Free tier generoso** - 30MB grátis para sempre  

---

## 📚 Recursos Adicionais

- **Documentação Redis Cloud:** https://docs.redis.com/latest/rc/
- **Redis Commands:** https://redis.io/commands
- **NestJS Caching:** https://docs.nestjs.com/techniques/caching

---

## ✅ Checklist de Configuração

- [ ] Conta criada no Redis Cloud
- [ ] Instância Redis criada (free tier)
- [ ] Credenciais anotadas
- [ ] Arquivo `.env` criado com credenciais
- [ ] Dependências instaladas (`cache-manager-redis-store`)
- [ ] Servidor iniciado sem erros
- [ ] Conexão com Redis Cloud bem-sucedida
- [ ] Cache testado e funcionando
- [ ] Dashboard do Redis Cloud acessado

---

**Projeto:** standard-shopping-cart-rest  
**Tecnologia:** NestJS + Redis Cloud  
**Objetivo:** Cache persistente e escalável na nuvem
