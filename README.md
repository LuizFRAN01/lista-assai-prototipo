# Protótipo de Lista de Compras — Assaí

Este pacote apresenta um protótipo funcional de uma lista de compras digital para clientes do Assaí. A ideia é permitir que a pessoa monte a compra antes de ir à loja, acompanhe uma estimativa de valor e copie a lista para compartilhar no WhatsApp.

## Conteúdo

- `codigo-lista-mooca/`: código-fonte completo do protótipo web em React + TypeScript.
- `visualizacao/index.html`: visualização simplificada e independente, que abre diretamente no navegador sem instalação.
- `PROPOSTA-EMAIL.md`: sugestão de mensagem para apresentar a ideia ao Assaí.

## Funcionalidades do protótipo

O protótipo atual tem catálogo local organizado por categorias, busca por nome ou marca, seleção de produtos, quantidades, subtotais, total estimado, salvamento local no navegador, cópia da lista em texto para o WhatsApp e importação/exportação de catálogo em JSON ou CSV.

Os preços no protótipo são demonstrativos. A versão oficial poderia receber dados autorizados do Assaí, preços por loja e data, ofertas, identificação por código de barras, login, sincronização em nuvem e um painel administrativo.

## Como executar o código completo

Requisitos: Node.js 20 ou superior e pnpm.

```bash
cd codigo-lista-mooca
pnpm install
pnpm dev:static
```

Depois, abra `http://localhost:3000`.

Para uma verificação de produção:

```bash
pnpm check
pnpm build:static
```

## Como abrir a visualização simples

Basta abrir `visualizacao/index.html` com duplo clique em qualquer navegador. Ela foi feita para demonstrar a experiência principal de forma rápida, sem depender de servidor, conta ou integração externa.

## Observação importante

Este é um protótipo independente e não é um aplicativo oficial do Assaí, não acessa sistemas internos e não representa uma integração autorizada. O objetivo é apresentar uma oportunidade de produto e uma experiência de uso que poderia ser desenvolvida em parceria com o Assaí.


React / Express / tRPC / Drizzle starter, adapted from the Sandbox web-db-user template.

- `pnpm dev`: development server; honors `PORT` (default 3000).
- `pnpm build` / `pnpm start`: build and serve `dist/index.js` and `dist/public/`.
- `pnpm db:migrate`: apply checked-in migrations. `pnpm db:push`: generate and apply new schema changes.
- `pnpm check` / `pnpm test`: types and application tests.

Start with the Webdev skill's default-template guide. Platform login, storage, payments and service contracts live in its shared references; read the relevant capability before extending its helper.

`server/_core/publicConfig.ts` exposes only named public runtime values. Private keys stay server-side. The platform serves managed `/manus-storage/` assets; the application does not register a second proxy.

Platform configuration is readable and editable through `webdev.config`. Default settings are initial values, not enforced constraints. The agent may modify the files, commands and configuration or follow the flexible guide for another stack.