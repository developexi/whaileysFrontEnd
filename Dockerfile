# ============================================================================
# Whaileys Frontend - Dockerfile FINAL CORRIGIDO
# ============================================================================

FROM node:20-alpine

WORKDIR /app

# Instalar dependências de build para bcrypt (python3, make, g++)
RUN apk add --no-cache python3 make g++

# Instalar pnpm
RUN npm install -g pnpm@latest

# Copiar arquivos de dependências E patches
COPY package.json pnpm-lock.yaml ./
COPY patches ./patches

# Instalar TODAS as dependências E COMPILAR bcrypt
RUN pnpm install --frozen-lockfile && \
    cd node_modules/.pnpm/bcrypt@5.1.1/node_modules/bcrypt && \
    npm run install

# Copiar código fonte completo
COPY . .

# Build do frontend (Vite)
RUN pnpm vite build

# COPIAR arquivos estáticos para onde o servidor espera encontrá-los
# O servidor roda com tsx a partir de /app/server/_core/index.ts
# e procura por arquivos em /app/server/_core/public
RUN mkdir -p /app/server/_core/public && \
    cp -r /app/dist/public/* /app/server/_core/public/

# Script de inicialização (copiar e dar permissão ANTES de trocar usuário)
COPY docker-entrypoint.sh /app/
RUN chmod +x /app/docker-entrypoint.sh

# Criar usuário não-root para segurança
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

# Usar usuário não-root
USER nodejs

# Expor porta
EXPOSE 3000

# Variáveis de ambiente padrão
ENV NODE_ENV=production \
    PORT=3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Comando de inicialização
ENTRYPOINT ["/app/docker-entrypoint.sh"]
