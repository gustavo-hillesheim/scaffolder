import { MinimalDIContainer } from "minimal-di";

import { FileReader, FileWriter } from "./components";
import { ScaffolderService } from "./services";

export const diContainer = new MinimalDIContainer();

diContainer.register(FileWriter, () => new FileWriter());
diContainer.register(FileReader, () => new FileReader());
diContainer.register(ScaffolderService, () => new ScaffolderService(diContainer.get(FileWriter)));
