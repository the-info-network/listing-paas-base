# @listing-platform/forms

Dynamic form builder SDK for creating custom forms and fields.

## Features

- **Form Builder** - Drag-and-drop form creation
- **Field Types** - Text, number, select, checkbox, date, file, etc.
- **Validation** - Built-in and custom validation rules
- **Conditional Logic** - Show/hide fields based on conditions

## Usage

```tsx
import { DynamicForm, FormBuilder, useFormSubmit } from '@listing-platform/forms';

// Render dynamic form from schema
<DynamicForm schema={formSchema} onSubmit={handleSubmit} />

// Form builder UI
<FormBuilder onSave={(schema) => saveForm(schema)} />
```

## License

MIT
