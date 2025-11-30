# StarTrail-AI Backend — RL Recommendations on Top of Semantic Search

Этот файл описывает, как работает рекомендательная система и слой RL поверх семантического поиска, в актуальной кодовой базе.

## Краткий обзор
- **Фреймворк:** FastAPI (Python 3.11)
- **Поиск:** SentenceTransformers (LaBSE) + FAISS IVF-PQ (nlist=128, nprobe=50, expand_k=1000) по эмбеддингам POI.
- **Рекомендации:** Семантический пул кандидатов → RL рерэнк (UCB bandit) с балансом explore/exploit.
- **Хранилище:** Postgres (async SQLAlchemy).
- **Auth:** JWT + refresh.
- **Данные:** `Model/Indexes/poi_ivfpq.index`, `Model/Dataset/poi_dataset_enriched_incremental.csv`.

## Как устроен семантический слой
1) Кодируем текстовый запрос/интересы LaBSE (`SentenceTransformer("sentence-transformers/LaBSE", device=cpu)`).
2) Ищем в FAISS IVF-PQ индексе, берем топ expand_k кандидатов.
3) Фильтруем по городу, тегам интересов (OSM-теги из `app/config/interest_tags.py`), опционально фильтр алкоголя.
4) Возвращаем кандидатов с полями `id, name, type, city, lat, lon, score, description`.

Этот слой не учится на фидбеке, он дает базовый пул по смыслу и тегам.

## Слой RL (что добавляет)
RL не ищет новые объекты, он **переупорядочивает** найденных семантикой кандидатов с учетом истории наград пользователя:
- **Exploit:** поднимать то, что уже получало положительный reward.
- **Explore:** давать шанс новым/неизведанным (UCB = +inf для unseen).

### Данные, которые хранит RL
Таблица `rl_interactions`:
- `id (uuid)`, `user_id`, `poi_id`, `reward (float)`, `created_at`.
Фидбек приходит через `POST /api/rl/feedback` с телом `{ "poi_id": "...", "reward": float }`.

### Алгоритм ранжирования (UCB)
1) Берем расширенный пул из семантики: `max(limit*5, 20)`.
2) Считаем статистику по пользователю: per-POI (`count`, `sum_reward`), общий `total`.
3) UCB:
   - если `count == 0` → `UCB = +inf` (explore);
   - иначе `avg_reward + exploration * sqrt(log(total)/count)`.
4) Сортируем по UCB, берем top-N.
5) **Cold-start:** если `total < min_feedback` (по умолчанию 3), отдаём семантический топ с `source=semantic` без рерэнка.

### Метаданные в ответе `/api/rl/recommendations`
Каждый POI содержит:
- `source`: `semantic` | `rl` | `explore`
- `ucb_score`: рассчитанный UCB (для explore может быть null)
- `avg_reward`: средняя награда по этому POI для пользователя
- `shown_count`: сколько фидбеков по этому POI (count)

### Поток end-to-end
1) Пользователь авторизован (JWT).
2) Фронт вызывает `GET /api/rl/recommendations`.
3) Семантика генерирует пул → RLService рерэнкует (или cold-start семантика) → возвращает top-N с метаданными.
4) Пользователь кликает лайк/дизлайк/«не показывать»/сохранить → фронт шлет `POST /api/rl/feedback` с reward.
5) `rl_interactions` обновляется, следующий вызов рекомендаций учитывает новую статистику.

## Ключевые файлы
- `app/services/POIService.py` — семантический поиск, базовые рекомендации.
- `app/services/RLService.py` — UCB рерэнк, cold-start, возврат метаданных, запись фидбека.
- `app/api/routes/RLRouter.py` — `GET /api/rl/recommendations`, `POST /api/rl/feedback`.
- `app/models/dbModels/RLInteraction.py` — модель фидбека.
- `app/infrastructure/repositories/RLInteractionRepository.py` — запись/агрегация фидбека.
- `app/models/dtoModels/POIOutDTO.py` — DTO с метаданными RL.

## API (RL)
- `GET /api/rl/recommendations?limit=10` — рерэнкованный список POI с метаданными.
- `POST /api/rl/feedback` — `{ "poi_id": "...", "reward": float }`.
Базовые эндпоинты семантики (`/api/poi`, `/api/poi/recommendations`) остаются как baseline.

## UI (что уже есть во фронте)
- Страница `/recommendations` использует `/rl/recommendations`.
- Бейджи источника/avg_reward/shown_count/ucb_score.
- Кнопки фидбека: лайк (+1), дизлайк (-1), «не показывать» (-0.5), добавление в избранное (шлет +1).

## Параметры
- Индекс: `Model/Indexes/poi_ivfpq.index`.
- Метаданные: `Model/Dataset/poi_dataset_enriched_incremental.csv`.
- RL: `exploration=1.2`, пул кандидатов `max(limit*5, 20)`, `min_feedback=3`.

## Что можно улучшить (не реализовано)
- A/B тест baseline (семантика) vs RL, сбор CTR/avg reward.
- Учёт показов отдельно от фидбека для более точного UCB.
- Перейти на нейросетевые методы (DQN/PPO) с признаками интересов/контекста/времени/истории.

## Запуск
- Dockerfile ставит torch 2.3.1+cpu, остальное из PyPI.
- Сборка/запуск: `docker-compose build app` (или `up --build`), затем `docker-compose up`.
- Frontend: Next.js (порт 3000 через nginx), Backend: FastAPI на 8000 (проксируется /api).
