# AGENTS.md — Project memory

> This file is the single source of truth for the project rules and product scope.
> Re-read it before every stage. Both sections below are copied verbatim from the
> original brief and must not be paraphrased.

## ПРАВИЛА

1. Работай строго по этапам 0–8. К следующему этапу не переходи, пока не
   пройдены проверки текущего.
2. Никогда не пиши «готово» или «проверено», не запустив команду. В отчёте
   приводи реальный вывод команд (последние строки). Если команду нельзя
   запустить, скажи об этом прямо и дай мне точную команду.
3. Не спрашивай «продолжать ли?». Закончил этап — напиши отчёт (сделано /
   проверено / найдено и исправлено) и сразу иди дальше. Спрашивай, только
   если действительно заблокирован. Иначе прими разумное допущение и запиши
   его в README.
4. Каждую найденную ошибку сначала воспроизведи тестом, потом исправь.
5. Маленькие коммиты в формате Conventional Commits (feat:, fix:, test:, docs:).
6. Если упёрся в лимит или ошибку модели, сохрани прогресс в PROGRESS.md
   и сообщи, на каком шаге остановился.

## ПРОДУКТ

- Неофициальный фан-сайт: игрок вручную отмечает открытые сундуки.
  НИКАКОГО API Epic Games, никакого парсинга.
- Без логотипов и ассетов Epic/Fortnite: только свои SVG-иконки и эмодзи.
- В футере: «Unofficial fan project, not affiliated with Epic Games».
- В v1 нет бэкенда: все данные в localStorage.
- Стек: Vite + React + TypeScript (strict, без any), Tailwind CSS, Zustand,
  zod, Vitest, Testing Library, Playwright, ESLint, Prettier,
  husky + lint-staged, GitHub Actions.
- Функции MVP:
  1. Большая кнопка «+1 сундук» и «−1» (не ниже 0).
  2. Типы: обычный, редкий, эпический, легендарный, золотой, особый
     + свои типы. Счётчик по каждому типу и общий итог.
  3. Матчи: «Начать/Закончить матч», статистика за матч, день, всё время.
  4. История: время, тип, удаление записи, Undo/Redo.
  5. Статистика и графики: по дням, среднее за матч, доли типов, рекорд матча.
  6. Цели и достижения с прогресс-баром.
  7. Экспорт/импорт JSON и CSV, «Сбросить всё» с подтверждением.
  8. Настройки: светлая/тёмная тема, язык RU/EN, горячие клавиши
     (Space = +1), звук клика (по умолчанию выключен).
  9. Адаптивность (телефон/планшет/ПК) и доступность (клавиатура, контраст, aria).
  10. Автосохранение в localStorage, данные переживают перезагрузку.
- Идеи на будущее (НЕ делать в MVP, только записать в docs/ROADMAP.md):
  аккаунты и облачная синхронизация, рейтинг игроков, оверлей для OBS,
  PWA, офлайн-режим.

## Working agreements (derived)

- Communicate with the user in Russian. Code, comments, commits and docs in English.
- Follow stages 0–8 in order; never skip a stage check.
- Every stage report must contain real command output.
- No `any` in TypeScript. No Epic Games / Fortnite assets, logos or trademarks.
- Footer must always contain: `Unofficial fan project, not affiliated with Epic Games`.

## Stage checklist

| Stage | Name | Status |
| ----- | ---- | ------ |
| A | AGENTS.md + docs/PROGRESS.md | see docs/PROGRESS.md |
| 0 | Plan (docs/PLAN.md) | see docs/PROGRESS.md |
| 1 | Repository bootstrap | see docs/PROGRESS.md |
| 2 | MVP features (10) | see docs/PROGRESS.md |
| 3 | Architecture & quality | see docs/PROGRESS.md |
| 4 | Tests | see docs/PROGRESS.md |
| 5 | Audit (Lighthouse, console, npm audit) | see docs/PROGRESS.md |
| 6 | CI/CD + GitHub Pages | see docs/PROGRESS.md |
| 7 | Beta (v0.1.0-beta) | see docs/PROGRESS.md |
| 8 | Release (v1.0.0) | see docs/PROGRESS.md |
