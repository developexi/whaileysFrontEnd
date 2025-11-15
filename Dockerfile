# ============================================================================
# Whaileys Frontend - Dockerfile (Production)
# ============================================================================
# Usa tsx para rodar TypeScript diretamente em produção
# ============================================================================

FROM node:20-alpine

WORKDIR /app

# Instalar pnpm
RUN npm install -g pnpm@latest

# Copiar arquivos de dependências E patches
COPY package.json pnpm-lock.yaml ./
COPY patches ./patches

# Instalar TODAS as dependências (incluindo devDependencies para tsx)
RUN pnpm install --frozen-lockfile

# Copiar código fonte completo
COPY . .

# Build apenas do frontend (client)
RUN pnpm run build:client || pnpm vite build

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
  CMD node -e "require('http').get('http://localhost:3000/api/trpc/auth.me', (r) => {process.exit(r.statusCode === 200 || r.statusCode === 401 ? 0 : 1)})"

# Comando de inicialização usando tsx (roda TypeScript diretamente)
CMD ["npx", "tsx", "server/_core/index.ts"]
