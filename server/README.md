<p align="center">
  <a href="https://www.medusajs.com">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://user-images.githubusercontent.com/59018053/229103275-b5e482bb-4601-46e6-8142-244f531cebdb.svg">
    <source media="(prefers-color-scheme: light)" srcset="https://user-images.githubusercontent.com/59018053/229103726-e5b529a3-9b3f-4970-8a1f-c6af37f087bf.svg">
    <img alt="Medusa logo" src="https://user-images.githubusercontent.com/59018053/229103726-e5b529a3-9b3f-4970-8a1f-c6af37f087bf.svg">
    </picture>
  </a>
</p>
<h1 align="center">
  Medusa
</h1>

<h4 align="center">
  <a href="https://docs.medusajs.com">Documentation</a> |
  <a href="https://www.medusajs.com">Website</a>
</h4>

<p align="center">
  Building blocks for digital commerce
</p>
<p align="center">
  <a href="https://github.com/medusajs/medusa/blob/master/CONTRIBUTING.md">
    <img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat" alt="PRs welcome!" />
  </a>
    <a href="https://www.producthunt.com/posts/medusa"><img src="https://img.shields.io/badge/Product%20Hunt-%231%20Product%20of%20the%20Day-%23DA552E" alt="Product Hunt"></a>
  <a href="https://discord.gg/xpCwq3Kfn8">
    <img src="https://img.shields.io/badge/chat-on%20discord-7289DA.svg" alt="Discord Chat" />
  </a>
  <a href="https://twitter.com/intent/follow?screen_name=medusajs">
    <img src="https://img.shields.io/twitter/follow/medusajs.svg?label=Follow%20@medusajs" alt="Follow @medusajs" />
  </a>
</p>

## Compatibility

This starter is compatible with versions >= 2 of `@medusajs/medusa`. 

## Getting Started

Visit the [Quickstart Guide](https://docs.medusajs.com/learn/installation) to set up a server.

Visit the [Docs](https://docs.medusajs.com/learn/installation#get-started) to learn more about our system requirements.

## Database

This project uses a [Neon](https://neon.tech) serverless PostgreSQL database. The connection string is set as `DATABASE_URL` in `.env`. Use Neon's **pooled** connection string (the host containing `-pooler`).

```bash
DATABASE_URL=postgresql://<user>:<password>@<endpoint>-pooler.<region>.aws.neon.tech/<db>?sslmode=require
```

Run migrations after setting it:

```bash
npx medusa db:migrate
```

If the server can't connect and the error shows `getaddrinfo EAI_AGAIN ...neon.tech`, your network's DNS can't resolve the Neon host. Switch to a public DNS such as `1.1.1.1` or `8.8.8.8`.

### Local Postgres for development

Neon is far from a development machine in India, and Medusa runs many queries per request, so a local database is much faster.

```bash
# once, as the postgres superuser
sudo -u postgres psql \
  -c "CREATE ROLE apex LOGIN PASSWORD 'apex_local' CREATEDB;" \
  -c "CREATE DATABASE apex_grips OWNER apex;"
```

Set `DATABASE_URL=postgres://apex:apex_local@127.0.0.1:5432/apex_grips` in `.env`, then set up any new database (local or Neon) with:

```bash
npx medusa db:migrate                                   # tables + Medusa defaults + demo data
npx medusa exec ./src/scripts/seed-apex-catalog.ts      # India store setup and the Apex catalog
npx medusa exec ./src/scripts/remove-demo-data.ts       # drop the demo products
npx medusa user -e <email> -p <password>                # admin login
```

Each database has its own publishable key (Admin → Settings → Publishable API Keys). Put it in `client/.env.development.local`, which overrides `client/.env.development` and isn't committed. The search index fills the first time the server starts.

## What is Medusa

Medusa is a set of commerce modules and tools that allow you to build rich, reliable, and performant commerce applications without reinventing core commerce logic. The modules can be customized and used to build advanced ecommerce stores, marketplaces, or any product that needs foundational commerce primitives. All modules are open-source and freely available on npm.

Learn more about [Medusa’s architecture](https://docs.medusajs.com/learn/introduction/architecture) and [commerce modules](https://docs.medusajs.com/learn/fundamentals/modules/commerce-modules) in the Docs.

## Community & Contributions

The community and core team are available in [GitHub Discussions](https://github.com/medusajs/medusa/discussions), where you can ask for support, discuss roadmap, and share ideas.

Join our [Discord server](https://discord.com/invite/medusajs) to meet other community members.

## Other channels

- [GitHub Issues](https://github.com/medusajs/medusa/issues)
- [Twitter](https://twitter.com/medusajs)
- [LinkedIn](https://www.linkedin.com/company/medusajs)
- [Medusa Blog](https://medusajs.com/blog/)
