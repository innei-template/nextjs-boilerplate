# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development

- `pnpm dev` - Start development server with Vite HMR
- `pnpm dev:trial` - Start development server in trial mode
- `pnpm build` - Build for production (runs TypeScript check + Vite build)
- `pnpm build:production` - Build with production optimizations
- `pnpm build:trial` - Build in trial mode
- `pnpm serve` - Preview production build

### Electron Development

- `pnpm electron:dev` - Start Electron development server
- `pnpm electron:build` - Build Electron application
- `pnpm electron:make` - Create distributable packages
- `pnpm electron:make:darwin` - Create macOS-specific packages

### Code Quality

- `pnpm lint` - Run ESLint with auto-fix
- `pnpm format` - Format TypeScript files with Prettier
- `pnpm typecheck` - Run TypeScript type checking (from layer/renderer)
- Package manager: **pnpm** (required, specified in packageManager field)

## Architecture

### Core Stack

- **Vite** + React 19 + TypeScript with file-based routing
- **State Management**: Zustand stores (primary) + Jotai atoms (secondary)
- **UI Components**: Radix UI primitives + custom components in `layer/renderer/src/components/ui/`
- **Styling**: TailwindCSS 4 with Pastel color system
- **Routing**: React Router with auto-generated routes via `vite-plugin-route-builder`
- **Platform**: Multi-platform (Electron desktop app + web interface)
- **API Integration**: qBittorrent Web API via `@innei/qbittorrent-browser`

### Key Architectural Patterns

#### File-Based Routing

- Pages in `src/pages/` automatically generate routes via vite plugin
- Routes are generated in `src/generated-routes.ts` (auto-generated, do not edit)
- Route structure: `src/pages/(main)/index.sync.tsx` becomes root route

**Route Types**:

- **Sync Routes**: `.sync.tsx` files are synchronous routes without code splitting
- **Async Routes**: `.tsx` files are asynchronous routes with lazy loading and code splitting

**Layout System**:

- **Layout Files**: `layout.tsx` files serve as layout containers for their segment
- **Child Rendering**: Use `<Outlet />` within layout components to render child routes
- **Nesting**: Layouts automatically wrap their corresponding route segments

**Documentation Reference**:

