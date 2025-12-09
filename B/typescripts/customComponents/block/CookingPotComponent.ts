import {
    BlockComponentOnPlaceEvent,
    BlockComponentPlayerPlaceBeforeEvent,
    CustomComponentParameters,
    EntityComponentTypes,
    EquipmentSlot, ItemComponentTypes,
    ItemStack,
    ItemTypes,
    system,
} from "@minecraft/server";
import { blockComponent } from "../../lib/EventSubscriber";
import { initBlockEntity, resolveBlockEntityType } from "../../lib/BlockWithEntity";
import { BlockEntityComponent } from "./BlockEntityComponent";
import { makeUniqueId } from "../../lib/BlockUtil";
import { getEquipment } from "../../lib/EntityUtil";

interface PlacementContext {
    stack: ItemStack | undefined;
    stamp: number;
}

const PLACEMENT_CONTEXTS: Map<string, PlacementContext> = new Map();
const STORED_LORE = /(\d+).*?(\S+:\S+)/;

@blockComponent("farmersdelight:cooking_pot")
export class CookingPotComponent extends BlockEntityComponent {
    beforeOnPlayerPlace(event: BlockComponentPlayerPlaceBeforeEvent, _: CustomComponentParameters): void {
        const stamp = system.currentTick;
        const uid = makeUniqueId(event.block);
        PLACEMENT_CONTEXTS.set(uid, {
            stack: getEquipment(event.player, EquipmentSlot.Mainhand),
            stamp: stamp,
        });
        system.runTimeout(() => {
            const context = PLACEMENT_CONTEXTS.get(uid);
            if (context?.stamp === stamp) {
                PLACEMENT_CONTEXTS.delete(uid);
            }
        }, 2);
    }

    onPlace(event: BlockComponentOnPlaceEvent, params: CustomComponentParameters): void {
        const block = event.block;
        const typeId = resolveBlockEntityType(block, params.params)?.id;
        if (!typeId) throw new Error("Failed to init block entity for " + block.typeId);
        const entity = initBlockEntity(block, typeId);
        entity.nameTag = `farmersdelight厨锅`;
        const container = entity.getComponent(EntityComponentTypes.Inventory)?.container;
        if (!container) return;
        container.setItem(9, new ItemStack("farmersdelight:cooking_pot_arrow_0"));
        container.setItem(10, new ItemStack("farmersdelight:fire_0"));
        const stack = PLACEMENT_CONTEXTS.get(makeUniqueId(event.block))?.stack;
        if (!stack) return;
        const cookedItem = stack.getDynamicProperty("farmersdelight:cookedItem") as string;
        if (cookedItem) {
            container.setItem(6, new ItemStack(
                cookedItem,
                stack.getDynamicProperty("farmersdelight:cookedItemCount") as number ?? 1,
            ));
        } else {
            for (const line of stack.getLore()) {
                const match = STORED_LORE.exec(line);
                if (!match) continue;
                const item = ItemTypes.get(match[2]);
                if (!item) continue;
                const amount = parseInt(match[1]);
                container.setItem(6, new ItemStack(item, amount > 0 ? amount : 1));
                break;
            }
        }
    }
}