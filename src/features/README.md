# Features Directory Structure

This directory contains all feature-based modules organized by business domain. Each feature is self-contained with its own pages, components, services, and types.

## Directory Structure

```
src/features/
├── auth/                    # Authentication & Authorization
│   ├── pages/              # Auth pages (Login, SignUp, etc.)
│   ├── components/         # Auth-specific components
│   ├── services/           # Auth services (if any)
│   ├── types/              # Auth type definitions (if any)
│   └── index.ts            # Feature exports
│
├── menu/                   # Menu Management
│   ├── pages/              # Menu pages (MenuItems, MenuCategories)
│   ├── components/         # Menu components (CategoryForm, MenuItemCard, etc.)
│   ├── services/           # Menu services (if any)
│   ├── types/              # Menu type definitions (if any)
│   └── index.ts            # Feature exports
│
├── orders/                 # Order Management
│   ├── pages/              # Order pages (Orders, ManualOrderEntry)
│   ├── components/         # Order components (OrderCard, ChatMessage, etc.)
│   ├── services/           # Order services (if any)
│   ├── types/              # Order type definitions (if any)
│   └── index.ts            # Feature exports
│
├── settings/               # Settings & Configuration
│   ├── pages/              # Settings pages (BusinessProfile, Branches, etc.)
│   ├── components/         # Settings components (BranchForm, QRCodeCard, etc.)
│   ├── services/           # Settings services (if any)
│   ├── types/              # Settings type definitions (if any)
│   └── index.ts            # Feature exports
│
├── analytics/              # Analytics & Reporting
│   ├── pages/              # Analytics pages
│   ├── components/         # Analytics components
│   ├── services/           # Analytics services (if any)
│   ├── types/              # Analytics type definitions (if any)
│   └── index.ts            # Feature exports
│
├── dashboard/              # Dashboard & Overview
│   ├── pages/              # Dashboard pages (Dashboard, Services)
│   ├── components/         # Dashboard components
│   ├── services/           # Dashboard services (if any)
│   ├── types/              # Dashboard type definitions (if any)
│   └── index.ts            # Feature exports
│
└── index.ts                # Main features export
```

## Benefits of This Structure

### 🎯 **Feature-Based Organization**
- Each business domain is self-contained
- Easy to locate related functionality
- Clear separation of concerns

### 🔧 **Maintainability**
- Changes to a feature are isolated
- Easier to refactor or remove features
- Reduced coupling between different business areas

### 👥 **Team Collaboration**
- Different teams can work on different features
- Clear ownership boundaries
- Easier code reviews

### 📦 **Scalability**
- Easy to add new features
- Consistent structure across all features
- Reusable patterns

## Usage Examples

### Importing from Features
```typescript
// Import specific components
import { Login, SignUp } from '@/features/auth';
import { MenuItems, CategoryForm } from '@/features/menu';
import { Orders, OrderCard } from '@/features/orders';

// Import entire feature
import * as AuthFeature from '@/features/auth';
import * as MenuFeature from '@/features/menu';
```

### Adding New Features
1. Create new feature directory: `src/features/new-feature/`
2. Add subdirectories: `pages/`, `components/`, `services/`, `types/`
3. Create `index.ts` for exports
4. Update main `src/features/index.ts`
5. Update route configuration if needed

## Migration Notes

This structure was migrated from the previous flat structure:
- `src/pages/` → `src/features/*/pages/`
- `src/components/auth/` → `src/features/auth/components/`
- `src/components/menu/` → `src/features/menu/components/`
- `src/components/order/` → `src/features/orders/components/`
- `src/components/orders/` → `src/features/orders/components/`
- `src/components/settings/` → `src/features/settings/components/`

All import statements have been updated to reflect the new structure.
