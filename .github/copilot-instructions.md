# Copilot Instructions: Kanban Touch Frontend

## Project Overview
A React TypeScript frontend application for a multi-tenant CRM system with touch-friendly Kanban interface.

### Tech Stack
- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: Zustand
- **HTTP Client**: Axios
- **Authentication**: JWT with backend integration
- **Deployment**: Separate from backend for independent hosting

### Architecture Goals
- Touch-optimized interface for mobile/tablet use
- Real-time lead management with drag-and-drop Kanban
- Multi-tenant architecture support
- Responsive design with offline capabilities
- Performance-optimized for production deployment

## Development Checklist

### Phase 1: Project Setup ✅
- [x] Create workspace directory
- [x] Setup copilot-instructions.md
- [x] Initialize React + TypeScript with Vite
- [x] Configure Tailwind CSS
- [x] Install shadcn/ui components
- [x] Setup project structure

### Phase 2: Core Infrastructure ✅
- [x] Configure TypeScript paths and aliases
- [x] Setup environment configuration
- [x] Create API client with Axios
- [x] Implement authentication service
- [x] Setup state management with Zustand
- [x] Configure routing with React Router

### Phase 3: Authentication & Security
- [ ] Login/Register components
- [ ] JWT token management
- [ ] Protected route wrapper
- [ ] Multi-tenant context handling
- [ ] Session persistence
- [ ] Logout functionality

### Phase 4: Core Components
- [ ] Dashboard layout
- [ ] Navigation components
- [ ] Lead management interface
- [ ] Kanban board components
- [ ] Drag-and-drop functionality
- [ ] Modal/drawer components

### Phase 5: Business Features
- [ ] Lead creation/editing forms
- [ ] Status change workflows
- [ ] Search and filtering
- [ ] Real-time updates
- [ ] Notification system
- [ ] Data synchronization

### Phase 6: Mobile Optimization
- [ ] Touch gesture handling
- [ ] Responsive breakpoints
- [ ] Mobile navigation
- [ ] Offline state handling
- [ ] Performance optimization
- [ ] PWA configuration

### Phase 7: Production Ready
- [ ] Error boundaries
- [ ] Loading states
- [ ] Form validation
- [ ] API error handling
- [ ] Build optimization
- [ ] Testing setup

## Backend Integration
- **API Base URL**: http://localhost:3000 (development)
- **Authentication**: JWT Bearer tokens
- **Endpoints**: /api/auth, /api/leads, /api/kanban
- **Multi-tenant**: X-Tenant-ID header

## Development Guidelines
1. Use TypeScript strictly - no 'any' types
2. Follow React best practices with hooks
3. Implement proper error handling
4. Optimize for touch interactions
5. Maintain responsive design
6. Write reusable components
7. Document component props and functions

## File Structure
```
src/
├── components/          # Reusable UI components
├── pages/              # Route components
├── hooks/              # Custom React hooks
├── services/           # API and business logic
├── stores/             # Zustand state stores
├── types/              # TypeScript interfaces
├── utils/              # Helper functions
├── styles/             # Global styles
└── constants/          # App constants
```

---
**Next Step**: Implementar autenticação funcional e formulários de login
