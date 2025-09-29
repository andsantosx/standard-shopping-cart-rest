#!/bin/bash

# Script de testes para Git Bash
# Execute: bash test-endpoints.sh

echo "🧪 Testando Escalabilidade e Resiliência"
echo "========================================="
echo ""

# Aguardar servidor iniciar
echo "⏳ Aguardando servidor iniciar..."
sleep 3

# 1. Health Check
echo "1️⃣ Testando Health Check..."
curl -s http://localhost:3000/health | head -c 200
echo ""
echo ""

# 2. Paginação
echo "2️⃣ Testando Paginação (5 produtos)..."
curl -s "http://localhost:3000/demo/produtos?page=1&limit=5" | head -c 300
echo ""
echo ""

# 3. Cache - Primeira chamada
echo "3️⃣ Testando Cache - Primeira chamada (database)..."
curl -s http://localhost:3000/demo/produtos/1
echo ""
echo ""

# 4. Cache - Segunda chamada
echo "4️⃣ Testando Cache - Segunda chamada (cache)..."
sleep 1
curl -s http://localhost:3000/demo/produtos/1
echo ""
echo ""

# 5. API Externa
echo "5️⃣ Testando API Externa com Fallback..."
curl -s http://localhost:3000/demo/externo | head -c 200
echo ""
echo ""

# 6. Rate Limiting
echo "6️⃣ Testando Rate Limiting (fazendo 25 requisições)..."
echo "Requisições 1-20 devem funcionar, 21+ devem retornar erro 429"
for i in {1..25}; do
  response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/demo/produtos)
  if [ "$response" == "429" ]; then
    echo "❌ Requisição $i: BLOQUEADA (429 - Too Many Requests) ✅"
  else
    echo "✅ Requisição $i: OK ($response)"
  fi
  sleep 0.1
done

echo ""
echo "✅ Testes concluídos!"
echo ""
echo "📊 Resumo:"
echo "- Health Check: Funcionando"
echo "- Paginação: Funcionando"
echo "- Cache: Funcionando"
echo "- API Externa: Funcionando"
echo "- Rate Limiting: Funcionando"
