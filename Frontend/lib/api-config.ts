/**
 * Lightweight API client without generated code.
 * Uses fetch + cookies for auth and hits backend /api/* endpoints.
 */
import Cookies from 'js-cookie';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api';

class ApiError extends Error {
  status: number;
  body: any;
  constructor(status: number, body: any) {
    super(typeof body === 'string' ? body : body?.detail || 'API error');
    this.status = status;
    this.body = body;
  }
}

async function request<T>(
  path: string,
  options: {
    method?: string;
    body?: any;
    auth?: boolean;
    headers?: Record<string, string>;
  } = {}
): Promise<T> {
  const { method = 'GET', body, auth = true, headers = {} } = options;
  const token = Cookies.get('access_token');

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      'Content-Type': body instanceof FormData ? undefined as unknown as string : 'application/json',
      ...(auth && token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body
      ? body instanceof FormData
        ? body
        : JSON.stringify(body)
      : undefined,
  });

  const text = await res.text();
  const data = text ? (() => { try { return JSON.parse(text); } catch { return text; } })() : null;

  if (!res.ok) {
    throw new ApiError(res.status, data);
  }
  return data as T;
}

// DTOs
export interface UserCreateDTO {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  city: string;
  interests: string[];
  about_me?: string;
  additional_interests: string;
}

export interface UserOutDTO extends Omit<UserCreateDTO, 'password'> {
  id: string;
}

export interface TokenDTO {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface RefreshTokenDTO {
  refresh_token: string;
}

export interface POIOutDTO {
  id: string;
  name: string;
  type: string;
  city: string;
  lat: number;
  lon: number;
  score: number;
  description: string;
}

// Services
export const TokenService = {
  async login(username: string, password: string): Promise<TokenDTO> {
    const form = new URLSearchParams();
    form.append('username', username);
    form.append('password', password);
    form.append('grant_type', 'password');
    return request<TokenDTO>('/token/get-token', {
      method: 'POST',
      body: form,
      auth: false,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
  },
  async refresh(dto: RefreshTokenDTO): Promise<TokenDTO> {
    return request<TokenDTO>('/token/refresh', { method: 'POST', body: dto, auth: false });
  },
  async currentUser(): Promise<UserOutDTO> {
    return request<UserOutDTO>('/token/current-user');
  },
};

export const UserService = {
  async register(dto: UserCreateDTO): Promise<UserOutDTO> {
    return request<UserOutDTO>('/user/register', { method: 'POST', body: dto, auth: false });
  },
  async addPoiToFavoritesEndpointApiUserFavoritesPoiIdPost(poiId: string): Promise<POIOutDTO> {
    return request<POIOutDTO>(`/user/favorites/${poiId}`, { method: 'POST' });
  },
  async getUserFavoritesEndpointApiUserFavoritesGet(): Promise<POIOutDTO[]> {
    return request<POIOutDTO[]>('/user/favorites');
  },
  async getUserInterestsEndpointApiUserInterestsGet(num = 3): Promise<string[]> {
    return request<string[]>(`/user/interests?num=${num}`);
  },
};

export const PoiService = {
  async searchPoiApiPoiGet(q: string, city?: string | null, limit = 10): Promise<POIOutDTO[]> {
    const params = new URLSearchParams({ q, limit: String(limit) });
    if (city) params.append('city', city);
    return request<POIOutDTO[]>(`/poi?${params.toString()}`);
  },
  async recommendPoiApiPoiRecommendationsGet(limit = 10): Promise<POIOutDTO[]> {
    return request<POIOutDTO[]>(`/rl/recommendations?limit=${limit}`);
  },
  async rlFeedback(poiId: string, reward: number): Promise<void> {
    await request('/rl/feedback', { method: 'POST', body: { poi_id: poiId, reward } });
  },
};

export { ApiError };
