import {
    BlockComponentOnPlaceEvent,
    BlockComponentPlayerBreakEvent,
    BlockComponentPlayerPlaceBeforeEvent,
    BlockComponentTickEvent,
    BlockCustomComponent,
    EquipmentSlot,
    GameMode,
    ItemStack,
    PlayerBreakBlockBeforeEvent,
    StartupEvent,
    system,
    world,
} from "@minecraft/server";
import { hurtEquippedItem, hurtItemInSlot, isEnchanted, spawnStack, takeItemInSlot } from "../../lib/ItemUtil";
import { subscribeEvent } from "../../lib/EventSubscriber";
import { spawnLootAtBlock } from "../../lib/LootUtil";
import { getEquipmentSlot } from "../../lib/EntityUtil";

export class WildCropComponent implements BlockCustomComponent {
    constructor() {
        this.onPlace = this.onPlace.bind(this);

    }
    onPlace(args: BlockComponentOnPlaceEvent): void {}


    @subscribeEvent(world.beforeEvents.playerBreakBlock)
    break(args: PlayerBreakBlockBeforeEvent) {
        const block = args.block
        if (!block.getComponent("farmersdelight:wild_crop")) return;
        const stack = args.itemStack;
        if (!stack) return;
        if (isEnchanted(stack, "silk_touch")) return;
        if (stack.typeId === "minecraft:shears") {
            const player = args.player;
            system.run(() => {
                hurtEquippedItem(player, stack);
                spawnStack(new ItemStack(block.typeId), block);
                block.setType("minecraft:air");
            });
            args.cancel = true;
        }
    }

    @subscribeEvent(system.beforeEvents.startup)
    register(args: StartupEvent) {
        args.blockComponentRegistry.registerCustomComponent('farmersdelight:wild_crop', new WildCropComponent());
        args.blockComponentRegistry.registerCustomComponent('farmersdelight:wild_rice', new WildRiceComponent());
    }

}


class WildRiceComponent implements BlockCustomComponent {
    constructor() {
        this.beforeOnPlayerPlace = this.beforeOnPlayerPlace.bind(this);
        this.onTick = this.onTick.bind(this);
        this.onPlayerBreak = this.onPlayerBreak.bind(this);
    }
    onPlayerBreak(args: BlockComponentPlayerBreakEvent): void {
        const player = args.player;
        const block = args.block;
        const lootTable = this.getLootTable();
        const lootItem = this.lootItem();
        const slot = getEquipmentSlot(player, EquipmentSlot.Mainhand);
        if (slot?.typeId === "minecraft:shears") {
            hurtItemInSlot(slot);
            spawnStack(new ItemStack(lootItem), block);
        } else if (!isEnchanted(slot?.getItem(), "silk_touch")) {
            spawnLootAtBlock(block, lootTable)
        }
    };
    beforeOnPlayerPlace(args: BlockComponentPlayerPlaceBeforeEvent): void {
        const block = args.block;
        const upBlockId = block.above()?.typeId;
        if (upBlockId === "minecraft:air") {
            const player = args.player;
            if (player) {
                const dimension = args.dimension;
                system.run(() => {
                    world.structureManager.place("farmersdelight:wild_rice_no_water", dimension, block);
                    dimension.playSound("dig.grass", block);
                    if (player.getGameMode() === GameMode.Creative) return;
                    const slot = getEquipmentSlot(player, EquipmentSlot.Mainhand);
                    if (slot) {
                        takeItemInSlot(slot);
                    }
                });
            }
        } else {
            args.cancel = true;
        }
    }
    onTick(args: BlockComponentTickEvent): void {
        const block = args.block;
        if (block.permutation.getState("farmersdelight:wild_rice") === 0 && block.above()?.typeId !== "farmersdelight:wild_rice") {
            block.setType("minecraft:air");
        }
    }



    getLootTable(): string {
        return "farmersdelight/crops/farmersdelight_wild_rice";

    }
    lootItem(): string {
        return "farmersdelight:wild_rice";

    }
}