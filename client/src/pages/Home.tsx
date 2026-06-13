import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  Download, Zap, Globe, Music, Video, Clock, Eye,
  AlertCircle, CheckCircle2, Loader2, ArrowDown,
  History, Trash2, ExternalLink,
} from "lucide-react";
import { nanoid } from "nanoid";

// ─── Constantes ──────────────────────────────────────────────────────────────

const PRESET_FORMATS = [
  { id: "mp4-best",   label: "MP4 — Melhor qualidade",  icon: Video, ext: "mp4" },
  { id: "mp4-1080",   label: "MP4 — 1080p Full HD",      icon: Video, ext: "mp4" },
  { id: "mp4-720",    label: "MP4 — 720p HD",            icon: Video, ext: "mp4" },
  { id: "mp4-480",    label: "MP4 — 480p",               icon: Video, ext: "mp4" },
  { id: "mp4-360",    label: "MP4 — 360p",               icon: Video, ext: "mp4" },
  { id: "mp3",        label: "MP3 — Áudio",              icon: Music, ext: "mp3" },
  { id: "m4a",        label: "M4A — Áudio AAC",          icon: Music, ext: "m4a" },
  { id: "webm",       label: "WebM — Vídeo",             icon: Video, ext: "webm" },
  { id: "audio-best", label: "Áudio — Melhor qualidade", icon: Music, ext: "m4a" },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getSessionId(): string {
  let id = localStorage.getItem("vd_session");
  if (!id) { id = nanoid(24); localStorage.setItem("vd_session", id); }
  return id;
}

function formatDuration(s: number): string {
  if (!s) return "—";
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
  return h > 0
    ? `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`
    : `${m}:${String(sec).padStart(2, "0")}`;
}

function formatViews(n: number): string {
  if (!n) return "—";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}

function formatBytes(b: number): string {
  if (b >= 1_073_741_824) return `${(b / 1_073_741_824).toFixed(2)} GB`;
  if (b >= 1_048_576) return `${(b / 1_048_576).toFixed(1)} MB`;
  if (b >= 1_024) return `${(b / 1_024).toFixed(0)} KB`;
  return `${b} B`;
}

function timeAgo(date: Date | string): string {
  const diff = (Date.now() - new Date(date).getTime()) / 1000;
  if (diff < 60) return "agora mesmo";
  if (diff < 3600) return `${Math.floor(diff / 60)}min atrás`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h atrás`;
  return `${Math.floor(diff / 86400)}d atrás`;
}

// ─── Tipos ───────────────────────────────────────────────────────────────────

type DownloadState =
  | { phase: "idle" }
  | { phase: "analyzing" }
  | { phase: "downloading"; percent: number; received: number; total: number; filename: string }
  | { phase: "done"; filename: string }
  | { phase: "error"; message: string };

// ─── Componente principal ────────────────────────────────────────────────────

export default function Home() {
  const sessionId = useRef(getSessionId()).current;

  const [inputUrl, setInputUrl] = useState("");
  const [url, setUrl] = useState("");
  const [selectedFormat, setSelectedFormat] = useState("mp4-best");
  const [dlState, setDlState] = useState<DownloadState>({ phase: "idle" });
  const [showHistory, setShowHistory] = useState(false);
  const sseRef = useRef<EventSource | null>(null);

  // ── Queries / Mutations ──────────────────────────────────────────────────

  const infoQuery = trpc.download.getInfo.useQuery(
    { url },
    { enabled: !!url, retry: false, refetchOnWindowFocus: false }
  );

  const historyQuery = trpc.history.list.useQuery(
    { sessionId },
    { enabled: showHistory, refetchOnWindowFocus: false }
  );

  const saveMutation = trpc.history.save.useMutation();
  const removeMutation = trpc.history.remove.useMutation({
    onSuccess: () => historyQuery.refetch(),
  });

  const info = infoQuery.data;

  // ── Handlers ────────────────────────────────────────────────────────────

  const handleSearch = () => {
    const trimmed = inputUrl.trim();
    if (!trimmed) { toast.warning("Cole um link válido antes de continuar."); return; }
    setUrl(trimmed);
    setDlState({ phase: "idle" });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  const handleDownload = () => {
    if (!url || dlState.phase === "downloading") return;

    // Fecha SSE anterior se existir
    sseRef.current?.close();

    setDlState({ phase: "analyzing" });

    const params = new URLSearchParams({ url, format: selectedFormat, sessionId });
    const sse = new EventSource(`/api/download-stream?${params}`);
    sseRef.current = sse;

    let filename = "videodown";
    let totalSize = 0;
    const chunks: Uint8Array[] = [];

    sse.addEventListener("status", (e) => {
      const d = JSON.parse(e.data);
      toast.info(d.message, { duration: 2000 });
    });

    sse.addEventListener("start", (e) => {
      const d = JSON.parse(e.data);
      filename = d.filename;
      totalSize = d.total || 0;
      setDlState({ phase: "downloading", percent: 0, received: 0, total: totalSize, filename });
    });

    sse.addEventListener("progress", (e) => {
      const d = JSON.parse(e.data);
      setDlState({
        phase: "downloading",
        percent: d.percent >= 0 ? d.percent : 0,
        received: d.received,
        total: d.total,
        filename,
      });
    });

    sse.addEventListener("done", (e) => {
      const d = JSON.parse(e.data);
      sse.close();
      sseRef.current = null;
      setDlState({ phase: "done", filename: d.filename });
      toast.success("Download concluído!");

      // Salva no histórico
      if (info) {
        saveMutation.mutate({
          sessionId,
          url,
          title: info.title,
          thumbnail: info.thumbnail ?? undefined,
          platform: info.platform,
          format: selectedFormat,
          duration: info.duration,
          status: "completed",
        });
        if (showHistory) historyQuery.refetch();
      }
    });

    sse.addEventListener("error", (e: MessageEvent) => {
      sse.close();
      sseRef.current = null;
      let msg = "Erro ao baixar o vídeo.";
      try { msg = JSON.parse(e.data).message || msg; } catch {}
      setDlState({ phase: "error", message: msg });
      toast.error(msg);
    });

    // Fallback: erro de conexão SSE
    sse.onerror = () => {
      if (dlState.phase !== "done") {
        sse.close();
        sseRef.current = null;
        setDlState({ phase: "error", message: "Conexão perdida. Tente novamente." });
      }
    };
  };

  // Limpa SSE ao desmontar
  useEffect(() => () => { sseRef.current?.close(); }, []);

  // ── Render ───────────────────────────────────────────────────────────────

  const isLoading = infoQuery.isLoading;
  const isError = infoQuery.isError;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/30">

      {/* ── Header ── */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-border shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-md">
              <ArrowDown className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-foreground tracking-tight">VideoDown</span>
          </div>
          <nav className="hidden md:flex gap-6 text-sm text-muted-foreground items-center">
            <a href="#como-funciona" className="hover:text-foreground transition-colors">Como Funciona</a>
            <a href="#plataformas" className="hover:text-foreground transition-colors">Plataformas</a>
            <button
              onClick={() => setShowHistory(v => !v)}
              className="flex items-center gap-1.5 hover:text-foreground transition-colors"
            >
              <History className="w-4 h-4" />
              Histórico
            </button>
          </nav>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden pt-20 pb-16 md:pt-28 md:pb-24">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-10 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent/5 rounded-full blur-3xl" />
        </div>
        <div className="max-w-3xl mx-auto px-4 text-center relative z-10">
          <Badge className="mb-6 bg-primary/10 text-primary border-primary/20 hover:bg-primary/15">
            yt-dlp · 1000+ plataformas suportadas
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold text-foreground leading-tight mb-5">
            Baixe qualquer{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">vídeo</span>{" "}
            agora
          </h1>
          <p className="text-lg text-muted-foreground mb-10 max-w-xl mx-auto leading-relaxed">
            Cole o link do YouTube, Instagram, TikTok, Twitter, Facebook e muito mais.
            Escolha o formato e baixe gratuitamente.
          </p>
          <div className="flex gap-2 max-w-2xl mx-auto mb-3">
            <Input
              placeholder="https://www.youtube.com/watch?v=..."
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 h-12 text-base bg-white border-border shadow-sm"
            />
            <Button
              onClick={handleSearch}
              disabled={isLoading}
              className="h-12 px-6 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-md active:scale-95 transition-all"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Analisar"}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            YouTube · Instagram · TikTok · Twitter · Facebook · Vimeo · Twitch · SoundCloud e mais
          </p>
        </div>
      </section>

      {/* ── Painel de resultado ── */}
      {url && (
        <section className="max-w-3xl mx-auto px-4 pb-10">
          {isLoading && (
            <Card className="p-8 text-center border border-border shadow-sm">
              <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-3" />
              <p className="text-muted-foreground font-medium">Analisando o link...</p>
              <p className="text-sm text-muted-foreground mt-1">Isso pode levar alguns segundos</p>
            </Card>
          )}

          {isError && (
            <Card className="p-6 border border-destructive/30 bg-destructive/5 shadow-sm">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-destructive mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold text-destructive">Não foi possível analisar o link</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {infoQuery.error?.message || "Verifique se o link é válido e tente novamente."}
                  </p>
                </div>
              </div>
            </Card>
          )}

          {info && !isLoading && (
            <Card className="overflow-hidden border border-border shadow-md">
              {/* Thumbnail + info */}
              <div className="flex gap-4 p-5 bg-white">
                {info.thumbnail && (
                  <img src={info.thumbnail} alt={info.title}
                    className="w-36 h-24 object-cover rounded-lg shrink-0 shadow-sm" />
                )}
                <div className="flex-1 min-w-0">
                  <h2 className="font-semibold text-foreground text-base leading-snug line-clamp-2 mb-2">
                    {info.title}
                  </h2>
                  <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                    {info.uploader && (
                      <span className="flex items-center gap-1"><Globe className="w-3.5 h-3.5" />{info.uploader}</span>
                    )}
                    {info.duration > 0 && (
                      <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{formatDuration(info.duration)}</span>
                    )}
                    {info.viewCount > 0 && (
                      <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" />{formatViews(info.viewCount)} views</span>
                    )}
                    <Badge variant="secondary" className="text-xs">{info.platform}</Badge>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Seleção de formato + progresso + botão */}
              <div className="p-5 bg-secondary/20 space-y-4">
                <p className="text-sm font-semibold text-foreground">Escolha o formato:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {PRESET_FORMATS.map((fmt) => {
                    const Icon = fmt.icon;
                    const isSelected = selectedFormat === fmt.id;
                    return (
                      <button
                        key={fmt.id}
                        onClick={() => setSelectedFormat(fmt.id)}
                        disabled={dlState.phase === "downloading"}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg border text-sm font-medium transition-all duration-150 text-left disabled:opacity-50 ${
                          isSelected
                            ? "border-primary bg-primary/10 text-primary shadow-sm"
                            : "border-border bg-white text-foreground hover:border-primary/50 hover:bg-primary/5"
                        }`}
                      >
                        <Icon className={`w-4 h-4 shrink-0 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                        <span>{fmt.label}</span>
                        {isSelected && <CheckCircle2 className="w-4 h-4 ml-auto text-primary" />}
                      </button>
                    );
                  })}
                </div>

                {/* Barra de progresso */}
                {(dlState.phase === "downloading" || dlState.phase === "analyzing") && (
                  <div className="space-y-2 pt-1">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>
                        {dlState.phase === "analyzing"
                          ? "Obtendo link do vídeo..."
                          : dlState.percent >= 0
                            ? `${dlState.percent}% — ${formatBytes(dlState.received)}${dlState.total > 0 ? ` / ${formatBytes(dlState.total)}` : ""}`
                            : `Baixando... ${formatBytes(dlState.received)}`}
                      </span>
                      {dlState.phase === "downloading" && dlState.percent >= 0 && (
                        <span className="font-medium text-primary">{dlState.percent}%</span>
                      )}
                    </div>
                    <Progress
                      value={dlState.phase === "analyzing" ? undefined : (dlState.percent >= 0 ? dlState.percent : 50)}
                      className="h-2"
                    />
                  </div>
                )}

                {dlState.phase === "done" && (
                  <div className="flex items-center gap-2 text-sm text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>Download concluído: <strong>{dlState.filename}</strong></span>
                  </div>
                )}

                {dlState.phase === "error" && (
                  <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/5 border border-destructive/20 rounded-lg px-4 py-3">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{dlState.message}</span>
                  </div>
                )}

                <Button
                  onClick={handleDownload}
                  disabled={dlState.phase === "downloading" || dlState.phase === "analyzing"}
                  className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-base shadow-md active:scale-[0.99] transition-all"
                >
                  {dlState.phase === "downloading" || dlState.phase === "analyzing" ? (
                    <><Loader2 className="w-5 h-5 animate-spin mr-2" />Baixando...</>
                  ) : (
                    <><Download className="w-5 h-5 mr-2" />Baixar agora</>
                  )}
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  O progresso é exibido em tempo real via streaming
                </p>
              </div>
            </Card>
          )}
        </section>
      )}

      {/* ── Histórico de downloads ── */}
      {showHistory && (
        <section className="max-w-3xl mx-auto px-4 pb-12">
          <Card className="overflow-hidden border border-border shadow-md">
            <div className="flex items-center justify-between p-5 bg-white border-b border-border">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-primary" />
                <h2 className="font-semibold text-foreground">Histórico de Downloads</h2>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setShowHistory(false)} className="text-muted-foreground">
                Fechar
              </Button>
            </div>

            {historyQuery.isLoading && (
              <div className="p-8 text-center">
                <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Carregando histórico...</p>
              </div>
            )}

            {!historyQuery.isLoading && (!historyQuery.data || historyQuery.data.length === 0) && (
              <div className="p-10 text-center text-muted-foreground">
                <History className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="font-medium">Nenhum download ainda</p>
                <p className="text-sm mt-1">Seus downloads aparecerão aqui</p>
              </div>
            )}

            {historyQuery.data && historyQuery.data.length > 0 && (
              <ScrollArea className="max-h-96">
                <div className="divide-y divide-border">
                  {historyQuery.data.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 p-4 hover:bg-secondary/30 transition-colors">
                      {item.thumbnail ? (
                        <img src={item.thumbnail} alt={item.title ?? ""}
                          className="w-16 h-10 object-cover rounded shrink-0" />
                      ) : (
                        <div className="w-16 h-10 bg-secondary rounded shrink-0 flex items-center justify-center">
                          <Video className="w-4 h-4 text-muted-foreground" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground line-clamp-1">
                          {item.title || "Vídeo sem título"}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          {item.platform && (
                            <Badge variant="secondary" className="text-xs px-1.5 py-0">{item.platform}</Badge>
                          )}
                          {item.format && (
                            <span className="text-xs text-muted-foreground uppercase">{item.format}</span>
                          )}
                          <span className="text-xs text-muted-foreground">{timeAgo(item.createdAt)}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <a href={item.url} target="_blank" rel="noopener noreferrer"
                          className="p-1.5 rounded hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground">
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                        <button
                          onClick={() => removeMutation.mutate({ id: item.id, sessionId })}
                          className="p-1.5 rounded hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </Card>
        </section>
      )}

      {/* ── Como funciona ── */}
      <section id="como-funciona" className="py-20 bg-white border-t border-border">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-foreground text-center mb-12">Como Funciona</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Globe, title: "Cole o link", desc: "Insira a URL de qualquer vídeo de plataformas suportadas." },
              { icon: Zap, title: "Analise", desc: "Clique em Analisar. O VideoDown busca as informações e formatos disponíveis." },
              { icon: Download, title: "Baixe com progresso", desc: "Escolha o formato e acompanhe o progresso em tempo real." },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="text-center">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto mb-4 shadow-md">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Plataformas ── */}
      <section id="plataformas" className="py-20 bg-secondary/20 border-t border-border">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">Plataformas Suportadas</h2>
          <p className="text-muted-foreground mb-10">
            Powered by <strong>yt-dlp</strong> — mais de 1.000 plataformas suportadas
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {["YouTube", "Instagram", "TikTok", "Twitter / X", "Facebook", "Vimeo", "Twitch", "SoundCloud",
              "Reddit", "Dailymotion", "Pinterest", "LinkedIn", "Bilibili", "Rumble", "Odysee", "e muito mais..."].map((p) => (
              <Badge key={p} variant="secondary" className="text-sm px-4 py-1.5 bg-white border border-border shadow-sm">
                {p}
              </Badge>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="py-10 border-t border-border bg-white">
        <div className="max-w-4xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <ArrowDown className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-foreground">VideoDown</span>
          </div>
          <p className="text-sm text-muted-foreground text-center">
            Powered by yt-dlp · Use apenas para conteúdo que você tem direito de baixar
          </p>
          <a href="https://github.com/Ph3n1Xx-hub/media-recovery-app" target="_blank" rel="noopener noreferrer"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            GitHub →
          </a>
        </div>
      </footer>
    </div>
  );
}
