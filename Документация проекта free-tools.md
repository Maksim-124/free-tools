# Документация проекта free-tools.ru

Каталог бесплатных онлайн-инструментов с нечётким поиском, тёмной темой и аналитикой.

**Сайт:** https://free-tools.ru  
**Деплой:** GitHub Pages  

---

## Структура проекта

free-tools/  
├── index.html                 # Главная страница (каталог инструментов)  
├── scripts.js                 # Основная логика приложения  
├── tools.json                 # Источник данных: описание инструментов  
├── metrika.js                 # Web Component для Яндекс.Метрики  
├── carve-photos.html          # Шаблон обзорной страницы инструмента  
├── /tools/logos/              # Папка для логотипов инструментов (опционально)  
└── / (GitHub Pages root)      # Деплой на https://free-tools.ru/  

---

## Технологический стек

| Категория     | Технология                       | Назначение                                      |
|---------------|----------------------------------|-------------------------------------------------|
| Язык          | Vanilla JavaScript (ES6+)        | Логика приложения без фреймворков               |
| Разметка      | HTML5 + Custom Elements          | Семантическая структура, веб-компоненты         |
| Стили         | Tailwind CSS                     | Утилитарные классы, тёмная тема                 |
| Поиск         | Fuse.js v6.x                     | Нечёткий поиск по инструментам                  |
| Хранение      | localStorage                     | Сохранение темы пользователя                    |
| Аналитика     | Yandex Metrika                   | Трекинг через кастомный элемент <yandex-metrika> |
| Деплой        | GitHub Pages                     | Статический хостинг                             |
| Данные        | JSON (tools.json)                | Единый источник истины для каталога             |

---

## Архитектура и поток данных (текстовая схема)

1. Загрузка страницы  
   ↓  
2. DOMContentLoaded → initTheme() + loadTools()  
   ↓  
3. fetch('./tools.json') → normalizeData() → toolsData[]  
   ↓  
4. initFuse(toolsData) → индексация для поиска  
   ↓  
5. applyFilters() → renderTools() → генерация карточек  
   ↓  
6. События: поиск / категории / клик по карточке → обновление UI  

### Пояснение потока

- **initTheme** – применяет сохранённую тему (светлая/тёмная) из localStorage.  
- **normalizeData** – убирает лишние пробелы в ключах JSON (например, `"id "` → `"id"`).  
- **initFuse** – настраивает нечёткий поиск с весами по полям `title`, `searchTags`, `description`.  
- **applyFilters** – комбинирует фильтр по категории и поисковый запрос (через Fuse).  
- **renderTools** – очищает контейнер и отрисовывает карточки через `renderCard()`.  
- **debounce** – применяется к полю поиска (задержка 200 мс).  

---

## Ключевые функции scripts.js

| Функция            | Ответственность                                                   |
|--------------------|-------------------------------------------------------------------|
| initTheme()        | Переключение светлой/тёмной темы с сохранением в localStorage      |
| normalizeData()    | Исправление ключей JSON с лишними пробелами                        |
| initFuse()         | Настройка нечёткого поиска с весами по полям                       |
| renderCard()       | Генерация HTML карточки инструмента                                |
| showToolDetails()  | Открытие модального окна с подробной информацией                   |
| applyFilters()     | Комбинированная фильтрация: категория + поисковый запрос           |
| debounce()         | Оптимизация ввода в поиске (200 мс)                                |

---

## Структура данных tools.json

```json
{
  "id": "number",
  "popular": "boolean",
  "title": "string",
  "shortDescription": "string",
  "description": "string",
  "category": "office | design | ai | development | storage | conversion | marketing | other",
  "available": "yes | no",
  "link": "string (URL)",
  "logo": "string (filename, опционально)",
  "hashtags": ["string"],
  "searchTags": ["string"],
  "useCases": ["string"],
  "features": ["string"],
  "freeFeatures": "string",
  "paidFeatures": "string"
}

Описание полей

    id – уникальный числовой идентификатор

    popular – если true, на карточке показывается иконка 🔥

    title – название инструмента

    shortDescription – краткое описание (на карточке)

    description – полное описание (в модальном окне)

    category – одна из восьми категорий (см. выше)

    available – доступность в РФ (yes или no)

    link – прямая ссылка на сервис

    logo – имя файла в папке /tools/logos/ (опционально)

    hashtags – теги 

    searchTags – дополнительные ключевые слова для поиска

    useCases – сценарии использования

    features – список возможностей

    freeFeatures – что входит в бесплатный тариф

    paidFeatures – платные опции