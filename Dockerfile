# ============================================================================
# Whaileys Frontend - Dockerfile FINAL COM LIMPEZA DE CACHE
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

# CRÍTICO: Limpar cache do Vite e builds anteriores
RUN rm -rf node_modules/.vite dist

# Build do frontend (Vite) - agora completamente limpo
RUN pnpm vite build

# DEBUG: Mostrar o que foi gerado
RUN echo "=== Conteúdo de /app/dist/ ===" && \
    ls -la /app/dist/ && \
    echo "=== Conteúdo de /app/dist/public/ ===" && \
    ls -la /app/dist/public/ && \
    echo "=== Conteúdo de /app/dist/public/assets/ ===" && \
    ls -la /app/dist/public/assets/

# COPIAR arquivos estáticos para onde o servidor espera
RUN mkdir -p /app/server/_core/public && \
    cp -r /app/dist/public/* /app/server/_core/public/

# DEBUG: Confirmar que copiou
RUN echo "=== Conteúdo de /app/server/_core/public/ ===" && \
    ls -la /app/server/_core/public/ && \
    echo "=== index.html existe? ===" && \
    ls -la /app/server/_core/public/index.html && \
    echo "=== Conteúdo de /app/server/_core/public/assets/ ===" && \
    ls -la /app/server/_core/public/assets/

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
