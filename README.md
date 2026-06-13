# VideoDown

> Baixe vídeos e áudios de mais de 1.000 plataformas — YouTube, Instagram, TikTok, Twitter, Facebook e muito mais. Grátis, rápido e sem cadastro.

---

## Visão Geral

**VideoDown** é uma aplicação web full-stack que permite baixar vídeos e áudios de qualquer plataforma suportada pelo [yt-dlp](https://github.com/yt-dlp/yt-dlp). O usuário cola o link, escolhe o formato e acompanha o progresso do download em tempo real via **Server-Sent Events (SSE)**.

### Funcionalidades

| Recurso | Descrição |
|---|---|
| **Análise de link** | Busca título, thumbnail, duração, views e plataforma automaticamente |
| **9 formatos de download** | MP4 (best/1080p/720p/480p/360p), MP3, M4A, WebM e Áudio melhor |
| **Progresso em tempo real** | Barra de progresso via SSE com bytes recebidos e percentual |
| **Histórico de downloads** | Últimos 20 downloads salvos no banco de dados por sessão anônima |
| **1.000+ plataformas** | Powered by yt-dlp — YouTube, Instagram, TikTok, Twitter/X, Vimeo, Twitch, SoundCloud e mais |
| **Sem cadastro** | Funciona com identificador de sessão local (localStorage) |

---

## Stack Tecnológica

| Camada | Tecnologia |
|---|---|
| Frontend | React 19 + TypeScript + Tailwind CSS 4 |
| Backend | Node.js + Express 4 + tRPC 11 |
| Banco de dados | MySQL / TiDB via Drizzle ORM |
| Download engine | yt-dlp (Python) + ffmpeg |
| Streaming | Server-Sent Events (SSE) |
| Testes | Vitest |

---

## Pré-requisitos

- **Node.js** 22+
- **pnpm** 10+
- **Python 3** com `yt-dlp` instalado
- **ffmpeg** instalado no sistema
- **MySQL** ou banco compatível

### Instalar yt-dlp e ffmpeg

```bash
pip install yt-dlp
sudo apt install ffmpeg -y   # Ubuntu/Debian
brew install ffmpeg           # macOS
```

---

## Instalação e Execução

```bash
git clone https://github.com/Ph3n1Xx-hub/media-recovery-app.git
cd media-recovery-app
pnpm install
pnpm db:push
pnpm dev
```

Acesse em: `http://localhost:3000`

---

## Variáveis de Ambiente

| Variável | Descrição |
|---|---|
| `DATABASE_URL` | String de conexão MySQL |
| `JWT_SECRET` | Segredo para cookies de sessão |
| `PORT` | Porta do servidor (padrão: 3000) |

---

## Estrutura do Projeto

```
client/src/pages/Home.tsx   ← Interface principal
drizzle/schema.ts           ← Tabelas: users, downloads
server/routers/download.ts  ← tRPC: getInfo, getDownloadLink
server/routers/history.ts   ← tRPC: save, list, remove
server/downloadProxy.ts     ← Endpoint SSE /api/download-stream
```

---

## API — Endpoint SSE

```
GET /api/download-stream?url=URL&format=FORMATO&sessionId=ID
```

Eventos: `status` → `start` → `progress` (N vezes) → `done` | `error`

---

## Formatos Disponíveis

`mp4-best`, `mp4-1080`, `mp4-720`, `mp4-480`, `mp4-360`, `mp3`, `m4a`, `webm`, `audio-best`

---

## Testes

```bash
pnpm test   # 3 testes passando
```

---

## Aviso Legal

Use apenas para conteúdo que você tem direito de acessar e armazenar. Respeite os termos de serviço das plataformas e as leis de direitos autorais.

---

## Licença

MIT © 2026 [Ph3n1Xx-hub](https://github.com/Ph3n1Xx-hub)
