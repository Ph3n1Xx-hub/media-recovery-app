import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Download, Zap, Globe, CheckCircle } from "lucide-react";

/**
 * MediaRecover - Home Page
 * Design: Sophisticated Gradient
 * Paleta: Deep Blue (oklch 0.45 0.15 260) + Copper Accent (oklch 0.65 0.12 45)
 */

export default function Home() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const handleDownload = () => {
    if (!url.trim()) {
      alert("Por favor, insira um URL válido");
      return;
    }
    setLoading(true);
    // Simular processamento
    setTimeout(() => {
      setLoading(false);
      alert("Download iniciado: " + url);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="https://d2xsxph8kpxj0f.cloudfront.net/310419663029707363/5ggoxruNcFzBC7FRHXTC3Z/logo-mediarecovery-mnJYCeDWQvXUndW8yGUGAV.webp"
              alt="MediaRecover"
              className="w-8 h-8"
            />
            <span className="text-xl font-bold text-foreground">MediaRecover</span>
          </div>
          <nav className="hidden md:flex gap-8">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Recursos
            </a>
            <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Como Funciona
            </a>
            <a href="#faq" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              FAQ
            </a>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 md:py-32">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 right-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-10 w-72 h-72 bg-accent/10 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left: Content */}
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-5xl md:text-6xl font-bold text-foreground leading-tight">
                  Recupere qualquer
                  <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"> vídeo</span>
                  em segundos
                </h1>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Baixe vídeos e áudios de YouTube, Instagram, TikTok, Twitter e mais plataformas. Simples, rápido e seguro.
                </p>
              </div>

              {/* Input Section */}
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Cole o link do vídeo aqui..."
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="flex-1 px-4 py-3 rounded-lg border-border bg-white text-foreground placeholder:text-muted-foreground"
                  />
                  <Button
                    onClick={handleDownload}
                    disabled={loading}
                    className="px-8 py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg transition-all duration-200 hover:shadow-lg active:scale-95"
                  >
                    {loading ? "Processando..." : "Baixar"}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  ✓ Compatível com YouTube, Instagram, TikTok, Twitter e mais
                </p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 pt-8">
                <div className="space-y-1">
                  <p className="text-2xl font-bold text-primary">10M+</p>
                  <p className="text-sm text-muted-foreground">Downloads</p>
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-bold text-primary">50+</p>
                  <p className="text-sm text-muted-foreground">Plataformas</p>
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-bold text-primary">24/7</p>
                  <p className="text-sm text-muted-foreground">Disponível</p>
                </div>
              </div>
            </div>

            {/* Right: Hero Image */}
            <div className="hidden md:flex justify-center items-center">
              <img
                src="https://d2xsxph8kpxj0f.cloudfront.net/310419663029707363/5ggoxruNcFzBC7FRHXTC3Z/hero-media-recovery-nTjcQfV6NpDzN9Tawu5fAq.webp"
                alt="Media Recovery Illustration"
                className="w-full max-w-md drop-shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 md:py-32 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Recursos Poderosos</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Tudo que você precisa para recuperar e gerenciar suas mídias favoritas
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <Card className="p-8 border border-border hover:shadow-lg transition-all duration-300 hover:border-accent/50">
              <div className="mb-6">
                <img
                  src="https://d2xsxph8kpxj0f.cloudfront.net/310419663029707363/5ggoxruNcFzBC7FRHXTC3Z/feature-download-LqkNeLPMnmzi7QDhTrXqsv.webp"
                  alt="Download"
                  className="w-16 h-16 mx-auto"
                />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3 text-center">Download Rápido</h3>
              <p className="text-muted-foreground text-center">
                Baixe vídeos em alta qualidade em segundos. Suporte para múltiplas resoluções e formatos.
              </p>
            </Card>

            {/* Feature 2 */}
            <Card className="p-8 border border-border hover:shadow-lg transition-all duration-300 hover:border-accent/50">
              <div className="mb-6">
                <img
                  src="https://d2xsxph8kpxj0f.cloudfront.net/310419663029707363/5ggoxruNcFzBC7FRHXTC3Z/feature-platforms-8f2SDL3R6xG74WuszFnkfy.webp"
                  alt="Platforms"
                  className="w-16 h-16 mx-auto"
                />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3 text-center">Múltiplas Plataformas</h3>
              <p className="text-muted-foreground text-center">
                YouTube, Instagram, TikTok, Twitter, Facebook e mais. Uma ferramenta para todas.
              </p>
            </Card>

            {/* Feature 3 */}
            <Card className="p-8 border border-border hover:shadow-lg transition-all duration-300 hover:border-accent/50">
              <div className="mb-6">
                <img
                  src="https://d2xsxph8kpxj0f.cloudfront.net/310419663029707363/5ggoxruNcFzBC7FRHXTC3Z/feature-speed-UuHS4S9FSvNkSWkNWY9jHY.webp"
                  alt="Speed"
                  className="w-16 h-16 mx-auto"
                />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3 text-center">Ultra Rápido</h3>
              <p className="text-muted-foreground text-center">
                Processamento instantâneo com servidores globais. Sem esperas, sem complicações.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 md:py-32 bg-secondary/30">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground text-center mb-16">Como Funciona</h2>

          <div className="grid md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {[
              { step: "1", title: "Cole o Link", desc: "Insira a URL do vídeo" },
              { step: "2", title: "Selecione Qualidade", desc: "Escolha a resolução desejada" },
              { step: "3", title: "Baixe", desc: "Clique para iniciar o download" },
              { step: "4", title: "Pronto!", desc: "Arquivo salvo no seu dispositivo" },
            ].map((item, idx) => (
              <div key={idx} className="relative">
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-lg mb-4">
                    {item.step}
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
                {idx < 3 && (
                  <div className="hidden md:block absolute top-6 left-[60%] w-[40%] h-0.5 bg-gradient-to-r from-primary/50 to-transparent" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-32 bg-gradient-to-r from-primary/5 to-accent/5">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">Comece Agora</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Sem cadastro, sem anúncios, sem limites. Recupere suas mídias favoritas em segundos.
          </p>
          <Button className="px-8 py-4 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg text-lg transition-all duration-200 hover:shadow-lg active:scale-95">
            Começar Agora
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground/5 border-t border-border py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-semibold text-foreground mb-4">MediaRecover</h4>
              <p className="text-sm text-muted-foreground">A ferramenta confiável para recuperar qualquer mídia.</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Produto</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Recursos</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Preços</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">API</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Privacidade</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Termos</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Contato</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Redes Sociais</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Twitter</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">GitHub</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Discord</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2026 MediaRecover. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
