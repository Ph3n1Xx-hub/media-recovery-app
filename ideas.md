# Design Concepts - MediaRecover

## Conceitos Explorados

### 1. **Minimalist Tech** (Probabilidade: 0.03)
Uma abordagem ultra-limpa com tipografia sans-serif, cores neutras (cinza, branco, preto) e muita respiração visual. Foco total na funcionalidade sem distrações. Ideal para usuários que querem eficiência pura.

### 2. **Vibrant Digital** (Probabilidade: 0.07)
Cores vibrantes (gradientes neon, azuis elétricos, magentas), animações dinâmicas, e uma sensação de energia moderna. Tipografia bold, ícones com peso visual. Comunica velocidade e inovação.

### 3. **Sophisticated Gradient** (Probabilidade: 0.02)
Gradientes suaves (OKLCH), tipografia elegante com contraste de pesos, sombras refinadas, e um design que transmite confiança e profissionalismo. Cores em tons de azul profundo com acentos em ouro ou cobre. Perfeito para um produto premium.

---

## Design Escolhido: **Sophisticated Gradient**

### Design Movement
**Neo-Brutalism meets Minimalist Luxury** — Uma fusão de formas geométricas limpas com refinamento visual. Inspirado em interfaces de design premium (Figma, Stripe), combinando estrutura clara com detalhes sofisticados.

### Core Principles
1. **Clarity Through Elegance** — Cada elemento tem propósito; nenhuma decoração desnecessária, mas tudo é refinado.
2. **Depth Without Clutter** — Uso estratégico de sombras suaves, gradientes OKLCH e camadas visuais para criar dimensão.
3. **Precision in Motion** — Animações curtas (150-250ms) que reforçam ações, nunca distraem.
4. **Trustworthy Professionalism** — A paleta e tipografia transmitem competência e segurança.

### Color Philosophy
- **Primário:** Azul profundo (`oklch(0.45 0.15 260)`) — transmite confiança, tecnologia, profissionalismo.
- **Secundário:** Cinza sofisticado (`oklch(0.92 0.002 286)`) — fundo limpo, respira.
- **Acentos:** Cobre/ouro sutil (`oklch(0.65 0.12 45)`) — detalhe premium, chama atenção sem gritar.
- **Gradientes:** De azul profundo para cobre (diagonal) — movimento visual elegante.
- **Texto:** Cinza escuro em fundo claro; branco em fundo escuro.

### Layout Paradigm
- **Hero Section:** Assimétrico com gradiente diagonal, texto à esquerda, ilustração abstrata à direita.
- **Feature Sections:** Grid 3-coluna em desktop, mas com alternância (imagem-texto-imagem-texto) para quebrar monotonia.
- **Cards:** Bordas suaves, sombra refinada (`0 4px 16px rgba(0,0,0,0.08)`), espaçamento generoso.
- **Sidebar/Nav:** Fixa à esquerda em desktop, com ícones + labels, fundo com gradiente sutil.

### Signature Elements
1. **Gradient Dividers** — Linhas diagonais suaves que separam seções, reforçando movimento.
2. **Floating Cards** — Componentes com sombra elevada que parecem flutuar sobre o fundo.
3. **Micro-interactions** — Botões que mudam de cor ao hover, inputs com underline animado, loading spinners elegantes.

### Interaction Philosophy
- **Hover States:** Elevação suave (sombra aumenta), cor primária levemente mais clara.
- **Click Feedback:** Scale 0.98 com transição 120ms — confirma ação sem ser óbvio.
- **Loading:** Spinner minimalista com gradiente animado.
- **Transitions:** Todas as mudanças de estado usam `ease-out` (cubic-bezier(0.23, 1, 0.32, 1)) — snappy mas elegante.

### Animation
- **Entrance:** Elementos entram com `opacity: 0 → 1` e `transform: translateY(8px) → 0` em 300ms.
- **Hover:** Cards elevam com sombra aumentada em 150ms.
- **Loading:** Spinner rotaciona continuamente com gradiente animado.
- **Transitions:** Todas as mudanças de cor/posição usam 150-250ms com easing customizado.
- **Respeto a `prefers-reduced-motion`:** Desabilita animações para usuários que preferem.

### Typography System
- **Display (H1):** `Geist Bold` 48px, tracking -0.02em, line-height 1.1 — impactante e elegante.
- **Heading (H2):** `Geist SemiBold` 32px, tracking -0.01em, line-height 1.2.
- **Subheading (H3):** `Geist Medium` 20px, tracking 0, line-height 1.3.
- **Body:** `Geist Regular` 16px, tracking 0, line-height 1.6 — legível, respirável.
- **Small/Caption:** `Geist Regular` 12px, tracking 0.02em, line-height 1.5.

### Brand Essence
**"A ferramenta confiável que transforma qualquer URL em mídia acessível — profissional, rápida, segura."**

**Personalidade:** Confiável, inovador, sofisticado, acessível.

### Brand Voice
- **Headlines:** Diretos, sem jargão. Ex: "Recupere qualquer vídeo em segundos" (não "Solução avançada de extração de mídia").
- **CTAs:** Ação clara e confiante. Ex: "Começar agora" (não "Clique aqui").
- **Microcopy:** Tom amigável mas profissional. Ex: "Insira um link do YouTube, Instagram ou TikTok".

**Exemplo de microcopy:**
- "Cole o link e deixe a gente fazer o resto."
- "Compatível com YouTube, Instagram, TikTok, Twitter e mais."

### Wordmark & Logo
Um símbolo geométrico: um **círculo com uma seta em espiral** (representando download/recuperação) em azul profundo com acentos em cobre. Sem texto — apenas o símbolo.

### Signature Brand Color
**Azul Profundo:** `oklch(0.45 0.15 260)` — é a cor que, quando vista, o usuário pensa "MediaRecover".

---

## Implementação
Este design será implementado através de:
- Tipografia Geist (Google Fonts)
- Paleta OKLCH em `client/src/index.css`
- Componentes shadcn/ui customizados com variantes de cor
- Animações via Framer Motion (para entrance) e CSS transitions (para hover/state)
- Layout assimétrico com Tailwind Grid
