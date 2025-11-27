# API Client Usage

Клиент автоматически сгенерирован из OpenAPI схемы с использованием **axios**.

## Генерация клиента

```bash
# 1. Скачать openapi.json (если еще не скачан)
curl http://localhost/openapi.json -o openapi.json

# 2. Сгенерировать клиент с axios
npm run generate:client

# Или напрямую:
npx openapi-typescript-codegen --input openapi.json --output ./lib/api --client axios
```

## Использование

```typescript
import { UserService, TokenService, PoiService } from '@/lib/api-config';
import Cookies from 'js-cookie';

// Login
const tokens = await TokenService.loginForAccessTokenApiTokenGetTokenPost({
  formData: {
    username: 'user@example.com',
    password: 'password',
  }
});

Cookies.set('access_token', tokens.access_token);

// Get current user
const user = await TokenService.readUsersMeApiTokenCurrentUserGet();

// Register
await UserService.registerEndpointApiUserRegisterPost({
  requestBody: {
    first_name: 'John',
    last_name: 'Doe',
    email: 'john@example.com',
    password: 'password123',
    city: 'Moscow',
    interests: ['museums', 'parks'],
    about_me: 'Travel enthusiast',
    additional_interests: 'Photography'
  }
});

// Search POIs
const results = await PoiService.searchPoiApiPoiGet({
  q: 'museums',
  city: 'Moscow',
  limit: 10
});

// Get recommendations
const recommendations = await PoiService.recommendPoiApiPoiRecommendationsGet({
  limit: 15
});

// Add to favorites
await UserService.addPoiToFavoritesEndpointApiUserFavoritesPoiIdPost({
  poiId: 'some-poi-id'
});

// Get favorites
const favorites = await UserService.getUserFavoritesEndpointApiUserFavoritesGet();
```

## Обработка ошибок

```typescript
import { ApiError } from '@/lib/api-config';

try {
  const results = await PoiService.searchPoiApiPoiGet({ q: 'museums' });
} catch (error) {
  if (error instanceof ApiError) {
    console.error('API Error:', error.status, error.message);
    alert(`Error: ${error.message}`);
  }
}
```

## Конфигурация

Клиент настроен в `lib/api-config.ts`:
- BASE_PATH автоматически берется из переменной окружения
- Токен автоматически добавляется из cookies
- Все сервисы экспортируются для удобного импорта

