# Konfig

Konfig is a centralized configuration service that stores and distributes configurations for various software and hardware deployments.

The source of truth is hosted on Cloudflare Workers and Pages.

## Deployment

1. Install dependencies

```shell
npm install`
```

1. Setup Cloudflare project

1. Setup the KV namespace binding to Cloudflare Pages Functions

1. Deploy to Cloudflare

```shell
wrangler deploy --env production
```
