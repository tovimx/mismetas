# Claude Code Development Guidelines

This document contains specific guidelines for Claude Code when working on this project.

## API Abstraction Layer

### Overview
This project uses an API abstraction layer pattern to separate business logic from implementation details. This makes the codebase more maintainable, testable, and flexible.

### Architecture

```
src/
├── lib/
│   └── api/
│       ├── client.ts      # Base API client with error handling
│       ├── types.ts       # Centralized TypeScript types
│       └── services/      # Domain-specific service modules
│           ├── goals.ts   # Goal-related API functions
│           └── ...        # Other service modules
```

### Guidelines

1. **Never use `fetch` directly in components**
   - Always use service functions from `/lib/api/services/`
   - This allows easy switching between implementations (REST, GraphQL, Server Actions)

2. **Service Function Pattern**
   ```typescript
   // ✅ GOOD: Service function
   export async function validateGoal(goalText: string): Promise<ValidationResult> {
     // Implementation details hidden here
   }

   // ❌ BAD: Direct fetch in component
   const response = await fetch('/api/validate-goal', {...});
   ```

3. **Type Safety**
   - All request/response types must be defined in `/lib/api/types.ts`
   - Use TypeScript interfaces for all API contracts
   - Export types that components need

4. **Error Handling**
   - Service functions should handle errors gracefully
   - Return standardized error objects
   - Use the `ApiError` class for consistent error handling

5. **Testing**
   - Mock at the service level, not HTTP level
   - Tests should import from service modules
   - Service functions should be pure and easily mockable

### Example Implementation

When implementing a new API feature:

1. Define types in `/lib/api/types.ts`:
   ```typescript
   export interface CreateUserRequest {
     name: string;
     email: string;
   }
   
   export interface CreateUserResponse {
     id: string;
     name: string;
     email: string;
   }
   ```

2. Create service function in `/lib/api/services/users.ts`:
   ```typescript
   import { CreateUserRequest, CreateUserResponse } from '../types';
   
   export async function createUser(data: CreateUserRequest): Promise<CreateUserResponse> {
     // Implementation (server action, REST, etc.)
   }
   ```

3. Use in component:
   ```typescript
   import { createUser } from '@/lib/api/services/users';
   
   const handleSubmit = async (data) => {
     const user = await createUser(data);
     // Handle response
   };
   ```

### Benefits

- **Flexibility**: Switch between REST, GraphQL, or Server Actions without changing components
- **Testability**: Mock service functions instead of HTTP requests
- **Type Safety**: Full TypeScript support across boundaries
- **Maintainability**: Single source of truth for API logic
- **Consistency**: Standardized error handling and response formats

## Other Guidelines

### Form Validation
- Use multi-layer validation (client + server/AI)
- Provide immediate feedback with friendly, short messages
- Use emojis sparingly for friendly error messages

### UI/UX Patterns
- Prefer visual elements (badges, chips) over text fields when collecting categorical data
- Show loading states for all async operations
- Debounce API calls appropriately (800ms for search/validation)

### Testing Strategy
- Write behavior-focused tests, not implementation tests
- Test user interactions, not internal state
- Mock at the service layer for API calls