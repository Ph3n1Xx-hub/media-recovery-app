/**
 * Rotas de download do VideoDown
 *
 * GET /api/download-file?url=...&format=...
 *   → Faz proxy do vídeo diretamente para o navegador com Content-Disposition: attachment
 *   → O navegador inicia o download do arquivo imediatamente
 *
 * GET /api/download-info?url=...&format=...
 *   → Retorna JSON com título, filename e ext (para o frontend montar o link)
 */

import { Router, Request, Response } from "express";
import { exec } from "child_process";
import { promisify } from "util";
import https from "https";
import http from "http";
import type { Express } from "express";

const execAsync = promisify(exec);

const FORMAT_MAP: Record<string, string> = {
  "mp4-best":   "best[ext=mp4]/bestvideo[ext=mp4]+bestaudio[ext=m4a]/best",
  "mp4-1080":   "bestvideo[height<=1080][ext=mp4]+bestaudio[ext=m4a]/best[height<=1080][ext=mp4]/best[height<=1080]",
  "mp4-720":    "bestvideo[height<=720][ext=mp4]+bestaudio[ext=m4a]/best[height<=720][ext=mp4]/best[height<=720]",
  "mp4-480":    "bestvideo[height<=480][ext=mp4]+bestaudio[ext=m4a]/best[height<=480][ext=mp4]/best[height<=480]",
  "mp4-360":    "bestvideo[height<=360][ext=mp4]+bestaudio[ext=m4a]/best[height<=360][ext=mp4]/best[height<=360]",
  "mp3":        "bestaudio[ext=mp3]/bestaudio",
  "m4a":        "bestaudio[ext=m4a]/bestaudio",
  "webm":       "best[ext=webm]/bestvideo[ext=webm]+bestaudio[ext=webm]/best",
  "audio-best": "bestaudio/best",
};

function sanitizeFilename(name: string): string {
  return name.replace(/[^\w\s\-\.]/g, "_").replace(/\s+/g, "_").slice(0, 100);
}

function getExt(format: string): string {
  if (format === "mp3") return "mp3";
  if (format === "m4a") return "m4a";
  if (format === "webm") return "webm";
  if (format === "audio-best") return "m4a";
  return "mp4";
}

function fetchStream(url: string): Promise<import("http").IncomingMessage> {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith("https") ? https : http;
    const req = protocol.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
        "Accept": "*/*",
        "Accept-Encoding": "identity",
        "Range": "bytes=0-",
      },
    }, (res) => resolve(res));
    req.on("error", reject);
    req.setTimeout(120000, () => { req.destroy(); reject(new Error("Timeout")); });
  });
}

export function registerDownloadProxy(app: Express) {
  const router = Router();

  /**
   * Rota principal de download — faz proxy do vídeo para o navegador
   * O navegador recebe o arquivo com Content-Disposition: attachment
   */
  router.get("/api/download-file", async (req: Request, res: Response) => {
    const { url, format = "mp4-best" } = req.query as Record<string, string>;

    if (!url) {
      res.status(400).json({ error: "URL obrigatória" });
      return;
    }

    try {
      const formatStr = FORMAT_MAP[format] || FORMAT_MAP["mp4-best"];
      const ext = getExt(format);

      // Obtém URL do stream e título em paralelo
      const [streamResult, titleResult] = await Promise.allSettled([
        execAsync(`yt-dlp -f "${formatStr}" --get-url --no-playlist --no-warnings "${url}"`, { timeout: 30000 }),
        execAsync(`yt-dlp --get-title --no-playlist --no-warnings "${url}"`, { timeout: 20000 }),
      ]);

      if (streamResult.status === "rejected") {
        console.error("[VideoDown] yt-dlp error:", streamResult.reason);
        res.status(502).json({ error: "Não foi possível obter o link do vídeo. Verifique o URL." });
        return;
      }

      const streamUrls = streamResult.value.stdout.trim().split("\n").filter(Boolean);
      if (!streamUrls.length) {
        res.status(404).json({ error: "Nenhum stream encontrado para este formato." });
        return;
      }

      const streamUrl = streamUrls[0];
      const rawTitle = titleResult.status === "fulfilled"
        ? titleResult.value.stdout.trim()
        : "videodown";
      const filename = `${sanitizeFilename(rawTitle)}.${ext}`;

      // Faz proxy do stream para o cliente
      const upstream = await fetchStream(streamUrl);

      const contentType = upstream.headers["content-type"] || "application/octet-stream";
      const contentLength = upstream.headers["content-length"];

      res.setHeader("Content-Type", contentType);
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      if (contentLength) res.setHeader("Content-Length", contentLength);
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("X-Filename", filename);

      // Pipe do stream para o cliente
      upstream.pipe(res);

      upstream.on("error", (err) => {
        console.error("[VideoDown] Stream error:", err);
        if (!res.headersSent) {
          res.status(502).json({ error: "Erro ao transmitir o vídeo." });
        }
      });

      req.on("close", () => {
        upstream.destroy();
      });

    } catch (err: any) {
      console.error("[VideoDown] Download error:", err);
      if (!res.headersSent) {
        res.status(500).json({ error: err?.message || "Erro inesperado ao processar o download." });
      }
    }
  });

  /**
   * Rota de informação rápida — retorna filename e ext sem baixar
   * Usado pelo frontend para construir o link de download
   */
  router.get("/api/download-info", async (req: Request, res: Response) => {
    const { url, format = "mp4-best" } = req.query as Record<string, string>;

    if (!url) {
      res.status(400).json({ error: "URL obrigatória" });
      return;
    }

    try {
      const ext = getExt(format);
      const { stdout } = await execAsync(
        `yt-dlp --get-title --no-playlist --no-warnings "${url}"`,
        { timeout: 20000 }
      );
      const title = stdout.trim();
      const filename = `${sanitizeFilename(title)}.${ext}`;
      res.json({ filename, ext, title });
    } catch {
      res.json({ filename: `videodown.${getExt(format)}`, ext: getExt(format), title: "videodown" });
    }
  });

  app.use(router);
}
