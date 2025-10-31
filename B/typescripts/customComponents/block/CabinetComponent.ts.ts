import {
  BlockComponentOnPlaceEvent,
  BlockCustomComponent,
  CustomComponentParameters,
  StartupEvent,
  system,
} from "@minecraft/server";
import { subscribeEvent } from "../../lib/EventSubscriber";


export class CabinetComponent implements BlockCustomComponent {
    constructor() {
        this.onPlace = this.onPlace.bind(this);
    }

    onPlace(args: BlockComponentOnPlaceEvent, param: CustomComponentParameters): void {
        param.params as string;
    }
        
}
export class CabinetComponentRegister{
    @subscribeEvent(system.beforeEvents.startup)
    register(args: StartupEvent){
        args.blockComponentRegistry.registerCustomComponent('farmersdelight:cabinet', new CabinetComponent());
    }
  
}
