# ============================================================================
# Whaileys Frontend - Dockerfile
# ============================================================================
# Multi-stage build para otimizar tamanho da imagem final
# ============================================================================

# ============================================================================
# Stage 1: Build
# ============================================================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar arquivos de dependências
COPY package.json pnpm-lock.yaml ./

# Instalar pnpm e dependências
RUN npm install -g pnpm@latest && \
    pnpm install --frozen-lockfile

# Copiar código fonte
COPY . .

# Build da aplicação (client + server)
RUN pnpm run build

# ============================================================================
# Stage 2: Production
# ============================================================================
FROM node:20-alpine

WORKDIR /app

# Instalar pnpm
RUN npm install -g pnpm@latest

# Copiar arquivos de dependências
COPY package.json pnpm-lock.yaml ./

# Instalar apenas dependências de produção
RUN pnpm install --prod --frozen-lockfile

# Copiar build da aplicação do stage anterior
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/client/dist ./client/dist

# Copiar arquivos necessários para runtime
COPY drizzle ./drizzle
COPY server ./server
COPY shared ./shared

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
  CMD node -e "require('http').get('http://localhost:3000/api/trpc/sessions.health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Comando de inicialização
CMD ["node", "dist/server/_core/index.js"]
