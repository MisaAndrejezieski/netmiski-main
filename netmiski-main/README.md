# NetMiski 🟢

> Um simulador de redes de computadores baseado em navegador, com interface Cyberpunk, focado no ensino de infraestrutura, segurança perimetral e roteamento.

**NetMiski** é um fork evoluído e profundamente refatorado do projeto [NetworX](https://github.com/milesberry/networx). Enquanto o projeto original focava apenas em fundamentos básicos de rede (Camada 1 a 3), o NetMiski adiciona uma imersão visual única (Dark Mode com Neon) e simulações avançadas de segurança e tradução de endereços.

Desenvolvido por [Misael Andrejezieski](https://github.com/MisaAndrejezieski).

## 🚀 O que há de novo no NetMiski?

Este projeto foi expandido para incluir:

- **Identidade Visual Cyberpunk:** Interface totalmente redesenhada usando uma paleta "Dark Neon" (Verde Matrix, Ciano e Rosa Neon) com foco em legibilidade e imersão de "console de operações".
- **Motor de Firewall Real:** O simulador agora possui regras de firewall funcionais (Allow/Deny). Quando um pacote é bloqueado:
  - Exibe um erro `Connection Refused` no terminal (estilizado em rosa neon).
  - **Anima a destruição do pacote** no cabo de rede (visualização de explosão).
- **Simulação de NAT (Network Address Translation):** Roteadores agora conseguem traduzir IPs da rede interna (LAN) para o IP público (WAN). Ao acessar a internet, o terminal exibe o log em tempo real da tradução (ex: `[NAT] Translated source 192.168.1.11 → 82.1.2.3`).
- **Inspeção de Tráfego HTTP:** O navegador embutido agora respeita as regras do Firewall, impedindo o acesso a sites bloqueados pela política da rede.

## 🛠️ Funcionalidades Principais

- **Terminal de Comandos:** Execute `ping`, `traceroute`, `ipconfig`, `nslookup`, `curl` e `ssh` em PCs, notebooks e servidores.
- **DHCP Server:** Roteadores podem distribuir IPs dinamicamente. Execute `dhclient` para ver a animação do handshake de 4 vias (DISCOVER, OFFER, REQUEST, ACK).
- **Switches e Tabelas MAC:** Veja as tabelas MAC sendo preenchidas conforme o tráfego flui pela rede.
- **Roteamento:** Adicione rotas estáticas na tabela de roteamento.
- **Topologias Preset:** Carregue cenários prontos como "Star Topology", "Home Network", "School Network" (com Firewall) e outros.
- **Import/Export:** Salve sua topologia de rede como `.json` e compartilhe.

## 🖥️ Como Rodar o Projeto Localmente

Certifique-se de ter o [Node.js](https://nodejs.org/) (versão 18 ou superior) instalado.

```bash
# 1. Clone o repositório
git clone https://github.com/MisaAndrejezieski/netmiski.git

# 2. Entre na pasta
cd netmiski

# 3. Instale as dependências
npm install

# 4. Inicie o servidor de desenvolvimento
npm run dev

O simulador estará disponível em http://localhost:5173.


Tech Stack
React + TypeScript — Base da interface.

Vite — Build tool e servidor de desenvolvimento ultrarrápido.

React Flow (@xyflow/react) — Renderização do canvas e grafos de rede.

Zustand — Gerenciamento de estado global (nós, conexões, pacotes).

Tailwind CSS — Estilização customizada com a paleta Cyberpunk.

Lucide React — Ícones da interface.