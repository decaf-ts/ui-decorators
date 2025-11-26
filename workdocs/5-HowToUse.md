### How to Use

- [Initial Setup](../../workdocs/tutorials/For%20Developers.md#_initial-setup_)
- [Installation](../../workdocs/tutorials/For%20Developers.md#installation)

## Basic Usage

### Creating a UI Model

The most basic usage involves decorating a model class with `@uimodel` to make it renderable:

```typescript
import { Model, attribute } from '@decaf-ts/decorator-validation';
import { uimodel, uielement } from '@decaf-ts/ui-decorators';

@uimodel()
class UserProfile extends Model {
  @attribute()
  @uielement('input', { type: 'text', placeholder: 'Enter your name' })
  name: string;

  @attribute()
  @uielement('input', { type: 'email', placeholder: 'Enter your email' })
  email: string;
}

// Create an instance
const user = new UserProfile();
user.name = 'John Doe';
user.email = 'john@example.com';

// Render the model (the actual rendering depends on the registered rendering engine)
const renderedUI = user.render();
```

### Customizing UI Model Rendering

You can customize how a model is rendered by providing a tag and properties to the `@uimodel` decorator:

```typescript
import { Model, attribute } from '@decaf-ts/decorator-validation';
import { uimodel, uielement } from '@decaf-ts/ui-decorators';

@uimodel('div', { class: 'user-card', style: 'border: 1px solid #ccc; padding: 16px;' })
class UserCard extends Model {
  @attribute()
  @uielement('h2', { class: 'user-name' })
  name: string;

  @attribute()
  @uielement('p', { class: 'user-bio' })
  bio: string;
}
```

### Specifying a Rendering Engine

You can specify which rendering engine to use for a particular model:

```typescript
import { Model, attribute } from '@decaf-ts/decorator-validation';
import { uimodel, renderedBy, uielement } from '@decaf-ts/ui-decorators';

@uimodel()
@renderedBy('react')
class ReactComponent extends Model {
  @attribute()
  @uielement('input', { type: 'text' })
  title: string;
}
```

### Mapping Properties to UI Elements

The `@uielement` decorator maps a model property to a specific UI element:

```typescript
import { Model, attribute, required, minLength, maxLength } from '@decaf-ts/decorator-validation';
import { uimodel, uielement } from '@decaf-ts/ui-decorators';

@uimodel('form')
class LoginForm extends Model {
  @attribute()
  @required()
  @minLength(3)
  @maxLength(50)
  @uielement('input', { 
    type: 'text', 
    placeholder: 'Username', 
    class: 'form-control' 
  })
  username: string;

  @attribute()
  @required()
  @minLength(8)
  @uielement('input', { 
    type: 'password', 
    placeholder: 'Password', 
    class: 'form-control' 
  })
  password: string;

  @attribute()
  @uielement('button', { 
    type: 'submit', 
    class: 'btn btn-primary' 
  })
  submitButton: string = 'Login';
}
```

### Mapping Properties to Component Properties

The `@uiprop` decorator maps a model property to a UI component property:

```typescript
import { Model, attribute } from '@decaf-ts/decorator-validation';
import { uimodel, uiprop } from '@decaf-ts/ui-decorators';

@uimodel('user-profile-component')
class UserProfile extends Model {
  @attribute()
  @uiprop() // Will be passed as 'fullName' to the component
  fullName: string;

  @attribute()
  @uiprop('userEmail') // Will be passed as 'userEmail' to the component
  email: string;

  @attribute()
  @uiprop('userData', true) // Will be passed as stringified JSON
  userData: Record<string, any>;
}
```

### Controlling Property Visibility

You can control when properties are visible using the `@hideOn` and `@hidden` decorators:

```typescript
import { Model } from '@decaf-ts/decorator-validation';
import { uimodel, uielement, hideOn, hidden } from '@decaf-ts/ui-decorators';
import { OperationKeys } from '@decaf-ts/db-decorators';

@uimodel()
class User extends Model {
  @uielement('input', { type: 'text' })
  username: string;

  @uielement('input', { type: 'password' })
  @hideOn(OperationKeys.READ) // Hide during READ operations
  password: string;

  @uielement('input', { type: 'text' })
  @hidden() // Completely hidden in all operations
  internalId: string;
}
```

### Rendering Lists of Models

You can render lists of models using the `@uilistmodel` and `@uilistprop` decorators:

```typescript
import { Model, list } from '@decaf-ts/decorator-validation';
import { uimodel, uilistmodel, uilistprop, uielement } from '@decaf-ts/ui-decorators';

// Define a list item model
@uimodel()
@uilistmodel('li', { class: 'todo-item' })
class TodoItem extends Model {
  @uielement('span', { class: 'todo-text' })
  text: string;

  @uielement('input', { type: 'checkbox' })
  completed: boolean;
}

// Define a list container model
@uimodel('div', { class: 'todo-app' })
class TodoList extends Model {
  @uielement('h1')
  title: string = 'My Todo List';

  @list(TodoItem)
  @uilistprop('items', { class: 'todo-items-container' })
  items: TodoItem[];
}

// Usage
const todoList = new TodoList();
todoList.items = [
  new TodoItem({ text: 'Learn TypeScript', completed: true }),
  new TodoItem({ text: 'Build a UI with decorators', completed: false })
];

const renderedList = todoList.render();
```

## Creating a Custom Rendering Engine

To implement a custom rendering engine for a specific UI framework, you need to extend the `RenderingEngine` abstract class:

```typescript
import { Model } from '@decaf-ts/decorator-validation';
import { RenderingEngine, FieldDefinition } from '@decaf-ts/ui-decorators';

// Define the output type for your rendering engine
type ReactElement = any; // Replace with actual React element type

// Create a custom rendering engine for React
class ReactRenderingEngine extends RenderingEngine<ReactElement> {
  constructor() {
    super('react'); // Specify the engine flavor
  }

  // Initialize the engine (required abstract method)
  async initialize(...args: any[]): Promise<void> {
    // Import React or perform any other initialization
    this.initialized = true;
  }

  // Implement the render method (required abstract method)
  render<M extends Model>(
    model: M,
    globalProps: Record<string, unknown> = {},
    ...args: any[]
  ): ReactElement {
    // Convert the model to a field definition
    const fieldDef = this.toFieldDefinition(model, globalProps);

    // Convert the field definition to a React element
    return this.createReactElement(fieldDef);
  }

  // Helper method to create React elements
  private createReactElement(fieldDef: FieldDefinition<ReactElement>): ReactElement {
    // Implementation would use React.createElement or JSX
    // This is just a placeholder
    return {
      type: fieldDef.tag,
      props: {
        ...fieldDef.props,
        children: fieldDef.children?.map(child => this.createReactElement(child))
      }
    };
  }
}

// Register the custom rendering engine
new ReactRenderingEngine();

// Now models can specify to use this engine
@uimodel()
@renderedBy('react')
class ReactComponent extends Model {
  // ...
}
```

## Integration with Validation

The UI decorators library automatically integrates with the validation system from `@decaf-ts/decorator-validation`:

```typescript
import { Model, required, email, minLength, pattern } from '@decaf-ts/decorator-validation';
import { uimodel, uielement } from '@decaf-ts/ui-decorators';

@uimodel('form', { class: 'registration-form' })
class RegistrationForm extends Model {
  @required()
  @minLength(3)
  @uielement('input', { type: 'text', placeholder: 'Username' })
  username: string;

  @required()
  @email()
  @uielement('input', { type: 'email', placeholder: 'Email' })
  email: string;

  @required()
  @minLength(8)
  @pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/) // Requires lowercase, uppercase, and digit
  @uielement('input', { type: 'password', placeholder: 'Password' })
  password: string;

  // Validation will be automatically applied to the rendered UI elements
}
```

## Complete Example

Here's a complete example showing how to use the UI decorators library to create a user registration form:

```typescript
import { Model, attribute, required, email, minLength, maxLength, pattern } from '@decaf-ts/decorator-validation';
import { uimodel, uielement, renderedBy } from '@decaf-ts/ui-decorators';

@uimodel('form', { class: 'registration-form', id: 'user-registration' })
@renderedBy('html5') // Use the HTML5 rendering engine
class UserRegistration extends Model {
  @required()
  @minLength(2)
  @maxLength(50)
  @uielement('input', { 
    type: 'text', 
    placeholder: 'First Name',
    class: 'form-control'
  })
  firstName: string;

  @required()
  @minLength(2)
  @maxLength(50)
  @uielement('input', { 
    type: 'text', 
    placeholder: 'Last Name',
    class: 'form-control'
  })
  lastName: string;

  @required()
  @email()
  @uielement('input', { 
    type: 'email', 
    placeholder: 'Email Address',
    class: 'form-control'
  })
  email: string;

  @required()
  @minLength(8)
  @pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
  @uielement('input', { 
    type: 'password', 
    placeholder: 'Password (min 8 chars, include uppercase, lowercase, number, and special char)',
    class: 'form-control'
  })
  password: string;

  @required()
  @uielement('select', { class: 'form-control' })
  country: string;

  @attribute()
  @uielement('textarea', { 
    placeholder: 'Tell us about yourself',
    class: 'form-control',
    rows: 4
  })
  bio: string;

  @uielement('input', { 
    type: 'checkbox',
    class: 'form-check-input'
  })
  acceptTerms: boolean = false;

  @uielement('button', { 
    type: 'submit',
    class: 'btn btn-primary'
  })
  submitButton: string = 'Register';
}

// Create an instance
const registration = new UserRegistration();

// Render the form
const form = registration.render();

// Check for validation errors
const errors = registration.hasErrors();
if (errors) {
  console.error('Validation errors:', errors);
}
```

This example demonstrates how to create a complete registration form with various input types and validation rules, all defined declaratively using decorators.


## Coding Principles

- group similar functionality in folders (analog to namespaces but without any namespace declaration)
- one class per file;
- one interface per file (unless interface is just used as a type);
- group types as other interfaces in a types.ts file per folder;
- group constants or enums in a constants.ts file per folder;
- group decorators in a decorators.ts file per folder;
- always import from the specific file, never from a folder or index file (exceptions for dependencies on other packages);
- prefer the usage of established design patters where applicable:
  - Singleton (can be an anti-pattern. use with care);
  - factory;
  - observer;
  - strategy;
  - builder;
  - etc;

## Release Documentation Hooks
Stay aligned with the automated release pipeline by reviewing [Release Notes](./workdocs/reports/RELEASE_NOTES.md) and [Dependencies](./workdocs/reports/DEPENDENCIES.md) after trying these recipes (updated on 2025-11-26).
