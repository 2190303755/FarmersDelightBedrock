import { PlayerBreakBlockBeforeEvent, system, world } from "@minecraft/server";
import { subscribeEvent } from "../../lib/EventSubscriber";
import { hurtEquippedItem } from "../../lib/ItemUtil";

export class CookingPotBlock {
    @subscribeEvent(world.beforeEvents.playerBreakBlock, { blockTypes: ["farmersdelight:cooking_pot"] })
    static breakBlock(event: PlayerBreakBlockBeforeEvent) {
        const block = event.block;
        system.run(() => {
            block.setType("minecraft:air");
            hurtEquippedItem(event.player, event.itemStack);
        });
        event.cancel = true;
    }
}