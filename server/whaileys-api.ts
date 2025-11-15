/**
 * Cliente para consumir a API Whaileys
 * Base URL: https://whaileysapi.exisistemas.com.br
 */

const WHAILEYS_API_URL = process.env.WHAILEYS_API_URL || 'https://whaileysapi.exisistemas.com.br';
const WHAILEYS_API_TOKEN = process.env.WHAILEYS_API_TOKEN || '';

export interface WhatsAppSession {
  id: string;
  sessionId: string;
  name?: string;
  number?: string;
  status: 'connected' | 'disconnected' | 'connecting';
  qrCode?: string;
  isConnected: boolean;
  createdAt: string;
  updatedAt: string;
  lastConnected?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Faz requisição autenticada para a API Whaileys
 */
async function fetchWhaileys<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${WHAILEYS_API_URL}${endpoint}`;
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Adiciona token de autenticação se disponível
  if (WHAILEYS_API_TOKEN) {
    headers['Authorization'] = `Bearer ${WHAILEYS_API_TOKEN}`;
  }

  // Merge com headers customizados
  if (options.headers) {
    Object.assign(headers, options.headers);
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(error.message || `API Error: ${response.status}`);
  }

  return response.json();
}

/**
 * Lista todas as sessões WhatsApp
 */
export async function listSessions(): Promise<WhatsAppSession[]> {
  const response = await fetchWhaileys<ApiResponse<WhatsAppSession[]>>('/api/sessions');
  return response.data || [];
}

/**
 * Obtém detalhes de uma sessão específica
 */
export async function getSession(sessionId: string): Promise<WhatsAppSession | null> {
  try {
    const response = await fetchWhaileys<ApiResponse<WhatsAppSession>>(`/api/sessions/${sessionId}`);
    return response.data || null;
  } catch (error) {
    console.error(`Erro ao buscar sessão ${sessionId}:`, error);
    return null;
  }
}

/**
 * Obtém o QR Code de uma sessão específica
 */
export async function getSessionQRCode(sessionId: string): Promise<string | null> {
  try {
    const response = await fetchWhaileys<ApiResponse<{ qrCode: string }>>(`/api/sessions/${sessionId}/qrcode`);
    return response.data?.qrCode || null;
  } catch (error) {
    console.error(`Erro ao buscar QR Code da sessão ${sessionId}:`, error);
    return null;
  }
}

/**
 * Cria uma nova sessão WhatsApp
 */
export async function createSession(sessionId: string): Promise<WhatsAppSession> {
  const response = await fetchWhaileys<ApiResponse<WhatsAppSession>>('/api/sessions', {
    method: 'POST',
    body: JSON.stringify({ sessionId }),
  });
  
  if (!response.data) {
    throw new Error(response.error || 'Erro ao criar sessão');
  }
  
  return response.data;
}

/**
 * Deleta uma sessão WhatsApp
 */
export async function deleteSession(sessionId: string): Promise<boolean> {
  try {
    await fetchWhaileys<ApiResponse<void>>(`/api/sessions/${sessionId}`, {
      method: 'DELETE',
    });
    return true;
  } catch (error) {
    console.error(`Erro ao deletar sessão ${sessionId}:`, error);
    return false;
  }
}

/**
 * Verifica status de saúde da API
 */
export async function checkHealth(): Promise<boolean> {
  try {
    await fetchWhaileys('/health');
    return true;
  } catch (error) {
    console.error('API Whaileys indisponível:', error);
    return false;
  }
}
