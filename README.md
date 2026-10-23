# Turma ADS

App para a turma de Análise e Desenvolvimento de Sistemas acompanhar **provas, entregas e materiais** num lugar só, com **lembretes por e-mail** antes de cada prazo.

## Stack

| Camada | Escolha | Por quê |
|---|---|---|
| Front | React 19 + TypeScript + Vite | Tipagem forte e build rápido |
| Estilo | Tailwind CSS 4 | Produtividade sem CSS solto |
| Dados | TanStack Query | Cache e sincronização com o servidor |
| Backend | Supabase (Postgres + Auth + Storage) | Banco relacional de verdade, com segurança por linha (RLS) |
| Testes | Vitest | Mesmo ecossistema do Vite |

## Modelo de dados

Tudo pertence a uma **turma**. Quem entra com o código de convite vira membro e passa a ver as matérias, os eventos e os materiais dela. Quem não é membro não vê nada: a regra fica no banco (RLS), não só na tela.

```
turmas ─┬─ turma_membros ── perfis
        ├─ materias ─┬─ materiais
        └─ eventos ──┘
```

O schema completo está em [`supabase/migrations/0001_schema_inicial.sql`](supabase/migrations/0001_schema_inicial.sql).

## Rodando localmente

```bash
npm install
cp .env.example .env.local   # preencha com URL e chave do Supabase
npm run dev
npm test
```

## Roadmap

- [x] Base do projeto, schema e RLS
- [x] Cálculo de prazo/urgência com testes
- [ ] Login (e-mail) e criar/entrar em turma
- [ ] Calendário de provas e entregas
- [ ] Materiais por matéria (links, PDFs, notas)
- [ ] Lembretes por e-mail (Edge Function + agendamento)
