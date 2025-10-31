import {
    Block,
    Container,
    ContainerSlot,
    Entity,
    EntityInventoryComponent,
    ItemStack,
    PlayerInteractWithBlockBeforeEvent,
    PlayerPlaceBlockAfterEvent,
    system,
    Vector3,
    world,
} from "@minecraft/server";
import { BlockWithEntity } from "../../lib/BlockWithEntity";
import { subscribeEvent } from "../../lib/EventSubscriber";


//usedItem用于放置厨锅时暂时存储厨锅物品数据，方便读取lore
const usedItem = new Map();

export class CookingPotBlock extends BlockWithEntity {
    @subscribeEvent(world.beforeEvents.playerInteractWithBlock)
    beforePlaceBlock(args: PlayerInteractWithBlockBeforeEvent){
        usedItem.set(args.player.id, args.itemStack);
    }

    @subscribeEvent(world.afterEvents.playerPlaceBlock)
    placeBlock(args: PlayerPlaceBlockAfterEvent) {
        const block: Block = args.block;
        if (block.typeId != "farmersdelight:cooking_pot") return;
        const itemStack = usedItem.get(args.player.id) as ItemStack;
        const lores: string[] = itemStack.getLore() ?? [];
        const { x, y, z }: Vector3 = block.location;
        const entity: Entity = super.setBlock(block.dimension, { x: x + 0.5, y: y, z: z + 0.5 }, "farmersdelight:cooking_pot");
        entity.nameTag = "farmersdelight厨锅";
        const inventory = entity?.getComponent("inventory") as EntityInventoryComponent;
        const container: Container | undefined = inventory?.container
        container?.setItem(9,  new ItemStack("farmersdelight:cooking_pot_arrow_0"));
        container?.setItem(10, new ItemStack("farmersdelight:fire_0"));
        if (!lores.length) return;
        for (const lore of lores) {
            const data: RegExpMatchArray | null = lore.match(/\d+|\S+:\S+/g);
            if (!data) continue;
            const slot: ContainerSlot | undefined = container?.getSlot(6);
            const cookingItemStack: ItemStack = new ItemStack(data[1]);
            cookingItemStack.amount = parseInt(data[0]);
            slot?.setItem(cookingItemStack);
        }
    }
    @subscribeEvent(world.beforeEvents.playerBreakBlock, { blockTypes: ["farmersdelight:cooking_pot"] })
    breakBlock(args: any) {
        const block: Block = args.block;
        args.cancel = true;
        system.run(() => {
            block.setType("minecraft:air");
        })
    }
}