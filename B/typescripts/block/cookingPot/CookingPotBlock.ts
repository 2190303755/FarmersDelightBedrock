import {
    Block,
    system,
    world,
} from "@minecraft/server";
import { subscribeEvent } from "../../lib/EventSubscriber";

export class CookingPotBlock {
    @subscribeEvent(world.beforeEvents.playerBreakBlock, { blockTypes: ["farmersdelight:cooking_pot"] })
    breakBlock(args: any) {
        const block: Block = args.block;
        args.cancel = true;
        system.run(() => {
            block.setType("minecraft:air");
        })
    }
}