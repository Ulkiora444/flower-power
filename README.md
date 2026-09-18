# Flower Game Sayt

Цветочный симулятор/игра про уход за растениями, развитие сада, заработок монет и торговлю на рынке. Проект состоит из Angular-клиента и NestJS backend с PostgreSQL.

## Что в проекте

- управление игроком: имя, монеты, ежедневная награда, покупка слотов для горшков;
- посадка семян и рост растений;
- полив, сбор урожая и продажа цветов;
- рынок с покупкой/продажей семян и цветов;
- система редкости растений и вероятностей выпадения семян;
- интерфейс на Angular, серверная логика на NestJS.

## Технологии

- Frontend: Angular 18
- Backend: NestJS 10
- База данных: PostgreSQL + TypeORM
- Сервинг статических ресурсов: NestJS Serve Static
- Запуск: npm scripts, batch-файл `start.bat`

## Структура проекта

```text
flower game sayt/
├── client/                  # Angular-приложение
│   ├── src/
│   ├── package.json
│   └── angular.json
├── server/                  # NestJS API
│   ├── src/
│   ├── test/
│   ├── flower_game_sayt_restored.sql
│   └── package.json
├── start.bat                # Быстрый запуск клиент + сервер
├── README.md                # Документация проекта
└── ...
```

## Требования

- Node.js 18+
- npm
- PostgreSQL 12+
- Git (опционально)

## Подготовка базы данных

В проекте сервер настроен на подключение к PostgreSQL локально:

- host: `localhost`
- port: `5432`
- username: `postgres`
- password: `postgres`
- database: `flower_game_sayt`

Если база ещё не создана, выполните следующие шаги:

1. Создайте базу данных `flower_game_sayt`.
2. При желании восстановите схему из файла:

```bash
psql -U postgres -d flower_game_sayt -f server/flower_game_sayt_restored.sql
```

Если у вас другая конфигурация PostgreSQL, откройте файл:

- `server/src/app.module.ts`

и измените параметры подключения в `TypeOrmModule.forRoot(...)`.

## Установка зависимостей

В корне проекта откройте два терминала и выполните:

```bash
cd client
npm install
```

```bash
cd server
npm install
```

## Запуск проекта

### Вариант 1: отдельный запуск

Frontend:

```bash
cd client
npm start
```

Backend:

```bash
cd server
npm run start:dev
```

После этого клиент будет доступен по адресу:

- http://localhost:4200

API сервера:

- http://localhost:3000/api

### Вариант 2: быстрый запуск через bat-файл

В корне проекта:

```bash
start.bat
```

Этот файл запускает клиент и сервер в отдельных окнах.

## Основные API endpoints

Основной префикс API: `/api`.

Примеры эндпоинтов (на уровне игрового модуля):

- `POST /api/game/player` — создать или загрузить игрока;
- `POST /api/game/actions/daily` — забрать ежедневную награду;
- `POST /api/game/actions/plant` — посадить семя;
- `POST /api/game/actions/water` — полить растение;
- `POST /api/game/actions/buy-pot` — купить дополнительный горшок;
- `POST /api/game/market/list` — выставить предмет на рынок;
- `POST /api/game/market/buy` — купить предмет с рынка.

Точный список маршрутов можно посмотреть в контроллерах в папке:

- `server/src/game/`

## Основные игровые механики

- игрок начинает с базовым набором монет и одним горшком;
- монеты можно зарабатывать через ежедневные награды и продажу цветов;
- семена имеют редкости: common, rare, epic, ancient, mysterious;
- для каждого растения есть характеристики роста, воды, увядания и стоимости;
- рынок позволяет обменивать ресурсы между игроками;
- можно расширять количество горшков для размещения большего количества растений.

## Полезные команды

### Клиент

```bash
cd client
npm run build
npm run test
```

### Сервер

```bash
cd server
npm run build
npm run test
npm run test:e2e
```
