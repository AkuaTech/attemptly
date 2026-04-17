# Prepper

JEE / NEET exam preparation platform. Practice PYQs, take mock tests, track your progress.

## Stack

- React 18 + Vite
- KaTeX for math rendering
- Vanilla CSS (no Tailwind)

## Getting started

```bash
npm install
npm run dev
```

## Project structure

```
src/
  components/   — TopNav, Sidebar, BottomNav, MathText
  pages/        — Dashboard, QuestionView, Analytics, MockTests, Subjects, Login, Onboarding
  data/         — Question bank (PYQ JSON)
  index.css     — Design tokens + all styles
```

## Status

Early frontend skeleton. No backend yet.
