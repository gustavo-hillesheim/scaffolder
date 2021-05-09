import { MinimalDIContainer } from "minimal-di";

import { FileReader, FileWriter } from "./components";
import { ScaffoldingService } from "./services";

export const diContainer = new MinimalDIContainer();

diContainer.register(FileWriter, () => new FileWriter());
diContainer.register(FileReader, () => new FileReader());
diContainer.register(ScaffoldingService, () => new ScaffoldingService(diContainer.get(FileWriter)));
