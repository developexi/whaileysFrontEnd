#!/bin/sh
set -e

echo "🚀 Iniciando Whaileys Frontend..."

# Executar seed do usuário padrão (ignora erro se já existir)
echo "🌱 Verificando usuário padrão..."
node dist/seed-default-user.js || true

echo "✅ Iniciando servidor..."
exec node dist/server/_core/index.js
