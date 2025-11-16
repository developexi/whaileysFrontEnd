#!/bin/sh
set -e

echo "🚀 Iniciando Whaileys Frontend..."

# Executar seed do usuário padrão (ignora erro se já existir)
echo "🌱 Verificando usuário padrão..."
npx tsx seed-default-user.ts || true

echo "✅ Iniciando servidor..."
exec npx tsx server/_core/index.ts
