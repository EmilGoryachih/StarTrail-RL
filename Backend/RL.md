# RL Layer (UCB) — Полное описание и разбор кода

Этот документ объясняет всю цепочку семантического поиска и RL-рерэнка, с привязкой к конкретным файлам проекта. Целевая аудитория — человек, который не читал код, но хочет понять/описать архитектуру и логику.

---
## 1. Общий обзор
- **Фреймворк:** FastAPI (Python 3.11), async SQLAlchemy, Postgres.
- **Поиск:** SentenceTransformers → FAISS IVF-PQ (nlist=128, nprobe=50, expand_k=1000) по эмбеддингам POI. В образе по умолчанию скачивается лёгкая модель `all-MiniLM-L6-v2` в `/usr/src/app/cache/all-MiniLM-L6-v2` (переменная `EMBED_MODEL` указывает туда). Для продакшена можно сменить `EMBED_MODEL` на `sentence-transformers/LaBSE` и пересобрать образ (или примонтировать свой кэш).
- **Рекомендации:** Семантический пул → RL-рерэнк (UCB bandit) с балансом explore/exploit и cold-start fallback.
- **Данные:** `Model/Dataset/poi_dataset_enriched_incremental.csv` (мета POI), `Model/Indexes/poi_ivfpq.index` (индекс FAISS).
- **Auth:** JWT + refresh (таблицы users, refresh_tokens).
- **Docker:** torch 2.3.1+cpu из cpu-репозитория, остальные зависимости из PyPI.

---
## 2. Семантический слой (генерация кандидатов)
**Код:** [`Backend/app/services/POIService.py`](Backend/app/services/POIService.py)

1. **Инициализация при старте**:
   - Загружаются: индекс FAISS (`Model/Indexes/poi_ivfpq.index`), CSV с метаданными (`Model/Dataset/poi_dataset_enriched_incremental.csv`), эмбеддер LaBSE (`SentenceTransformer("sentence-transformers/LaBSE", device="cpu")`).
   - Параметры FAISS: IVF-PQ, nlist=128, nprobe=50, expand_k=1000.
   - Настройка модели через переменную окружения `EMBED_MODEL`: по умолчанию для демо/быстрого старта используется локальный кэш `/app/cache/all-MiniLM-L6-v2` (модель `all-MiniLM-L6-v2`), для продакшена рекомендуется `sentence-transformers/LaBSE`.
2. **Функции**:
   - `search_in_city(query, city, tags, top_n, expand_k)`: кодирует запрос → FAISS search expand_k → фильтры (город, OSM-теги, алкоголь) → собирает `POIOutDTO`.
   - `recommend_by_interests(interests, additional_interests, city, top_n)`: перебирает интересы, вызывает `search_in_city`, уникализирует результаты.
3. **Входные данные**:
   - CSV с POI (id, name, type, city, lat, lon, enriched_description, tags).
   - Интересы пользователя (enum → OSM-теги в [`app/config/interest_tags.py`](Backend/app/config/interest_tags.py)).
4. **Метрики семантики** (из `Model/experiments`):
   - LaBSE: precision@5 ~0.837, precision@10 ~0.759; encode ~26.6 ms, search ~0.4 ms; индекс ~2–3 MB.
   - MiniLM-6/12: точность ниже, encode быстрее.

**Важно:** Семантический слой не учитывает фидбек; он даёт “глубокий” список кандидатов по смыслу и тегам.

---
## 3. RL-надстройка (UCB bandit)
**Код:** [`Backend/app/services/RLService.py`](Backend/app/services/RLService.py)

### 3.1 Суть
RL не ищет новые объекты, а **переупорядочивает** кандидатов семантики с учетом истории наград конкретного пользователя:
- Exploit: показывать чаще то, что приносило reward.
- Explore: давать шанс unseen объектам (UCB = +∞).

### 3.2 Данные RL
- Таблица `rl_interactions` (модель [`Backend/app/models/dbModels/RLInteraction.py`](Backend/app/models/dbModels/RLInteraction.py)):
  - `id (uuid)`, `user_id`, `poi_id`, `reward (float)`, `created_at`.
- Запись/агрегация: [`Backend/app/infrastructure/repositories/RLInteractionRepository.py`](Backend/app/infrastructure/repositories/RLInteractionRepository.py)
  - `add(user_id, poi_id, reward)`
  - `get_user_stats(user_id)` → per-POI `(count, sum_reward)`, `total`.

### 3.3 Алгоритм UCB (в `RLService.recommend`)
1) Сформировать пул из семантики: `candidate_pool_size = max(limit*5, 20)` через `POIService.recommend_by_interests`.
2) Если пул пуст → вернуть пустой список.
3) Получить статистику пользователя: per-POI `count, sum_reward`, общий `total`.
4) **Cold-start:** если `total < min_feedback` (порог = 3) → вернуть семантический топ с `source=semantic`, без рерэнка.
5) Для каждого кандидата:
   - Если `count == 0`: `ucb = +inf`, `avg_reward = 0.0`, `source = explore`.
   - Иначе: `avg_reward = sum_reward/count`, `ucb = avg_reward + c * sqrt(log(total)/count)`, `source = rl`, где `c = exploration` (по умолчанию 1.2).
