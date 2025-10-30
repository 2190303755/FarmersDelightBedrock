import {
    BlockComponentOnPlaceEvent,
    BlockComponentPlayerPlaceBeforeEvent,
    CustomComponentParameters,
    EntityComponentTypes,
    ItemStack,
    ItemTypes,
    Player,
    system,
    Vector3,
} from "@minecraft/server";
import { blockComponent } from "../../lib/EventSubscriber";
import { getBlockEntityType, initBlockEntity } from "../../lib/BlockWithEntity";
import { BlockEntityComponent } from "./BlockEntityComponent";

interface PlacementContext {
    stack: ItemStack | undefined;
    stamp: number;
}

const PLACEMENT_CONTEXT: Map<string, PlacementContext> = new Map();
const STORED_LORE = /(\d+).*?(\S+:\S+)/;

function formatLocation(location: Vector3): string {
    return `${location.x};${location.y};${location.z}`;
}

@blockComponent("farmersdelight:cooking_pot")
export class CookingPotComponent extends BlockEntityComponent {
    beforeOnPlayerPlace(event: BlockComponentPlayerPlaceBeforeEvent, _: CustomComponentParameters): void {
        const player = event.player as Player;
        const container = player?.getComponent(EntityComponentTypes.Inventory)?.container;
        if (!container) return;
        const stamp = system.currentTick;
        const location = formatLocation(event.block);
        PLACEMENT_CONTEXT.set(location, {
            stack: container.getItem(player.selectedSlotIndex),
            stamp: stamp,
        });
        system.runTimeout(() => {
            const context = PLACEMENT_CONTEXT.get(location);
            if (context?.stamp === stamp) {
                PLACEMENT_CONTEXT.delete(location);
            }
        }, 2);
    }

    onPlace(event: BlockComponentOnPlaceEvent, params: CustomComponentParameters): void {
        const block = event.block;
        const typeId = getBlockEntityType(block, params.params)?.id;
        if (!typeId) throw new Error("Failed to init block entity for " + block.typeId);
        const entity = initBlockEntity(block, typeId);
        entity.nameTag = `farmersdelight厨锅`;
        const container = entity?.getComponent(EntityComponentTypes.Inventory)?.container;
        if (!container) return;
        container.setItem(9, new ItemStack("farmersdelight:cooking_pot_arrow_0"));
        container.setItem(10, new ItemStack("farmersdelight:fire_0"));
        const stack = PLACEMENT_CONTEXT.get(formatLocation(event.block))?.stack;
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