# Scaffolding

Scaffolding is a package created for easy building of directories and files, based on a blueprint.<br>
The package was designed for create reusability, allowing template variables, and CRUD operations for blueprints.

Examples of usage:

```javascript
import { createScaffoldingService } from '@gus_hill/scaffolding';

const scaffoldingService = createScaffoldingService();
scaffoldingService.build({
  blueprint: {
    items: [
      new DirectoryBlueprint('src', [
        new FileBlueprint('index.js', 'console.log("Hello World");'),
      ]),
      new FileBlueprint('package.json', '{ "name": "$packageName" }'),
    ],
  },
  variables: {
    packageName: "sample_package"
  },
  outputDirectory: "C:\\sample_package"
})
  .then(() => console.log("Built blueprint successfully!"))
  .catch((err) => console.error("An error has occurred", err));
```

```javascript
import { createScaffoldingService, createBlueprintService } from '@gus_hill/scaffolding';

const blueprintsStorageDir = "C:\\blueprints";
const blueprintService = createBlueprintService(blueprintsStorageDir);
const scaffoldingService = createScaffoldingService();

blueprintService.loadBlueprint("test_blueprint")
  .then((blueprint) => scaffoldingService.build({ blueprint }));
```

## How to use

The two main classes of the package are `ScaffoldingService`, used for building a blueprint, and `BlueprintService`, used for CRUD operations on blueprints.

### ScaffoldingService

The ScaffoldingService provides the method `build`, which can be used to build a blueprint into actual directories/files. You can also define in which directory the blueprint will be built, as well as variables of the template.

### BlueprintService

The BlueprintService provides useful methods for persisting your blueprints for long-term usage. The available methods are: `saveBlueprint`, `loadBlueprint`, `listBlueprints`, `deleteBlueprint`, `blueprintExists`.