# mismetas.com

A collaborative goal-tracking web application that helps users set goals, track progress, and celebrate small wins.

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
- **Database**: PostgreSQL
- **ORM**: Prisma (TypeScript-first ORM with excellent PostgreSQL support)
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