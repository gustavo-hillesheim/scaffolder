import { MinimalDIContainer } from "minimal-di";

import { FileReader, FileWriter, TemplateProcessor } from "./components";
import { ScaffoldingService } from "./services";

export const di = new MinimalDIContainer();

di.register(TemplateProcessor, () => new TemplateProcessor());
di.register(FileWriter, () => new FileWriter());
di.register(FileReader, () => new FileReader());
di.register(
  ScaffoldingService,
  () => new ScaffoldingService(di.get(FileWriter), di.get(TemplateProcessor))
);
