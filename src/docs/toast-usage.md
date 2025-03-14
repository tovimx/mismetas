# Toast Notification System

Our application uses a global toast notification system to provide feedback to users. The system supports different variants (success, error) and can be accessed from anywhere in the application.

## Features

- **Global Access**: Use toasts from any component in the application
- **Multiple Variants**: Choose between success and error styles
- **Auto-Dismissal**: Toasts automatically dismiss after 5 seconds (configurable)
- **Custom Duration**: Set custom duration for individual toasts
- **Readable API**: Simple and intuitive API for showing notifications

## Implementation Details

The toast system consists of:

1. **Toast Components** (`src/components/ui/toast.tsx`): The UI components for rendering toasts
2. **Toast Provider** (`src/components/ui/toaster.tsx`): Context provider that manages toast state
3. **Global Provider Integration** (`src/app/providers.tsx`): Makes toasts available throughout the app

## How to Use

### Basic Usage

```tsx
'use client'

import { useToast } from '@/components/ui/toaster'

function MyComponent() {
  const { addToast } = useToast()
  
  function handleSuccess() {
    addToast({
      title: 'Success!',
      description: 'Operation completed successfully',
      variant: 'success',
    })
  }
  
  function handleError() {
    addToast({
      title: 'Error!',
      description: 'Something went wrong',
      variant: 'error',
    })
  }
  
  // Use in event handlers, form submissions, etc.
}
```

### API Reference

The `useToast()` hook provides the following:

| Method | Parameters | Description |
|--------|------------|-------------|
| `addToast` | `{ title, description, variant, duration }` | Shows a new toast notification |
| `removeToast` | `id` | Manually removes a specific toast |
| `toasts` | - | Array of current toast objects |

#### Toast Configuration Options

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `title` | `string` | Required | Main toast message |
| `description` | `string` | Optional | Additional details |
| `variant` | `'success' \| 'error'` | Required | Visual style |
| `duration` | `number` | `5000` | Time in ms before auto-dismiss |

## Examples

### Success Toast After Form Submission

```tsx
const handleSubmit = async (formData) => {
  try {
    await submitForm(formData)
    addToast({
      title: 'Form Submitted',
      description: 'Your data has been saved successfully',
      variant: 'success',
    })
  } catch (error) {
    addToast({
      title: 'Submission Failed',
      description: error.message || 'Please try again',
      variant: 'error',
    })
  }
}
```

### Error Toast for API Failures

```tsx
const fetchData = async () => {
  try {
    setLoading(true)
    const data = await api.getData()
    setData(data)
  } catch (error) {
    addToast({
      title: 'Failed to load data',
      description: 'Please check your connection and try again',
      variant: 'error',
      duration: 7000, // Longer duration for important errors
    })
  } finally {
    setLoading(false)
  }
}
```

### Custom Duration

```tsx
// Show an important notice for 10 seconds
addToast({
  title: 'Scheduled Maintenance',
  description: 'The system will be unavailable tonight from 2-4 AM',
  variant: 'error',
  duration: 10000,
})
```

## Best Practices

1. **Informative Messages**: Provide clear, actionable information in toast messages
2. **Appropriate Timing**: Use longer durations for important messages
3. **Consistent Usage**: Use success toasts for confirmations and error toasts for problems
4. **Concise Content**: Keep toast messages brief and to the point 