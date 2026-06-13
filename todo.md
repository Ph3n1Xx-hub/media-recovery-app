# VideoDown — TODO

- [x] Criar projeto base com React + TypeScript + Tailwind
- [x] Design sofisticado com paleta Deep Blue + Copper
- [x] Hero section com input de URL e botão Analisar
- [x] Seção "Como Funciona" com 3 passos
- [x] Seção de plataformas suportadas
- [x] Footer com link para GitHub
- [x] Renomear app de MediaRecover para VideoDown
- [x] Instalar yt-dlp e ffmpeg no servidor
- [x] Criar router tRPC `download.getInfo` — busca título, thumbnail, duração, views, plataforma
- [x] Criar router tRPC `download.getDownloadLink` — gera URL direta para download via yt-dlp
- [x] Integrar frontend com tRPC (trpc.download.getInfo.useQuery + trpc.download.getDownloadLink.useMutation)
- [x] Seleção de 9 formatos: MP4 (best/1080/720/480/360), MP3, M4A, WebM, Áudio melhor
- [x] Exibir thumbnail, título, duração, views e plataforma após análise
- [x] Feedback visual: loading spinner, toast de sucesso/erro
- [x] Atualizar título HTML para VideoDown
- [x] Escrever testes vitest para routers de download e auth
- [x] Todos os testes passando (3/3)
