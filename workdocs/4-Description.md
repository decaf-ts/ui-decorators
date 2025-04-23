### Description

Extension of `db-decorators`, exposes a simple implementation to handle automatic model rendering:
- decorate classes and attributes as UI elements or UI element properties;
- provides the base objects to implement `RenderingEngine` specific to each tech (Ionic, Angular, React, HTML5, etc);
    - automatic CRUD view rendering;
    - automatic UI validation according to `decorator-validation`'s decorators;
    - enables automatic custom validation (not HTML standard);

Adds a new Decorator ```uimodel``` to add UI metadata to the model, that can be later interpreted by different rendering strategies
Adds a new Decorator ```uiprop``` to add UI metadata to the model's properties, that can later be converted into properties for the `uimodel`
Adds a new Decorator ```uielement``` to add UI metadata to the model's properties, that can later be converted into Graphical elements
Adds a new Decorator ```hideOn``` to add UI metadata to the model's properties, so heir visibility can be controlled depending on the CRUD operation
