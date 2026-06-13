# MediaRecover — App de Recuperação de Mídia

![MediaRecover Logo](https://d2xsxph8kpxj0f.cloudfront.net/310419663029707363/5ggoxruNcFzBC7FRHXTC3Z/logo-mediarecovery-mnJYCeDWQvXUndW8yGUGAV.webp)

> A ferramenta confiável que transforma qualquer URL em mídia acessível — profissional, rápida, segura.

## 🎯 Sobre

**MediaRecover** é um aplicativo web moderno para recuperação e download de vídeos e áudios de plataformas populares como YouTube, Instagram, TikTok, Twitter e muitas outras. Com uma interface sofisticada e responsiva, oferece uma experiência de usuário premium sem complicações.

### Características Principais

- ✅ **Multi-Plataforma**: Suporte para 50+ plataformas de vídeo
- ⚡ **Ultra Rápido**: Processamento instantâneo com servidores globais
- 🎬 **Múltiplas Qualidades**: Escolha entre diferentes resoluções e formatos
- 🔒 **Seguro**: Sem anúncios, sem rastreamento, sem dados pessoais
- 📱 **Responsivo**: Funciona perfeitamente em desktop, tablet e mobile
- 🎨 **Design Premium**: Interface sofisticada com paleta de cores elegante

## 🚀 Começar

### Pré-requisitos

- Node.js 18+
- pnpm 10+

### Instalação

```bash
# Clonar repositório
git clone https://github.com/Ph3n1Xx-hub/media-recovery-app.git
cd media-recovery-app

# Instalar dependências
pnpm install

# Iniciar servidor de desenvolvimento
pnpm dev
```

O app estará disponível em `http://localhost:3000`

## 📁 Estrutura do Projeto

```
media-recovery-app/
├── client/                    # Frontend React + Tailwind
│   ├── public/               # Assets estáticos
│   ├── src/
│   │   ├── components/       # Componentes reutilizáveis (shadcn/ui)
│   │   ├── pages/            # Páginas (Home, NotFound, etc)
│   │   ├── contexts/         # React Contexts
│   │   ├── hooks/            # Custom Hooks
│   │   ├── lib/              # Utilitários
│   │   ├── App.tsx           # Roteamento principal
│   │   ├── main.tsx          # Entry point React
│   │   └── index.css         # Estilos globais + design tokens
│   └── index.html            # HTML template
├── server/                    # Backend Express (placeholder)
├── shared/                    # Tipos compartilhados
├── package.json              # Dependências
└── README.md                 # Este arquivo
```

## 🎨 Design System

### Paleta de Cores

- **Primário (Deep Blue)**: `oklch(0.45 0.15 260)` — Confiança, tecnologia, profissionalismo
- **Acentos (Copper)**: `oklch(0.65 0.12 45)` — Detalhe premium, destaque visual
- **Fundo**: `oklch(0.98 0.001 286)` — Branco limpo e respirável
- **Texto**: `oklch(0.25 0.02 65)` — Cinza escuro, legível

### Tipografia

- **Font**: Geist (Google Fonts)
- **H1**: 48px Bold, tracking -0.02em
- **H2**: 32px SemiBold, tracking -0.01em
- **Body**: 16px Regular, line-height 1.6

### Componentes

O projeto utiliza **shadcn/ui** para componentes de UI consistentes:
- Buttons, Cards, Inputs, Dialogs, etc.
- Customizados com a paleta de cores do projeto

## 🛠️ Desenvolvimento

### Scripts Disponíveis

```bash
pnpm dev        # Iniciar servidor de desenvolvimento
pnpm build      # Build para produção
pnpm preview    # Visualizar build de produção
pnpm check      # Verificar tipos TypeScript
pnpm format     # Formatar código com Prettier
```

### Stack Tecnológico

- **Frontend**: React 19 + TypeScript
- **Styling**: Tailwind CSS 4 + OKLCH
- **UI Components**: shadcn/ui
- **Routing**: Wouter
- **Build Tool**: Vite
- **HTTP Client**: Axios
- **Forms**: React Hook Form + Zod

## 📝 Licença

MIT License — Veja [LICENSE](LICENSE) para detalhes

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor:

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📧 Contato

- **GitHub**: [@Ph3n1Xx-hub](https://github.com/Ph3n1Xx-hub)
- **Email**: contato@mediarecovery.app

## 🙏 Agradecimentos

- [React](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [shadcn/ui](https://ui.shadcn.com)
- [Vite](https://vitejs.dev)

---

**MediaRecover** — Recupere. Baixe. Aproveite. 🎬
