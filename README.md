![Banner](./workdocs/assets/Banner.png)

## User Interface Decorators

A TypeScript library that provides a declarative approach to UI rendering through model decorators. It extends the functionality of `@decaf-ts/decorator-validation` by adding UI rendering capabilities to models, allowing them to be automatically rendered as UI components with proper validation and styling.

The library offers a flexible rendering engine architecture that can be extended to support different UI frameworks (React, Angular, HTML5, etc.) while maintaining a consistent model-driven approach to UI development. It bridges the gap between data models and their visual representation, enabling developers to define UI behavior directly on their domain models.


![Licence](https://img.shields.io/github/license/decaf-ts/ui-decorators.svg?style=plastic)
![GitHub language count](https://img.shields.io/github/languages/count/decaf-ts/ui-decorators?style=plastic)
![GitHub top language](https://img.shields.io/github/languages/top/decaf-ts/ui-decorators?style=plastic)

[![Build & Test](https://github.com/decaf-ts/ui-decorators/actions/workflows/nodejs-build-prod.yaml/badge.svg)](https://github.com/decaf-ts/ui-decorators/actions/workflows/nodejs-build-prod.yaml)
[![CodeQL](https://github.com/decaf-ts/ui-decorators/actions/workflows/codeql-analysis.yml/badge.svg)](https://github.com/decaf-ts/ui-decorators/actions/workflows/codeql-analysis.yml)[![Snyk Analysis](https://github.com/decaf-ts/ui-decorators/actions/workflows/snyk-analysis.yaml/badge.svg)](https://github.com/decaf-ts/ui-decorators/actions/workflows/snyk-analysis.yaml)
[![Pages builder](https://github.com/decaf-ts/ui-decorators/actions/workflows/pages.yaml/badge.svg)](https://github.com/decaf-ts/ui-decorators/actions/workflows/pages.yaml)
[![.github/workflows/release-on-tag.yaml](https://github.com/decaf-ts/ui-decorators/actions/workflows/release-on-tag.yaml/badge.svg?event=release)](https://github.com/decaf-ts/ui-decorators/actions/workflows/release-on-tag.yaml)

![Open Issues](https://img.shields.io/github/issues/decaf-ts/ui-decorators.svg)
![Closed Issues](https://img.shields.io/github/issues-closed/decaf-ts/ui-decorators.svg)
![Pull Requests](https://img.shields.io/github/issues-pr-closed/decaf-ts/ui-decorators.svg)
![Maintained](https://img.shields.io/badge/Maintained%3F-yes-green.svg)

![Forks](https://img.shields.io/github/forks/decaf-ts/ui-decorators.svg)
![Stars](https://img.shields.io/github/stars/decaf-ts/ui-decorators.svg)
![Watchers](https://img.shields.io/github/watchers/decaf-ts/ui-decorators.svg)

![Node Version](https://img.shields.io/badge/dynamic/json.svg?url=https%3A%2F%2Fraw.githubusercontent.com%2Fbadges%2Fshields%2Fmaster%2Fpackage.json&label=Node&query=$.engines.node&colorB=blue)
![NPM Version](https://img.shields.io/badge/dynamic/json.svg?url=https%3A%2F%2Fraw.githubusercontent.com%2Fbadges%2Fshields%2Fmaster%2Fpackage.json&label=NPM&query=$.engines.npm&colorB=purple)

Documentation available [here](https://decaf-ts.github.io/ui-decorators/)

### Description

The UI Decorators library is an extension of `@decaf-ts/decorator-validation` and `@decaf-ts/db-decorators` that provides a comprehensive framework for automatic model rendering in user interfaces. It enables a declarative approach to UI development by allowing developers to define how their data models should be rendered directly on the model classes and properties.

#### Core Functionality

- **Model Rendering**: Extends the Model class with the ability to render itself as a UI component
- **Flexible Rendering Engine**: Provides an abstract RenderingEngine class that can be implemented for different UI frameworks
- **Validation Integration**: Automatically applies validation rules from `@decaf-ts/decorator-validation` to UI elements
- **CRUD Operation Support**: Controls element visibility and behavior based on the current CRUD operation (Create, Read, Update, Delete)
- **List Rendering**: Special support for rendering collections of models as lists with customizable item templates

#### Class Decorators

- **`@uimodel(tag?, props?)`**: Marks a class as a UI model and specifies how it should be rendered, including the HTML tag to use and additional properties
- **`@renderedBy(engine)`**: Specifies which rendering engine implementation should be used for a particular model
- **`@uilistitem(tag?, props?)`**: Defines how a model should be rendered when it appears as an item in a list

#### Property Decorators

- **`@uiprop(propName?, stringify?)`**: Maps a model property to a UI component property, optionally with a different name or stringified
- **`@uielement(tag, props?, serialize?)`**: Maps a model property to a specific UI element with custom properties
- **`@uilistprop(propName?, props?)`**: Maps a model property containing a list to a list container component
- **`@hideOn(...operations)`**: Hides a property during specific CRUD operations
- **`@hidden()`**: Completely hides a property in all UI operations

#### Rendering Engine

The abstract `RenderingEngine` class provides the foundation for implementing rendering strategies for different UI frameworks:

- **Type Translation**: Converts between model types and HTML input types
- **Validation Handling**: Applies validation rules from the model to UI elements
- **Field Definition Generation**: Converts model metadata into UI field definitions
- **Engine Management**: Registers and retrieves rendering engine implementations
- **Extensibility**: Can be extended to support any UI framework or rendering strategy

#### Integration with Validation

The library seamlessly integrates with the validation system from `@decaf-ts/decorator-validation`, automatically applying validation rules to UI elements:

- Required fields
- Minimum and maximum values
- Minimum and maximum length
- Pattern matching
- Type-specific validation (email, URL, date, password)
- Custom validation rules

This integration ensures that UI components not only display data correctly but also enforce the same validation rules defined in the model.


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

You can render lists of models using the `@uilistitem` and `@uilistprop` decorators:

```typescript
import { Model, list } from '@decaf-ts/decorator-validation';
import { uimodel, uilistitem, uilistprop, uielement } from '@decaf-ts/ui-decorators';

// Define a list item model
@uimodel()
@uilistitem('li', { class: 'todo-item' })
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


### Related

[![decaf-ts](https://github-readme-stats.vercel.app/api/pin/?username=decaf-ts&repo=decaf-ts)](https://github.com/decaf-ts/decaf-ts)
[![decorator-validation](https://github-readme-stats.vercel.app/api/pin/?username=decaf-ts&repo=decorator-validation)](https://github.com/decaf-ts/decorator-validation)
[![db-decorators](https://github-readme-stats.vercel.app/api/pin/?username=decaf-ts&repo=db-decorators)](https://github.com/decaf-ts/db-decorators)


### Social

[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/decaf-ts/)




#### Languages

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![NodeJS](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![ShellScript](https://img.shields.io/badge/Shell_Script-121011?style=for-the-badge&logo=gnu-bash&logoColor=white)

## Getting help

If you have bug reports, questions or suggestions please [create a new issue](https://github.com/decaf-ts/ts-workspace/issues/new/choose).

## Contributing

I am grateful for any contributions made to this project. Please read [this](./workdocs/98-Contributing.md) to get started.

## Supporting

The first and easiest way you can support it is by [Contributing](./workdocs/98-Contributing.md). Even just finding a typo in the documentation is important.

Financial support is always welcome and helps keep both me and the project alive and healthy.

So if you can, if this project in any way. either by learning something or simply by helping you save precious time, please consider donating.

## License

This project is released under the [AGPL-3.0-or-later License](./LICENSE.md).

By developers, for developers...