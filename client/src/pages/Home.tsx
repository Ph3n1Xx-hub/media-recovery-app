import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  Download, Zap, Globe, Music, Video, Clock, Eye,
  AlertCircle, CheckCircle2, Loader2, ArrowDown
} from "lucide-react";

const PRESET_FORMATS = [
  { id: "mp4-best",   label: "MP4 — Melhor qualidade",   icon: Video,  ext: "mp4" },
  { id: "mp4-1080",   label: "MP4 — 1080p Full HD",       icon: Video,  ext: "mp4" },
  { id: "mp4-720",    label: "MP4 — 720p HD",             icon: Video,  ext: "mp4" },
  { id: "mp4-480",    label: "MP4 — 480p",                icon: Video,  ext: "mp4" },
  { id: "mp4-360",    label: "MP4 — 360p",                icon: Video,  ext: "mp4" },
  { id: "mp3",        label: "MP3 — Áudio",               icon: Music,  ext: "mp3" },
  { id: "m4a",        label: "M4A — Áudio AAC",           icon: Music,  ext: "m4a" },
  { id: "webm",       label: "WebM — Vídeo",              icon: Video,  ext: "webm" },
  { id: "audio-best", label: "Áudio — Melhor qualidade",  icon: Music,  ext: "m4a" },
];

function formatDuration(seconds: number): string {
  if (!seconds) return "—";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function formatViews(n: number): string {
  if (!n) return "—";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}

export default function Home() {
  const [url, setUrl] = useState("");
  const [inputUrl, setInputUrl] = useState("");
  const [selectedFormat, setSelectedFormat] = useState("mp4-best");
  const [downloading, setDownloading] = useState(false);

  // Query de info do vídeo (só dispara quando url está preenchida)
  const infoQuery = trpc.download.getInfo.useQuery(
    { url },
    {
      enabled: !!url,
      retry: false,
      refetchOnWindowFocus: false,
    }
  );

  // Mutation para obter link de download
  const downloadMutation = trpc.download.getDownloadLink.useMutation({
    onSuccess: (data) => {
      setDownloading(false);
      // Abre o link direto no navegador para download
      const a = document.createElement("a");
      a.href = data.streamUrl;
      a.download = data.filename;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      if (data.audioUrl) {
        toast.info("Este formato tem vídeo e áudio separados. O áudio será baixado em seguida.", { duration: 5000 });
        setTimeout(() => {
          const b = document.createElement("a");
          b.href = data.audioUrl!;
          b.download = data.filename.replace(/\.[^.]+$/, "_audio.m4a");
          b.target = "_blank";
          b.rel = "noopener noreferrer";
          document.body.appendChild(b);
          b.click();
          document.body.removeChild(b);
        }, 1500);
      } else {
        toast.success("Download iniciado com sucesso!");
      }
    },
    onError: (err) => {
      setDownloading(false);
      toast.error(err.message || "Erro ao iniciar o download.");
    },
  });

  const handleSearch = () => {
    const trimmed = inputUrl.trim();
    if (!trimmed) { toast.warning("Cole um link válido antes de continuar."); return; }
    setUrl(trimmed);
  };

  const handleDownload = () => {
    if (!url) return;
    setDownloading(true);
    downloadMutation.mutate({ url, format: selectedFormat });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  const info = infoQuery.data;
  const isLoading = infoQuery.isLoading;
  const isError = infoQuery.isError;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/30">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-border shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-md">
              <ArrowDown className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-foreground tracking-tight">VideoDown</span>
          </div>
          <nav className="hidden md:flex gap-6 text-sm text-muted-foreground">
            <a href="#como-funciona" className="hover:text-foreground transition-colors">Como Funciona</a>
            <a href="#plataformas" className="hover:text-foreground transition-colors">Plataformas</a>
          </nav>
        </div>
      </header>

      {/* Hero */}
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
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              vídeo
            </span>{" "}
            agora
          </h1>
          <p className="text-lg text-muted-foreground mb-10 max-w-xl mx-auto leading-relaxed">
            Cole o link do YouTube, Instagram, TikTok, Twitter, Facebook e muito mais.
            Escolha o formato e baixe gratuitamente.
          </p>

          {/* Input principal */}
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

      {/* Resultado da análise */}
      {url && (
        <section className="max-w-3xl mx-auto px-4 pb-16">
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
                  <img
                    src={info.thumbnail}
                    alt={info.title}
                    className="w-36 h-24 object-cover rounded-lg shrink-0 shadow-sm"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <h2 className="font-semibold text-foreground text-base leading-snug line-clamp-2 mb-2">
                    {info.title}
                  </h2>
                  <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                    {info.uploader && (
                      <span className="flex items-center gap-1">
                        <Globe className="w-3.5 h-3.5" /> {info.uploader}
                      </span>
                    )}
                    {info.duration > 0 && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> {formatDuration(info.duration)}
                      </span>
                    )}
                    {info.viewCount > 0 && (
                      <span className="flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5" /> {formatViews(info.viewCount)} views
                      </span>
                    )}
                    <Badge variant="secondary" className="text-xs">{info.platform}</Badge>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Seleção de formato */}
              <div className="p-5 bg-secondary/20">
                <p className="text-sm font-semibold text-foreground mb-3">Escolha o formato:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-5">
                  {PRESET_FORMATS.map((fmt) => {
                    const Icon = fmt.icon;
                    const isSelected = selectedFormat === fmt.id;
                    return (
                      <button
                        key={fmt.id}
                        onClick={() => setSelectedFormat(fmt.id)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg border text-sm font-medium transition-all duration-150 text-left ${
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

                <Button
                  onClick={handleDownload}
                  disabled={downloading}
                  className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-base shadow-md active:scale-[0.99] transition-all"
                >
                  {downloading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                      Preparando download...
                    </>
                  ) : (
                    <>
                      <Download className="w-5 h-5 mr-2" />
                      Baixar agora
                    </>
                  )}
                </Button>
                <p className="text-xs text-muted-foreground text-center mt-2">
                  O download será iniciado diretamente no seu navegador
                </p>
              </div>
            </Card>
          )}
        </section>
      )}

      {/* Como funciona */}
      <section id="como-funciona" className="py-20 bg-white border-t border-border">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-foreground text-center mb-12">Como Funciona</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "1", icon: Globe, title: "Cole o link", desc: "Insira a URL de qualquer vídeo de plataformas suportadas." },
              { step: "2", icon: Zap, title: "Analise", desc: "Clique em Analisar. O VideoDown busca as informações e formatos disponíveis." },
              { step: "3", icon: Download, title: "Baixe", desc: "Escolha o formato desejado e clique em Baixar agora." },
            ].map(({ step, icon: Icon, title, desc }) => (
              <div key={step} className="text-center">
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

      {/* Plataformas suportadas */}
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

      {/* Footer */}
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
          <a
            href="https://github.com/Ph3n1Xx-hub/media-recovery-app"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            GitHub →
          </a>
        </div>
      </footer>
    </div>
  );
}
