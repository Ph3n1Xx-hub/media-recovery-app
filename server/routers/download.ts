import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { exec } from "child_process";
import { promisify } from "util";
import { TRPCError } from "@trpc/server";
import path from "path";
import fs from "fs";
import os from "os";

const execAsync = promisify(exec);

// Diretório temporário para downloads
const TMP_DIR = path.join(os.tmpdir(), "videodown");
if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR, { recursive: true });

// Mapa de formatos suportados
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

// Sanitiza o nome do arquivo
function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9_\-. ]/g, "_").slice(0, 100);
}

export const downloadRouter = router({
  // Busca informações do vídeo (título, thumbnail, formatos disponíveis, duração)
  getInfo: publicProcedure
    .input(z.object({ url: z.string().url("URL inválida") }))
    .query(async ({ input }) => {
      try {
        const { stdout } = await execAsync(
          `yt-dlp --dump-json --no-playlist --no-warnings "${input.url}"`,
          { timeout: 30000 }
        );
        const info = JSON.parse(stdout);

        // Extrai formatos únicos disponíveis
        const formats: { id: string; label: string; ext: string; resolution?: string; filesize?: number }[] = [];

        if (info.formats) {
          const seen = new Set<string>();
          for (const f of info.formats) {
            if (!f.ext || !f.format_note) continue;
            const key = `${f.ext}-${f.format_note}`;
            if (seen.has(key)) continue;
            seen.add(key);
            formats.push({
              id: f.format_id,
              label: `${f.ext.toUpperCase()} — ${f.format_note}${f.filesize ? ` (~${Math.round(f.filesize / 1024 / 1024)}MB)` : ""}`,
              ext: f.ext,
              resolution: f.format_note,
              filesize: f.filesize,
            });
          }
        }

        return {
          title: info.title || "Vídeo sem título",
          thumbnail: info.thumbnail || null,
          duration: info.duration || 0,
          uploader: info.uploader || info.channel || null,
          platform: info.extractor_key || "Desconhecido",
          viewCount: info.view_count || 0,
          formats: formats.slice(0, 20),
        };
      } catch (err: any) {
        const msg = err?.stderr || err?.message || "Erro ao buscar informações";
        if (msg.includes("Unsupported URL") || msg.includes("is not a valid URL")) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "URL não suportada. Verifique o link e tente novamente." });
        }
        if (msg.includes("Private video") || msg.includes("private")) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Este vídeo é privado e não pode ser baixado." });
        }
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Não foi possível obter informações do vídeo. Verifique o link." });
      }
    }),

  // Gera o link de download direto para o cliente
  getDownloadLink: publicProcedure
    .input(
      z.object({
        url: z.string().url("URL inválida"),
        format: z.string().default("mp4-best"),
        formatId: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const formatStr = input.formatId
          ? input.formatId
          : FORMAT_MAP[input.format] || FORMAT_MAP["mp4-best"];

        // Obtém a URL direta do stream usando yt-dlp
        const { stdout } = await execAsync(
          `yt-dlp -f "${formatStr}" --get-url --no-playlist --no-warnings "${input.url}"`,
          { timeout: 30000 }
        );

        const urls = stdout.trim().split("\n").filter(Boolean);
        if (!urls.length) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Nenhum stream encontrado para este formato." });
        }

        // Obtém o título para o nome do arquivo
        let filename = "videodown";
        try {
          const { stdout: titleOut } = await execAsync(
            `yt-dlp --get-title --no-playlist --no-warnings "${input.url}"`,
            { timeout: 15000 }
          );
          filename = sanitizeFilename(titleOut.trim());
        } catch {}

        const ext = input.format.startsWith("mp3") ? "mp3"
          : input.format.startsWith("m4a") ? "m4a"
          : input.format.startsWith("webm") ? "webm"
          : input.format.startsWith("audio") ? "m4a"
          : "mp4";

        return {
          streamUrl: urls[0],
          audioUrl: urls.length > 1 ? urls[1] : null,
          filename: `${filename}.${ext}`,
          ext,
          note: urls.length > 1
            ? "Este formato requer vídeo + áudio separados. Use o botão abaixo para baixar cada parte."
            : null,
        };
      } catch (err: any) {
        if (err instanceof TRPCError) throw err;
        const msg = err?.stderr || err?.message || "";
        if (msg.includes("Private video") || msg.includes("private")) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Este vídeo é privado." });
        }
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Não foi possível gerar o link de download." });
      }
    }),
});
