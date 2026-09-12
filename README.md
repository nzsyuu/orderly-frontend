# Orderly Frontend

Frontend da gestão de lanchonetes (estoque, produtos e vendas). Consome a API Java local.

## Pré-requisitos

- Node.js 24 LTS
- npm 11+

No PowerShell com Execution Policy `Restricted`, use `npm.cmd` e `npx.cmd` em vez de `npm` / `npx`.

## Como rodar

```bash
cp .env.example .env.local
npm install
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000). A home redireciona para `/estoque`.

Com a API Java no ar (`http://localhost:8080` por padrão):

1. `/cadastro` — cria a conta (`POST /api/auth/register`)
2. `/verificar` — confirma o token (`GET /api/auth/verify?token=`)
3. `/login` — entra e grava o cookie JWT

A conta nasce desabilitada. Sem verificação o login é recusado. O e-mail do backend aponta para `http://localhost:8080/api/auth/verify?token=...`; no front use `/verificar?token=...`. Se o Resend não estiver configurado, o e-mail não chega — cole o token na tela de verificação.

## Variáveis de ambiente

| Variável              | Padrão                  | Uso                                                                      |
| --------------------- | ----------------------- | ------------------------------------------------------------------------ |
| `NEXT_PUBLIC_API_URL` | vazio (same-origin)     | Deixe vazio para o proxy `/api` do Next. Não aponte direto à porta 8080. |
| `API_PROXY_TARGET`    | `http://localhost:8080` | Destino do proxy no servidor Next                                        |

A API Java exige JWT no cookie `token`. O Next encaminha `/api/*` para o backend e devolve o `Set-Cookie` no `localhost:3000`, evitando CORS e o bloqueio de cookie entre portas. Em `localhost` HTTP o proxy remove `Domain` e `Secure` do cookie; em HTTPS de produção essas flags são preservadas.

Rotas autenticadas (`/estoque`, `/produtos`) exigem o cookie `token` no middleware do Next.

Contrato atual (branch `produto-estoque.v2`):

- Produtos: `GET/POST /api/products`, `PATCH/DELETE /api/products/{id}`, composições com `PATCH` de quantidade e `DELETE`
- Estoque: `GET /api/stock-items` (listagem global provisória), `PATCH/DELETE /api/stock-items/{id}`, movimentações iguais

## Scripts

| Script              | Descrição                      |
| ------------------- | ------------------------------ |
| `npm run dev`       | Dev server (Turbopack)         |
| `npm run build`     | Build de produção              |
| `npm run lint`      | ESLint                         |
| `npm run typecheck` | TypeScript sem emitir arquivos |
| `npm run format`    | Prettier                       |

## Arquitetura (módulos por feature)

Código agrupado por feature (`auth`, `inventory`, `products`, `shell`):

```
src/
  app/                 rotas Next, proxy /api, middleware de auth
  shared/              http, env, ui, utils
  modules/<feature>/
    components/        telas e UI
    hooks/             React Query / estado da feature
    api/               cliente HTTP + interface do repositório
    types/             tipos e regras puras
    schemas/           Zod (formulário e resposta da API)
```

Fluxo: **components** → **hooks** → **api** → API Java.

- Componentes não importam Axios
- Pre-commit (Husky) roda `lint` + `typecheck` antes de cada commit

## Escopo atual

- Tela de estoque (busca, filtro, cards, tabela)
- Tela de produtos (catálogo, criação, composição no drawer)
- Menu: Painel, Vendas e Fornecedores visíveis e desabilitados (sem rota ainda)
