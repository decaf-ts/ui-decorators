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
