# Frontend Component Architecture

## Project Structure

```
frontend/
├── components/                 # Reusable components
│   ├── FormInput.tsx          # Reusable input component
│   ├── FormButton.tsx         # Reusable button component
│   └── RegistrationForm.tsx   # Registration form logic
├── app/
│   ├── layout.tsx             # Root layout
│   ├── globals.css            # Global Tailwind styles
│   ├── page.tsx               # Home page
│   └── register/
│       └── page.tsx           # Registration page
└── ...
```

## Component Hierarchy

```
RegisterPage (app/register/page.tsx)
└── RegistrationForm (components/RegistrationForm.tsx)
    ├── FormInput x5
    └── FormButton
```

## Component Reusability

### FormInput Component
- **Purpose**: Render consistent text inputs across all forms
- **Props**:
  - `label`: Field label
  - `name`: Input field name
  - `type`: Input type (text, email, password, tel, etc.)
  - `placeholder`: Input placeholder
  - `value`: Current value
  - `onChange`: Change handler
  - `error`: Error message to display
  - `required`: Boolean flag for required indicator

**Usage Example**:
```tsx
<FormInput
  label="Email"
  name="email"
  type="email"
  placeholder="user@example.com"
  value={email}
  onChange={handleChange}
  error={errors.email}
  required
/>
```

### FormButton Component
- **Purpose**: Render consistent buttons with loading states
- **Props**:
  - `children`: Button label
  - `type`: Button type (submit, button, reset)
  - `onClick`: Click handler
  - `disabled`: Disabled state
  - `loading`: Loading state (shows spinner)
  - `variant`: Button style (primary/secondary)
  - `fullWidth`: Stretch to full width

**Usage Example**:
```tsx
<FormButton type="submit" loading={isLoading}>
  Create Account
</FormButton>
```

### RegistrationForm Component
- **Purpose**: Manage registration form state and logic
- **Features**:
  - Form validation (email format, password strength, field requirements)
  - Error handling and display
  - API integration (update endpoint as needed)
  - Success message display
  - Field-level error clearing on input
  - Client-side component (`'use client'`)

### RegisterPage Component
- **Purpose**: Page layout and composition
- **Features**:
  - Gradient background
  - Centered card design
  - Professional header section
  - Terms and privacy links footer

## Styling with Tailwind CSS

All components use Tailwind CSS for styling with:
- **Dark mode support**: Classes include `dark:` variants
- **Responsive design**: Responsive padding and sizing
- **Interactive states**: Hover, focus, and disabled states
- **Consistent spacing**: 4px based spacing scale (gap-2, px-4, py-2.5, etc.)

## Form Validation

The registration form validates:
- **Name**: Required, non-empty
- **Email**: Required, valid email format
- **Phone Number**: Required, valid format (digits, +, -, (), spaces)
- **Password**: Required, minimum 8 characters
- **Confirm Password**: Must match password field

## API Integration

### Current Configuration
- **Endpoint**: `http://localhost:5000/api/users/register`
- **Method**: POST
- **Content-Type**: application/json

### Payload Format
```json
{
  "name": "string",
  "email": "string",
  "password": "string",
  "phone_number": "string"
}
```

### Update Instructions
When backend is ready:
1. Update the endpoint URL in `components/RegistrationForm.tsx`
2. Adjust payload format if needed to match your API
3. Handle additional response codes as needed

## Extending for New Components

For **Login**, **Dashboard**, **Preferences**, etc., follow this pattern:

1. **Create form components** in `components/`:
   ```
   components/
   ├── LoginForm.tsx
   ├── PreferencesForm.tsx
   ├── ProfileForm.tsx
   └── ...
   ```

2. **Create pages** in `app/`:
   ```
   app/
   ├── login/
   │   └── page.tsx
   ├── dashboard/
   │   └── page.tsx
   ├── preferences/
   │   └── page.tsx
   └── ...
   ```

3. **Reuse components**:
   - Use `FormInput` and `FormButton` for consistency
   - Create new form-specific components as needed
   - Keep each page's layout separate

## Styling Guidelines

### Color Palette
- **Primary**: Blue (blue-600 / dark: blue-700)
- **Secondary**: Gray (gray-200 / dark: gray-700)
- **Error**: Red (red-500 / dark: red-400)
- **Success**: Green (green-500 / dark: green-400)

### Typography
- Uses Geist Sans font (from Google Fonts, imported in layout.tsx)
- Font sizes: text-xs, text-sm, text-base, text-3xl, etc.
- Font weights: regular, medium, bold, semibold

### Spacing
- Consistent use of Tailwind spacing scale
- Form field gaps: `gap-2` (8px)
- Container padding: `p-8`
- Section margins: `mb-8`

## Best Practices Applied

✅ **Component Separation**: Each component has a single responsibility
✅ **Reusability**: Form components can be used across multiple forms
✅ **Error Handling**: Field-level and form-level error display
✅ **Accessibility**: Proper labels, required indicators, ARIA-friendly structure
✅ **Dark Mode**: Full dark mode support on all components
✅ **Performance**: Client-side component only where needed
✅ **Type Safety**: Full TypeScript support with interfaces
✅ **Scalability**: Easy to extend with new components
