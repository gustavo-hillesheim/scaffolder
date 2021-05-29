# Scaffolding CLI

Scaffolding CLI is a CLI application useful por creating the initial structure for projects.

## Available commands

### saveBlueprint

Saves a blueprint based on an existing directory.

_Arguments_

- blueprintName: Name of the blueprint that will be saved

_Options_

- targetDirectory: Directory which the blueprint will be based on
- override: Indicates if it should override an existing blueprint
- no-wrapper: Indicates that only the directory content should be added to the blueprint
- ignore: Regex for ignoring directories/files
- variables: Used to define which variables and where they will be on the blueprint

_Example_
`scaffolding saveBlueprint test_blueprint --targetDirectory node_project --no-wrapper --ignore node_modules --variables $packageName=node_project`

### listBlueprints

Lists all saved blueprints.

_Example_
`scaffolding listBlueprints`

### deleteBlueprint

Deletes a blueprint.

_Arguments_

- blueprintName: Name of the blueprint to delete

_Example_

`scaffolding deleteBlueprint test_blueprint`

### openBlueprint

Opens a blueprint on the file explorer, useful when you need to edit an existing blueprint.

_Arguments_

- blueprintName: Name of the blueprint to open

_Example_

`scaffolding openBlueprint test_blueprint`

### build

Build a given blueprint.

_Arguments_

- blueprintName: Name of the blueprint to build

_Options_

- output: Directory in which the blueprint should be built
  If your blueprint uses variables, you can define them as variables, according to the example below.

_Example_
`scaffolding build test_blueprint --output blueprint_output --packageName example_package`
