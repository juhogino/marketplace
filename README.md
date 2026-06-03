# App Marketplace

Aplicativo mobile de marketplace de serviços domésticos e profissionais. Usuários encontram e contratam prestadores; prestadores cadastram serviços, gerenciam disponibilidade e confirmam contratos.

## Início rápido

A API já está em produção — basta instalar as dependências e rodar o app:

```bash
npm install
npx expo start
```

Escaneie o QR code com o **Expo Go** (Android) ou a câmera (iOS).

> Pressione `a` para abrir no emulador Android ou `i` para o simulador iOS.

---

## Pré-requisitos

| Ferramenta | Versão mínima |
|---|---|
| Node.js | 18+ |
| Expo Go (celular) | SDK 52+ |

Não é necessário instalar a Expo CLI globalmente. O `npx expo start` já cuida disso.

---

## Configuração da API

O app aponta por padrão para a API em produção (`src/config/api.ts`):

```
https://api-marketplace-eta.vercel.app
```

Para usar uma instância local da API, edite `src/config/api.ts`:

```ts
export const API_URL = "http://SEU_IP_LOCAL:3000";
```

> Em dispositivos físicos, **não use `localhost`** — use o IP da sua máquina na rede local (ex: `192.168.1.10`).

---

## Funcionalidades

### Usuário comum
- Cadastro e login com persistência de sessão
- Busca e filtro de serviços (categoria, preço máximo, ordenação)
- Detalhe do serviço e perfil do prestador
- Contratar serviço com agendamento (datas/horários do prestador) e pagamento (PIX ou cartão)
- Acompanhar status dos contratos (Aguardando / Confirmado / Cancelado)
- Chat com o prestador por contrato

### Prestador
- Cadastrar e gerenciar serviços
- Definir disponibilidade semanal (dias e horários de 8h às 18h)
- Receber solicitações de contrato e confirmar ou recusar
- Chat com o cliente por contrato

---

## Fluxo de telas

```
index.tsx ──→ (carrega sessão do AsyncStorage)
  ├── /(auth)/login      — usuário existente
  └── /(auth)/register   — novo usuário (tipo: usuário ou prestador)

Após login:
/(app)/home              — categorias + serviços em destaque
  ├── /(app)/services    — listagem com busca e filtros
  │     └── /(app)/service/[id]          — detalhe do serviço
  │           ├── /(app)/provider/[email] — perfil do prestador
  │           └── /(app)/contract/[serviceId] — contratar (2 etapas)
  │                 └── (sucesso) → home
  │
  ├── /(app)/my-services  — contratos ativos (usuário) / solicitações (prestador)
  │     └── /(app)/chat/[contractId] — chat do contrato
  │
  └── /(app)/profile      — dados do usuário + ações
        ├── /(app)/create-service  — cadastrar serviço (prestador)
        └── /(app)/availability    — gerenciar disponibilidade semanal (prestador)
```

---

## Estrutura do projeto

```
app/
├── index.tsx                       # redireciona para home ou login
├── _layout.tsx                     # AuthProvider global
├── (auth)/
│   ├── login.tsx
│   └── register.tsx
└── (app)/
    ├── _layout.tsx                 # guarda de autenticação
    ├── home.tsx
    ├── services.tsx
    ├── my-services.tsx
    ├── profile.tsx
    ├── create-service.tsx
    ├── availability.tsx
    ├── service/[id].tsx
    ├── provider/[email].tsx
    ├── contract/[serviceId].tsx
    ├── schedule/[serviceId].tsx
    └── chat/[contractId].tsx

src/
├── config/api.ts                   # URL base da API
├── context/AuthContext.tsx         # estado global + persistência de sessão
├── lib/axios.ts                    # instância do Axios
├── storage/
│   ├── authStorage.ts
│   ├── serviceStorage.ts
│   ├── contractStorage.ts
│   ├── scheduleStorage.ts
│   ├── messageStorage.ts
│   └── availabilityStorage.ts
└── types/
    ├── User.ts
    └── Service.ts
```

---

## Stack

| Camada | Tecnologia |
|---|---|
| Framework | React Native + Expo (SDK 52) |
| Roteamento | Expo Router (file-based) |
| Linguagem | TypeScript |
| HTTP | Axios |
| Sessão | AsyncStorage |
| Ícones | Expo Vector Icons (Ionicons) |

---

## API

Este app consome a [api-marketplace](../api-marketplace/README.md), hospedada no Vercel. Consulte o README da API para detalhes dos endpoints.
