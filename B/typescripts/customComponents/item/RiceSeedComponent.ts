import {
    Direction,
    EquipmentSlot,
    ItemComponentUseOnEvent,
    ItemCustomComponent,
    Player,
    StartupEvent,
    system,
} from "@minecraft/server";
import { takeEquippedItem } from "../../lib/ItemUtil";
import { hasLimitedMaterials } from "../../lib/EntityUtil";
import { subscribeEvent } from "../../lib/EventSubscriber";

/**
 * @deprecated
 */
class RiceSeedComponent implements ItemCustomComponent {
    constructor() {
        this.onUseOn = this.onUseOn.bind(this);
    }

    onUseOn(args: ItemComponentUseOnEvent): void {
        const source = args.source;
        if (source instanceof Player) {
            const itemStack = args.itemStack;
            const block = args.block;
            if (!itemStack || args.blockFace !== Direction.Up || (!block.hasTag("dirt"))) return;
            system.run(() => {
                const water = block.above();
                if (water?.typeId !== "minecraft:water" || water.permutation.getState("liquid_depth")) return;
                block.dimension.setBlockType(water.location,"farmersdelight:rice_block")
                if (hasLimitedMaterials(source)) takeEquippedItem(source, EquipmentSlot.Mainhand, 1, false);
            })
        }
    }
}
export class RiceSeedComponentRegister {
    @subscribeEvent(system.beforeEvents.startup)
    register(args: StartupEvent) {
        args.itemComponentRegistry.registerCustomComponent('farmersdelight:rice_seed', new RiceSeedComponent())
    }

}