- For detailed usage, advanced patterns, and configuration options, refer to the official documentation at [vite-plugin-route-builder](https://github.com/Innei/vite-plugin-route-builder)
- **Important**: When encountering unclear routing patterns or advanced use cases, always consult the official documentation before implementation

#### Component Organization

- **Base UI**: `layer/renderer/src/components/ui/` - Reusable primitives (buttons, inputs, etc.)
- **Common**: `layer/renderer/src/components/common/` - App-specific shared components
- **Modules**: `layer/renderer/src/modules/` - Feature-specific components organized by domain
- **Path aliases**: Use `~/` for `layer/renderer/src/` imports (configured in tsconfig)

**Module Architecture**:

- **Universal Components**: Generic UI components like `button`, `input`, `select` belong in `layer/renderer/src/components/ui/`
- **Feature Components**: Domain-specific components should be organized by module in `layer/renderer/src/modules/`
- **Example**: Torrent-related components go in `layer/renderer/src/modules/torrent/`, connection components in `layer/renderer/src/modules/connection/`
- **Principle**: If a component is specific to a business domain/feature, place it in the corresponding module directory
- **Available Modules**: `torrent`, `connection`, `layout`, `modals`, `detail`, `prompts`, `dialogs`, `multi-server`, `hotkey`

#### State Management

- **Primary**: Zustand stores for complex state management (see Zustand Best Practices below)
- **Secondary**: Jotai store with custom `createAtomHooks` utility for simple reactive state
- Global store instance: `jotaiStore` from `layer/renderer/src/lib/jotai.ts`
- Atoms typically in `layer/renderer/src/atoms/` directory
- **Store Organization**: Feature-specific stores in module directories (e.g., `layer/renderer/src/modules/torrent/stores/`)

### Zustand Best Practices

#### Store Architecture

- **Centralized Selectors**: Create dedicated selector files (e.g., `torrent-selectors.ts`) with stable, reusable selector functions
- **Granular Subscriptions**: Use specific selectors that return only the data components actually need
- **Store Actions**: Define all state mutations as named actions in store setters, avoid direct `setState` calls

```typescript
// ✅ Good: Granular selector
export const selectTorrentSpeed = (state: TorrentStore, rowIndex: number, speedType: 'dlspeed' | 'upspeed') => {
  const torrent = state.torrents[rowIndex]
  return torrent?.[speedType] || 0
}

// ✅ Good: Using store actions
torrentStoreSetters.toggleSelection(hash, selected)

// ❌ Bad: Direct setState
useTorrentStore.setState(prev => ({ selectedTorrents: [...] }))
```

#### Component Subscription Patterns

- **Primitive Values**: Use `useCallback` with direct value return
- **Object Values**: Use `useShallow` wrapper for object comparisons
- **Deferred Values**: Use `useDeferredValue` for performance-critical list items

```typescript
// ✅ Primitive value - no useShallow needed
const speed = useTorrentStore(
  useCallback(
    (state) => selectTorrentSpeed(state, deferredRowIndex, speedType),
    [deferredRowIndex, speedType],
  ),
)

// ✅ Object value - use useShallow
const { name, category } = useTorrentStore(
  useShallow(
    useCallback(
      (state) => selectTorrentName(state, deferredRowIndex),
      [deferredRowIndex],
    ),
  ),
)

// ✅ Direct property access in selector (preferred)
const eta = useTorrentStore(
  useCallback(
    (state) => selectTorrentEta(state, deferredRowIndex).eta,
    [deferredRowIndex],
  ),
)
```

#### Performance Optimization Rules

- **Avoid Full Object Subscriptions**: Never subscribe to entire objects when only specific properties are needed
- **Use Function-Only Data with getState()**: For callbacks and event handlers that don't need reactivity
- **Stable Selectors**: Extract selector functions to module level or use `useCallback`
- **Component Self-Sufficiency**: Components should consume store data directly rather than receiving props

### React Performance Optimization Rules

#### Hook Usage Patterns

- **useCallback vs useMemo**: Use `useCallback` for selector functions, `useMemo` for expensive computations
- **useDeferredValue**: Use for performance-critical list rendering to defer non-urgent updates
- **Dependency Arrays**: Keep dependency arrays minimal and stable

```typescript
// ✅ Good: Stable callback with minimal dependencies
const handleSort = useCallback((key: string, direction: 'asc' | 'desc') => {
  torrentStoreSetters.setSorting(key as any, direction)
}, [])

// ✅ Good: Deferred value for list items
const deferredRowIndex = useDeferredValue(rowIndex)

// ❌ Bad: Recreating functions on every render
const handleClick = () => { /* ... */ }
```

#### Component Optimization

- **Prop Drilling Elimination**: Avoid passing data through multiple component layers
- **Zero Props Pattern**: Make components self-sufficient by consuming store data directly
- **Context Replacement**: Replace React Context with Zustand stores for better performance
- **Memo Usage**: Use `memo` sparingly, only for expensive pure components

```tsx
// ✅ Good: Self-sufficient component
export const TorrentTableToolbar = () => {
  return (
    <div>
      <FilterTabs />      {/* No props needed */}
      <AdvancedFilters /> {/* No props needed */}
    </div>
  )
}

// ❌ Bad: Prop drilling
export const TorrentTableToolbar = ({ stats, filterState, categories, tags }) => {
  return (
    <div>
      <FilterTabs stats={stats} filterState={filterState} />
      <AdvancedFilters categories={categories} tags={tags} filterState={filterState} />
    </div>
  )
}
```

#### List and Table Performance

- **Virtualization**: Use libraries like `react-window` or `fixed-data-table-2` for large lists
- **Key Props**: Use stable, unique keys for list items (prefer IDs over array indices)
- **Cell-Level Optimization**: Each table cell should subscribe only to its required data
- **Row Height Calculation**: Use functions for dynamic row heights instead of state

```typescript
// ✅ Good: Cell subscribes only to needed data
const speed = useTorrentStore(
  useCallback(
    (state) => selectTorrentSpeed(state, deferredRowIndex, speedType),
    [deferredRowIndex, speedType],
  ),
)

// ✅ Good: Function-based row height
const getRowHeight = useCallback((index: number) => {
  const { torrents } = useTorrentStore.getState()
  const torrent = torrents[index]
  return torrent?.tags?.length > 0 ? EXPANDED_ROW_HEIGHT : BASE_ROW_HEIGHT
}, [])
```

#### State Update Patterns

- **Batch Updates**: Group related state updates to avoid multiple re-renders
- **Immutable Updates**: Always create new objects/arrays for state updates
- **Conditional Updates**: Only update state when values actually change

#### Provider Architecture

- Root providers in `layer/renderer/src/providers/root-providers.tsx` with:
  - LazyMotion + MotionConfig for animations
  - QueryClient for React Query
  - Jotai Provider with global store
  - Context menu, event, and settings providers

#### Animation with Framer Motion

- **LazyMotion Integration**: Project uses Framer Motion with LazyMotion for optimized bundle size
- **Usage Rule**: Always use `m.` instead of `motion.` when creating animated components
- **Import**: `import { m } from 'framer/react'`, import from 'motion/react' not 'framer-motion'
- **Examples**: `m.div`, `m.button`, `m.span` (not `motion.div`, `motion.button`, etc.)
- **Benefits**: Reduces bundle size while maintaining all Framer Motion functionality

**Animation Presets**:

- **Prefer Spring Presets**: Use predefined spring animations from `layer/renderer/src/lib/spring.ts`
- **Available Presets Constants**: `Spring.presets.smooth`, `Spring.presets.snappy`, `Spring.presets.bouncy` (extracted from Apple's spring parameters)
- **Import**: `import { Spring } from '~/lib/spring'`
- **Usage Example**: `transition={Spring.presets.smooth}` or `transition={Spring.snappy(0.3, 0.1)}`
- **Customization**: All presets accept optional `duration` and `extraBounce` parameters

### Color System

- Uses Pastel color system via `@pastel-palette/tailwindcss`
- Kawaii-inspired OKLCH color space with sRGB and P3 fallbacks
- Three variants: regular (default), kawaii (softer), high-contrast (accessible)
- Defined in `.cursor/rules/color.mdc` - prefer these over standard Tailwind colors
- Dark mode support via TailwindCSS v4 built-in dark mode
- Color variants controlled via `data-contrast="low|high"` attributes

#### Color Categories & Usage

- **Semantic**: `text-text`, `bg-background`, `border-border` - core UI colors
- **Application**: `bg-accent`, `bg-primary`, `text-accent` - brand/action colors
- **Fill**: `bg-fill`, `bg-fill-secondary` - form controls, interactive elements, content containers
- **Material**: `bg-material-medium`, `bg-material-opaque` - glass morphism effects, overlays, semi-transparent surfaces

For complete color palette, usage details, and examples, visit the [Pastel GitHub repository](https://github.com/Innei/Pastel) and check the README for all available colors and implementation details.

### Code Style Rules

- ESLint config: `eslint-config-hyoban` with React-specific rules
- No location global usage (use `useLocation` or route utilities instead)
- Self-closing JSX components enforced for .tsx files
- Formatting handled by Prettier with git hooks
- **Language Requirement**: **ALL** user-facing text, labels, descriptions, and messages MUST be in English only
- **No Internationalization**: This project does not support multiple languages - use English for all UI text
- **Component Text**: All component labels, button text, error messages, placeholders, and tooltips must be in English
- **API Messages**: All user-visible API responses and error messages must be in English

### UI Interaction Patterns

#### Context Menu Usage
```typescript
import { MenuItemText, useShowContextMenu } from '~/atoms/context-menu'

const showContextMenu = useShowContextMenu()

const handleContextMenu = useCallback(async (e: React.MouseEvent) => {
  e.preventDefault(); e.stopPropagation()
  const menuItems = [
    new MenuItemText({
      label: 'Edit', icon: <i className="i-mingcute-edit-line" />,
      click: () => handleEdit(item)
    })
  ].filter(Boolean)
  await showContextMenu(menuItems, e)
}, [])

// Usage: <div onContextMenu={handleContextMenu} className="cursor-context-menu">
```

#### Prompt System Usage

The project uses a modal-based prompt system located in `layer/renderer/src/components/ui/prompts/`. There are two main prompt types:

**Basic Confirmation Prompts**:
```typescript
import { Prompt } from '~/components/ui/prompts/Prompt'

// Simple confirmation
await Prompt.prompt({
  title: 'Delete Item',
  description: 'Are you sure you want to delete this item?',
  variant: 'danger', // or 'info' (default)
  onConfirmText: 'Delete',
  onCancelText: 'Cancel',
  onConfirm: async () => {
    // Handle confirmation
  },
  onCancel: async () => {
    // Handle cancellation (optional)
  }
})

// With custom content
await Prompt.prompt({
  title: 'Delete Torrent',
  description: `Are you sure you want to delete "${torrentName}"?`,
  variant: 'danger',
  content: (
    <div className="flex items-center gap-2">
      <Checkbox onCheckedChange={handleCheck} />
      <label>Also Delete Local Files</label>
    </div>
  ),
  onConfirm: () => handleDelete(deleteFiles)
})
```

**Input Prompts**:
```typescript
// Input prompt with validation
const result = await Prompt.input({
  title: 'Rename Tag',
  description: 'Enter a new name for this tag',
  defaultValue: currentTagName,
  placeholder: 'Enter new tag name...',
  variant: 'info', // or 'danger'
  onConfirmText: 'Rename',
  onCancelText: 'Cancel',
  onConfirm: async (newName: string) => {
    // Handle the input value
  }
})

// result will be string | null
if (result) {
  // User confirmed with input
} else {
  // User cancelled
}
```

**Prompt Architecture**:
- **Base Components**: `BasePrompt.tsx` and `InputPrompt.tsx` in `~/components/ui/prompts/`
- **Specialized Prompts**: Feature-specific prompts in `~/modules/prompts/` (e.g., `DeleteTorrentPrompt`, `ModifyTagPrompt`)
- **Modal Integration**: Prompts use the Modal system for consistent behavior and animations
- **Keyboard Support**: Input prompts support Enter (confirm) and Escape (cancel) keys
- **Loading States**: Built-in loading states during async operations

**Common Usage Patterns**:
- **Destructive Actions**: Use `variant: 'danger'` for delete operations
- **Input Validation**: Handle validation in `onConfirm` callback
- **Custom Content**: Use `content` prop for checkboxes, additional controls
- **Async Operations**: All callbacks support async/await patterns

#### Imperative Modal System Usage

The project uses an imperative modal system via `layer/renderer/src/components/ui/modal/ModalManager.ts`. This is the **primary method** for displaying modals programmatically.

**Basic Modal Usage**:
```typescript
import { Modal } from '~/components/ui/modal/ModalManager'

// Present a modal component
const modalId = Modal.present(MyModalComponent, {
  // Props for the modal component
  title: 'Modal Title',
  data: someData
}, {
  // Optional modal content configuration
  size: 'md',
  overlay: true,
  closeOnOverlayClick: true
})

// Dismiss the modal
Modal.dismiss(modalId)
```

**Modal Component Pattern**:
```typescript
interface MyModalProps {
  title: string
  data: any
  onClose?: () => void
}

const MyModalComponent = ({ title, data, onClose }: MyModalProps) => {
  const handleClose = () => {
    onClose?.()
    // Modal will auto-dismiss when component unmounts
  }

  return (
    <div className="modal-content">
      <h2>{title}</h2>
      <div>{/* Modal content */}</div>
      <Button onClick={handleClose}>Close</Button>
    </div>
  )
}
```

**Key Features**:
- **Single Instance Enforcement**: Only one instance per component type is allowed
- **Automatic Management**: Modal state is managed globally via Jotai atoms
- **Programmatic Control**: Present and dismiss modals from anywhere in the app
- **Props Updates**: Re-presenting the same component updates its props and moves it to top
- **Automatic Cleanup**: Modal registry automatically handles cleanup on unmount

**Usage Guidelines**:
- Use `Modal.present()` for programmatic modal display (preferred method)
- Each modal component should handle its own close logic
- Modal components receive props directly, no need for additional state management
- Use unique component types to ensure proper single-instance behavior

## SDK Development Guidelines

### QBittorrent API Integration

- API integration via `@innei/qbittorrent-browser` package (fork of `@ctrl/qbittorrent`)
- Current version: `9.6.3` (aliased as `@ctrl/qbittorrent` in dependencies)
- Type definitions available at `@node_modules/.pnpm/@innei+qbittorrent-browser@*/node_modules/@innei/qbittorrent-browser/dist/src/qbittorrent.d.ts`
- If SDK lacks a specific API method, define a `requestXXXX` method in `QBittorrentClient`
- The method can utilize the `request()` method available on the instance
- Request parameters and return types should be defined based on the official qBittorrent Web API v2 documentation

### Project Structure

This is an **Electron + Web hybrid project** with a layered architecture:

- **`layer/main/`** - Electron main process code (Node.js environment)
- **`layer/renderer/`** - React application code (web environment)
  - Contains all UI components, stores, and frontend logic
  - Uses Vite for building and development
  - Path alias `~/` maps to `layer/renderer/src/`
- **Root level** - Electron packaging, build scripts, and global configuration
