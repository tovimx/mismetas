# mismetas.com

A collaborative goal-tracking web application that helps users set goals, track progress, and celebrate small wins.

## Steps to run the project

1.  create the .env file at the root and add the secrets. @tovimx
2.  install docker.
3.  make sure docker is running `docker ps`
4.  run `npm run db:up`
5.  run `npm run db:generate`
6.  run `npm run db:push`
7.  run the app `npm run dev:full`

## Project Overview

MisMetas.com (English: "MyGoals") is a web application designed to help users:

- Register and create personal accounts
- Set meaningful personal and professional goals
- Track progress with numerical indicators
- Invite collaborators to work on shared goals
- Visualize progress and celebrate small wins along the way

## Technology Stack

- **Frontend**: Next.js with App Router
- **Styling**: Tailwind CSS with shadcn/ui components
- **Language**: TypeScript
- **Form Management**: TanStack Form (type-safe form state handling)
- **Database**: PostgreSQL
- **ORM**: Prisma (TypeScript-first ORM with excellent PostgreSQL support)
- **Authentication**: NextAuth.js with OAuth providers
- **AI Integration**: Google Generative AI (Gemini) and Anthropic Claude
- **Hosting**: AWS

## Development Rules

### Code Quality Rules

1. **TypeScript Strict Mode**: All code must be properly typed with TypeScript's strict mode enabled
2. **ESLint**: Code must pass all ESLint checks before committing
3. **Prettier**: All code must follow the project's formatting guidelines
4. **Testing**: Critical components and features must include tests

### Project Structure Rules

1. **Feature-based Organization**:

   - `/src/app/` - App router pages and layouts
   - `/src/components/` - Reusable UI components
   - `/src/features/` - Feature-specific components and logic
   - `/src/lib/` - Utility functions and shared code
   - `/src/lib/api/` - API abstraction layer (see below)
   - `/src/db/` - Database models and query functions
   - `/prisma/` - Prisma schema and migrations

2. **Component Naming**:

   - PascalCase for component files
   - Descriptive names that reflect the component's purpose
   - Feature-specific components should be prefixed with the feature name

3. **API Structure**:
   - RESTful API design principles
   - Consistent error handling and response formats
   - Authentication middleware for protected routes

### API Abstraction Layer

This project uses an API abstraction layer pattern to separate API calls from components. This makes the codebase more maintainable, testable, and flexible.

1. **Architecture**:
   ```
   src/lib/api/
   ├── client.ts      # Base API client with error handling
   ├── types.ts       # Centralized TypeScript types
   └── services/      # Domain-specific service modules
       ├── goals.ts   # Goal-related API functions
       └── ...        # Other service modules
   ```

2. **Usage Rules**:
   - **Never use `fetch` directly in components**
   - Always use service functions from `/lib/api/services/`
   - All API types must be defined in `/lib/api/types.ts`
   - Service functions should handle errors gracefully

3. **Benefits**:
   - Easy switching between REST APIs and Server Actions
   - Mockable service functions for testing
   - Type-safe API contracts
   - Consistent error handling

4. **Example**:
   ```typescript
   // ✅ GOOD: Using service function
   import { createGoal } from '@/lib/api/services/goals';
   const goal = await createGoal(data);

   // ❌ BAD: Direct fetch in component
   const response = await fetch('/api/goals', {...});
   ```

For detailed guidelines, see [CLAUDE.md](./CLAUDE.md).

### Database Rules

1. **Schema Design**:

   - Clear table relationships with appropriate foreign keys
   - Use of indexes for frequently queried fields
   - Consistent naming conventions for tables and columns

2. **Data Access**:

   - No direct SQL in components - use abstracted data access methods
   - Transactions for operations affecting multiple records
   - Input validation before database operations

3. **Prisma ORM Usage**:
   - All database schemas defined in the Prisma schema file
   - Use of Prisma Client for type-safe database queries
   - Migrations managed through Prisma Migrate
   - Follow the repository pattern for organizing database access logic
   - Leverage Prisma's relation queries for efficient data loading

### Collaboration Rules

1. **Git Workflow**:

   - Feature branches from main
   - Pull requests with code reviews before merging
   - Conventional commits for clear changelogs

2. **Documentation**:
   - JSDoc comments for functions and components
   - README updates for new features
   - API documentation for backend endpoints
   - Document database schema changes in migration descriptions

## Getting Started

[Installation and setup instructions will be added here]

## License

[License information]

## Code Formatting and Linting

This project uses Prettier and ESLint for code formatting and linting:

### Tools and Configuration

- **Prettier**: For consistent code formatting
- **ESLint**: For code quality and best practices
- **Husky**: For pre-commit hooks
- **lint-staged**: For running linters on staged files

### Available Scripts

- `npm run format`: Format all files with Prettier
- `npm run lint`: Check for ESLint issues
- `npm run lint:fix`: Fix automatically fixable ESLint issues
- `npm run fix`: Run both format and lint:fix commands

### Pre-commit Hooks

When you commit code, Husky will automatically run Prettier and ESLint on your staged files to ensure code quality and consistency.

### VS Code Integration

If you're using VS Code, the project includes settings for:

- Format on save
- ESLint auto-fix on save
- Using the correct formatters for each file type

Install the Prettier and ESLint extensions in VS Code for the best experience.

## Using Icons

The application uses Lucide React for icons, with a custom wrapper component for consistent usage across the app.

### Adding New Icons

1. Import the icon from `lucide-react` in `src/components/ui/icons.tsx`:

   ```typescript
   import { Plus, Trash, Edit } from 'lucide-react';
   ```

2. Add it to the `Icons` object:
   ```typescript
   export const Icons = {
     plus: Plus,
     trash: Trash,
     edit: Edit,
   } as const;
   ```

### Using Icons in Components

1. Import the Icon component:

   ```typescript
   import { Icon } from '@/components/ui/icon';
   ```

2. Use it in your component:
   ```typescript
   <Icon name="plus" className="h-4 w-4" />
   ```

The Icon component accepts the following props:

- `name`: The name of the icon (must be a key from the Icons object)
- `size`: The size of the icon (defaults to 16)
- `className`: Additional CSS classes
- All standard HTML div props

Example usage:

```typescript
// Basic usage
<Icon name="plus" />

// With custom size
<Icon name="trash" size={20} />

// With additional classes
<Icon name="edit" className="text-primary" />

// In a button
<button className="flex items-center gap-2">
  <Icon name="plus" className="h-4 w-4" />
  Add Item
</button>
```
