/**
 * Endpoint SSE para download com progresso real via yt-dlp.
 * GET /api/download-stream?url=...&format=...&sessionId=...
 *
 * Fluxo:
 * 1. yt-dlp obtém a URL do stream
 * 2. O servidor faz fetch do stream e repassa ao cliente
 * 3. Eventos SSE reportam progresso (bytes recebidos / total)
 * 4. Ao final, envia evento "done" com o nome do arquivo
 */

import { Router, Request, Response } from "express";
import { exec } from "child_process";
import { promisify } from "util";
import https from "https";
import http from "http";

const execAsync = promisify(exec);

const FORMAT_MAP: Record<string, string> = {
  "mp4-best":   "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best",
  "mp4-1080":   "bestvideo[height<=1080][ext=mp4]+bestaudio[ext=m4a]/best[height<=1080][ext=mp4]/best[height<=1080]",
  "mp4-720":    "bestvideo[height<=720][ext=mp4]+bestaudio[ext=m4a]/best[height<=720][ext=mp4]/best[height<=720]",
  "mp4-480":    "bestvideo[height<=480][ext=mp4]+bestaudio[ext=m4a]/best[height<=480][ext=mp4]/best[height<=480]",
  "mp4-360":    "bestvideo[height<=360][ext=mp4]+bestaudio[ext=m4a]/best[height<=360][ext=mp4]/best[height<=360]",
  "mp3":        "bestaudio[ext=mp3]/bestaudio",
  "m4a":        "bestaudio[ext=m4a]/bestaudio",
  "webm":       "bestvideo[ext=webm]+bestaudio[ext=webm]/best[ext=webm]/best",
  "audio-best": "bestaudio/best",
};

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9_\-. ]/g, "_").slice(0, 100);
}

function getExt(format: string): string {
  if (format.startsWith("mp3")) return "mp3";
  if (format.startsWith("m4a")) return "m4a";
  if (format.startsWith("webm")) return "webm";
  if (format.startsWith("audio")) return "m4a";
  return "mp4";
}

function sendSSE(res: Response, event: string, data: unknown) {
  res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
}

import type { Express } from "express";

export function registerDownloadProxy(app: Express) {
  const router = Router();

  router.get("/api/download-stream", async (req: Request, res: Response) => {
    const { url, format = "mp4-best" } = req.query as Record<string, string>;

    if (!url) {
      res.status(400).json({ error: "URL obrigatória" });
      return;
    }

    // Configura SSE
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");
    res.flushHeaders();

    let finished = false;

    const finish = () => {
      if (!finished) {
        finished = true;
        res.end();
      }
    };

    req.on("close", finish);

    try {
      sendSSE(res, "status", { message: "Analisando link..." });

      const formatStr = FORMAT_MAP[format] || FORMAT_MAP["mp4-best"];

      // Obtém URL do stream e título em paralelo
      const [streamResult, titleResult] = await Promise.allSettled([
        execAsync(`yt-dlp -f "${formatStr}" --get-url --no-playlist --no-warnings "${url}"`, { timeout: 30000 }),
        execAsync(`yt-dlp --get-title --no-playlist --no-warnings "${url}"`, { timeout: 15000 }),
      ]);

      if (streamResult.status === "rejected") {
        sendSSE(res, "error", { message: "Não foi possível obter o link do vídeo." });
        finish();
        return;
      }

      const streamUrls = streamResult.value.stdout.trim().split("\n").filter(Boolean);
      if (!streamUrls.length) {
        sendSSE(res, "error", { message: "Nenhum stream encontrado." });
        finish();
        return;
      }

      const streamUrl = streamUrls[0];
      const title = titleResult.status === "fulfilled"
        ? sanitizeFilename(titleResult.value.stdout.trim())
        : "videodown";
      const ext = getExt(format);
      const filename = `${title}.${ext}`;

      sendSSE(res, "status", { message: "Iniciando download..." });

      // Faz o download do stream e repassa com progresso
      const protocol = streamUrl.startsWith("https") ? https : http;

      const proxyReq = protocol.get(streamUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; VideoDown/1.0)",
          "Accept": "*/*",
          "Accept-Encoding": "identity",
        },
      }, (proxyRes) => {
        const totalStr = proxyRes.headers["content-length"];
        const total = totalStr ? parseInt(totalStr, 10) : 0;
        let received = 0;
        let lastPercent = -1;

        sendSSE(res, "start", {
          filename,
          total,
          contentType: proxyRes.headers["content-type"] || "application/octet-stream",
        });

        proxyRes.on("data", (chunk: Buffer) => {
          received += chunk.length;
          if (total > 0) {
            const percent = Math.floor((received / total) * 100);
            if (percent !== lastPercent) {
              lastPercent = percent;
              sendSSE(res, "progress", { received, total, percent });
            }
          } else {
            // Sem content-length: reporta bytes recebidos
            sendSSE(res, "progress", { received, total: 0, percent: -1 });
          }
        });

        proxyRes.on("end", () => {
          sendSSE(res, "done", { filename, received, total });
          finish();
        });

        proxyRes.on("error", (err) => {
          sendSSE(res, "error", { message: "Erro ao baixar o stream: " + err.message });
          finish();
        });
      });

      proxyReq.on("error", (err) => {
        sendSSE(res, "error", { message: "Erro de conexão: " + err.message });
        finish();
      });

      proxyReq.setTimeout(120000, () => {
        proxyReq.destroy();
        sendSSE(res, "error", { message: "Timeout ao baixar o vídeo." });
        finish();
      });

    } catch (err: any) {
      sendSSE(res, "error", { message: err?.message || "Erro inesperado." });
      finish();
    }
  });

  app.use(router);
}
