# Touch RUN Frontend

Frontend da aplicação Touch RUN - Interface Kanban otimizada para dispositivos móveis e tablets.

## 🚀 Tecnologias

- **React 18** - Biblioteca de interface
- **TypeScript** - Tipagem estática 
- **Vite** - Ferramenta de build
- **Tailwind CSS** - Framework de estilos
- **Zustand** - Gerenciamento de estado
- **Axios** - Cliente HTTP
- **React Router** - Roteamento
- **Lucide React** - Ícones
- **DND Kit** - Drag and drop

## 📁 Estrutura do Projeto

```
src/
├── components/          # Componentes reutilizáveis
├── pages/              # Páginas da aplicação
├── hooks/              # Custom hooks
├── services/           # APIs e lógica de negócio
├── stores/             # Estados globais (Zustand)
├── types/              # Tipos TypeScript
├── utils/              # Funções utilitárias
├── constants/          # Constantes da aplicação
└── assets/             # Recursos estáticos
```

## 🛠️ Desenvolvimento

### Pré-requisitos

- Node.js 20.x
- Yarn ou npm

### Instalação

```bash
# Clonar o repositório
git clone <repo-url>
cd kanban-touch-front

# Instalar dependências
yarn install

# Configurar variáveis de ambiente
cp .env.example .env
```

### Executar

```bash
# Desenvolvimento
yarn dev

# Build para produção
yarn build

# Preview da build
yarn preview
```

### Scripts Disponíveis

- `yarn dev` - Servidor de desenvolvimento
- `yarn build` - Build para produção
- `yarn preview` - Preview da build
- `yarn lint` - Verificar código

## 🔧 Configuração

### Variáveis de Ambiente

```env
VITE_API_BASE_URL=http://localhost:3000
VITE_APP_NAME=Touch RUN
VITE_APP_VERSION=1.0.0
```

### Backend

O frontend se comunica com a API backend através de:

- **Base URL**: `http://localhost:3000` (desenvolvimento)
- **Autenticação**: JWT Bearer tokens
- **Multi-tenant**: Header `X-Tenant-ID`

## 📱 Features

### Concluídas ✅

- [x] Setup do projeto React + TypeScript
- [x] Configuração Tailwind CSS
- [x] Estrutura de pastas
- [x] Serviços de API (Axios)
- [x] Gerenciamento de estado (Zustand)
- [x] Tipos TypeScript
- [x] Roteamento básico
- [x] Páginas de Login, Dashboard e Kanban

### Em Desenvolvimento 🚧

- [ ] Autenticação funcional
- [ ] Kanban drag-and-drop
- [ ] Formulários de criação/edição
- [ ] Responsividade mobile
- [ ] Integração completa com backend

### Planejadas 📋

- [ ] Notificações em tempo real
- [ ] Modo offline
- [ ] PWA
- [ ] Temas dark/light
- [ ] Filtros avançados
- [ ] Exportação de dados

## 🎨 UI/UX

- **Design System**: Tailwind CSS + shadcn/ui
- **Responsividade**: Mobile-first
- **Touch**: Otimizado para dispositivos touch
- **Acessibilidade**: WCAG 2.1 guidelines

## 🔒 Segurança

- JWT para autenticação
- Sanitização de inputs
- Validação client-side e server-side
- Headers de segurança

## 📈 Performance

- Code splitting automático
- Lazy loading de componentes
- Bundle otimizado com Vite
- Compressão de assets

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

**Status**: 🚧 Em desenvolvimento ativo