6) Сортировать по UCB (inf наверху), взять top-N.
7) Вернуть `POIOutDTO` с метаданными: `source`, `ucb_score`, `avg_reward`, `shown_count (count)`.

**Формула:**  
UCB = avg_reward + c * sqrt( ln(total) / count ), если count>0; иначе UCB=+∞.

### 3.4 Запись фидбека
- Endpoint [`/api/rl/feedback`](Backend/app/api/routes/RLRouter.py) → `RLService.record_feedback` → `RLInteractionRepository.add`.
- DTO фидбека: [`RLFeedbackDTO`](Backend/app/models/dtoModels/RLFeedbackDTO.py): `{ poi_id: str, reward: float }`.
- Примеры reward с фронта (`/app/recommendations/page.tsx`):
  - Лайк: +1
  - Дизлайк: -1
  - «Не показывать»: -0.5
  - Добавить в избранное: +1 (+ POST в favorites).

### 3.5 Метаданные в ответе `/api/rl/recommendations`
- `source`: `semantic` | `rl` | `explore`
- `ucb_score`: число (для explore может быть null)
- `avg_reward`: средняя награда по POI
- `shown_count`: число фидбеков по POI (count)

### 3.6 Поток end-to-end
1) Пользователь авторизован (JWT).
2) Фронт вызывает `GET /api/rl/recommendations`.
3) Семантика генерирует пул → RL рерэнк или cold-start → ответ с метаданными.
4) Пользователь нажимает лайк/дизлайк/«не показывать»/добавить в избранное → фронт шлет `POST /api/rl/feedback` с reward.
5) Следующие рекомендации учитывают обновлённую статистику.

---
## 4. API (фокус на RL)
- `GET /api/rl/recommendations?limit=10` → список POI с метаданными (source/ucb_score/avg_reward/shown_count).
- `POST /api/rl/feedback` → `{ poi_id, reward }`.
- Базовый семантический поиск/baseline: `GET /api/poi`, `GET /api/poi/recommendations`.

---
## 5. Фронтенд (реализация)
- Страница: [`Frontend/app/recommendations/page.tsx`](Frontend/app/recommendations/page.tsx)
  - Запрашивает `/rl/recommendations`, показывает бэйджи source/avg_reward/shown_count/ucb_score.
  - Кнопки фидбека: лайк (+1), дизлайк (-1), «не показывать» (-0.5), добавление в избранное (шлет +1).
  - Клиент: [`Frontend/lib/api-config.ts`](Frontend/lib/api-config.ts) — методы `rlRecommendations`, `rlFeedback`.

---
## 6. Параметры и настройки
- FAISS: IVF-PQ, nlist=128, nprobe=50, expand_k=1000.
- RL: exploration `c=1.2`, candidate_pool_size `max(limit*5, 20)`, cold-start `min_feedback=3`.
- Данные: `poi_dataset_enriched_incremental.csv`, `poi_ivfpq.index`.

---
## 7. Метрики и результаты
- **Семантика (LaBSE)**: precision@5 ~0.837, precision@10 ~0.759; encode ~26.6 ms, search ~0.4 ms; индекс ~2–3 MB (см. `Model/experiments/README.md`).
- **FAISS**: время загрузки ~0.006 s, footprint ~2–3 MB.
- **RL**: агрегируемых KPI нет; сырые награды хранятся в `rl_interactions`. Для CTR/avg reward/regret нужен сбор показов и A/B.

---
## 8. Идеи/планы развития (не реализовано)
- A/B: baseline (семантика) vs RL; сбор CTR/avg reward.
- Раздельный учёт показов (impressions) и фидбеков → точнее UCB.
- Contextual bandits / нейросети (LinUCB, DQN/PPO) с признаками: интересы, контекст, время, история.
- Мониторинг/дашборд метрик.

---
## 9. Сборка и запуск
- Torch 2.3.1+cpu ставится отдельной командой в Dockerfile, остальное — из `requirements.txt`.
- Сборка: `docker-compose build app` (или `docker-compose up --build`), запуск: `docker-compose up`.
- nginx проксирует фронт (порт 3000) и backend `/api`.

---
## 10. Быстрые ссылки по коду
- Семантика: [`Backend/app/services/POIService.py`](Backend/app/services/POIService.py)
- RL: [`Backend/app/services/RLService.py`](Backend/app/services/RLService.py)
- Репозиторий фидбека: [`Backend/app/infrastructure/repositories/RLInteractionRepository.py`](Backend/app/infrastructure/repositories/RLInteractionRepository.py)
- Модель фидбека: [`Backend/app/models/dbModels/RLInteraction.py`](Backend/app/models/dbModels/RLInteraction.py)
- DTO: [`Backend/app/models/dtoModels/RLFeedbackDTO.py`](Backend/app/models/dtoModels/RLFeedbackDTO.py), [`Backend/app/models/dtoModels/POIOutDTO.py`](Backend/app/models/dtoModels/POIOutDTO.py)
- API: [`Backend/app/api/routes/RLRouter.py`](Backend/app/api/routes/RLRouter.py)
- Фронт: [`Frontend/app/recommendations/page.tsx`](Frontend/app/recommendations/page.tsx), [`Frontend/lib/api-config.ts`](Frontend/lib/api-config.ts)
