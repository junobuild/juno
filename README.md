<div align="center" style="display:flex;flex-direction:column;">
  <a href="https://juno.build/">
    <img src="https://github.com/junobuild/juno/raw/main/src/frontend/static/images/juno_logo.png" width="100%" alt="Juno logo" role="presentation"/>
  </a>
</div>

<br />

<p align="center">
  <a href="https://github.com/junobuild/juno"><img alt="GitHub Actions Workflow Status" src="https://img.shields.io/github/actions/workflow/status/junobuild/juno/release.yml?style=flat-square"></a>
  <a href="https://github.com/junobuild/juno"><img src="https://img.shields.io/github/last-commit/junobuild/juno/main?commit&style=flat-square" alt="Last Commit" /></a>
  <a href="https://discord.gg/wHZ57Z2RAG"><img src="https://dcbadge.limes.pink/api/server/https://discord.gg/wHZ57Z2RAG?style=flat-square" alt="Discord" /></a>
</p>

## ⭐️ Description

[Juno] is an open-source serverless platform for hosting static websites, building web applications, and running serverless functions with the privacy and control of self-hosting.

It provides a familiar cloud experience with strong security and zero operational complexity. Each project runs in its own WASM container, fully owned and controlled by you.

Think of it as **Vercel + Firebase + Self-Hosting** - without the compromises.

- 🔑 Authentication [[Docs](https://juno.build/docs/build/authentication)]
- 📦 Datastore [[Docs](https://juno.build/docs/build/datastore)]
- 📂 File Storage [[Docs](https://juno.build/docs/build/storage)]
- 🌐 Hosting [[Docs](https://juno.build/docs/build/hosting)]
- ⚙️ Serverless Functions (Rust & TypeScript) [[Docs](https://juno.build/docs/build/functions)]
- 📊 Analytics [[Docs](https://juno.build/docs/build/analytics)]
- 👀 Monitoring [[Docs](https://juno.build/docs/management/monitoring)]
- 💾 Snapshots [[Docs](https://juno.build/docs/management/snapshots)]

<br />

![A screenshot of the Juno Console](./src/frontend/static/images/console_screenshot.png)

<br />

## ⚡️ Why Juno?

- **Zero DevOps** - No servers to manage, no infrastructure to maintain
- **True Ownership** - Your code, data, and infrastructure are fully yours
- **Local-First Development** - Full production-like emulator for rapid iteration

## 🚀 Quick Start

```typescript
// Initialize Juno
import { initSatellite } from '@junobuild/core';
await initSatellite();

// Store data
import { setDoc } from '@junobuild/core';
await setDoc({
	collection: 'posts',
	doc: {
		key: 'my-post',
		data: { title: 'Hello Juno!' }
	}
});
```

## ⚙️ Serverless Functions

Write serverless functions in TypeScript or Rust and deploy them to your own WASM container.

**TypeScript:**

```typescript
import { j } from '@junobuild/schema';
import { defineQuery } from '@junobuild/functions';

export const hello = defineQuery({
	args: j.strictObject({
		name: j.string()
	}),
	handler: ({ data }) => {
		return { message: `Hello, ${data.name}!` };
	}
});
```

**Rust:**

```rust
#[ic_cdk::query]
fn hello(name: String) -> String {
    format!("Hello, {}!", name)
}
```

## 🚢 Deploy

Deploy to production with a single command:

```bash
# Deploy your frontend
juno hosting deploy

# Deploy your serverless functions
juno functions publish
```

Or integrate with GitHub Actions → [Setup CI/CD](https://juno.build/docs/guides/github-actions)

![A screenshot of the GitHub integration in the Console UI](https://private-user-images.githubusercontent.com/16886711/552243302-30460b15-11dd-47bc-8a44-e255ba12fc00.png?jwt=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3NzM1ODQ5MTksIm5iZiI6MTc3MzU4NDYxOSwicGF0aCI6Ii8xNjg4NjcxMS81NTIyNDMzMDItMzA0NjBiMTUtMTFkZC00N2JjLThhNDQtZTI1NWJhMTJmYzAwLnBuZz9YLUFtei1BbGdvcml0aG09QVdTNC1ITUFDLVNIQTI1NiZYLUFtei1DcmVkZW50aWFsPUFLSUFWQ09EWUxTQTUzUFFLNFpBJTJGMjAyNjAzMTUlMkZ1cy1lYXN0LTElMkZzMyUyRmF3czRfcmVxdWVzdCZYLUFtei1EYXRlPTIwMjYwMzE1VDE0MjMzOVomWC1BbXotRXhwaXJlcz0zMDAmWC1BbXotU2lnbmF0dXJlPWI4NDM0NWU5N2UwOGY2MWRmMWRiY2MyY2U5NDdjOWQ5NDllOTk4MDQ2M2FjYTYxYTFiY2MwOGMzNDVhMDM1MWImWC1BbXotU2lnbmVkSGVhZGVycz1ob3N0In0.5t7ZDmHDNbTIbq2fbyZ0UKfk2zXHdCMjMH3R7sh7x3g)

## 💁‍♂️️ Links & Resources

Here are some useful links:

- Looking to get started? Check out the [Guides & Examples](https://juno.build/docs/category/guides-and-examples) for step-by-step tutorials and sample code.
- Explore the full [documentation](https://juno.build) for in-depth details on using and configuring Juno.
- See the [HACKING](HACKING.md) document for instructions on running and developing Juno locally.

## 🖥️ Bootstrap

Planning to build a website, blog, or web application? Start quickly by scaffolding a new project using a template.

```bash
# with npm
npm create juno@latest
# with pnpm
pnpm create juno
# with yarn
yarn create juno
```

## 🎯 Live Examples

Check out the [showcase](https://juno.build/showcase).

## 🧑‍🤝‍🧑 Community

Have questions, comments, or feedback? Join our [Discord](https://discord.gg/wHZ57Z2RAG) or [OpenChat](https://oc.app/community/vxgpi-nqaaa-aaaar-ar4lq-cai/?ref=xanzv-uaaaa-aaaaf-aneba-cai).

## 💬 Contact

Find us on X/Twitter at [@junobuild](https://twitter.com/junobuild) or email us at [hi@juno.build](mailto://hi@juno.build).

[juno]: https://juno.build
