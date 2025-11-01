import {
    Block,
    BlockPermutation,
    Entity,
    EntityComponentTypes,
    EntityDieAfterEvent,
    EquipmentSlot,
    ItemStack,
    Player,
    PlayerBreakBlockAfterEvent,
    PlayerInteractWithBlockBeforeEvent,
    system,
    world,
} from "@minecraft/server";
import { hasLimitedMaterials, horizontalDirectionOf } from "../lib/EntityUtil";
import { hurtItem, enchantmentLevelOf, spawnLoot, spawnLootAtBlock } from "../lib/ItemUtil";
import { subscribeEvent } from "../lib/EventSubscriber";
import { oppositeOf } from "../lib/DirectionUtil";

export type BlockLoot = (stack: ItemStack, state: BlockPermutation) => string | undefined;
export type EntityLoot = (stack: ItemStack, victim: Entity) => ItemStack | undefined;

function blockLoot(table: string): BlockLoot {
    return (_, __) => table;
}

function entityLoot(item: string): EntityLoot {
    return (_, __) => new ItemStack(item);
}

function dispatchOnFire(raw: string, cooked: string): EntityLoot {
    return (_, victim) =>
        victim.getComponent(EntityComponentTypes.OnFire)?.onFireTicksRemaining
            ? new ItemStack(cooked)
            : new ItemStack(raw);
}

const STRAW_FROM_GRASS: BlockLoot = blockLoot("farmersdelight/straw_from_grass");
const STRAW_FROM_WHEAT: BlockLoot = (_, state) =>
    state.getState("growth") === 7 ? "farmersdelight/straw" : undefined;
const STRAW_FROM_RICE: BlockLoot = (_, state) =>
    state.getState("farmersdelight:growth") === 3 ? "farmersdelight/straw" : undefined;

const LOOT_LEATHER: EntityLoot = entityLoot("minecraft:leather");
const LOOT_STRING: EntityLoot = entityLoot("minecraft:string");
const LOOT_HAM_BY_CHANCE: EntityLoot = (stack, victim) => {
    if (Math.floor(Math.random() * 10) < 5 + enchantmentLevelOf(stack, "minecraft:enchantable")) {
        return victim.getComponent(EntityComponentTypes.OnFire)?.onFireTicksRemaining
            ? new ItemStack("farmersdelight:smoked_ham")
            : new ItemStack("farmersdelight:ham");
    }
    return undefined;
};

export const ENTITY_LOOT_TABLE: Map<string, EntityLoot> = new Map([
    ["minecraft:pig", LOOT_HAM_BY_CHANCE],
    ["minecraft:chicken", entityLoot("minecraft:feather")],
    ["minecraft:hoglin", dispatchOnFire("farmersdelight:ham", "farmersdelight:smoked_ham")],
    ["minecraft:cow", LOOT_LEATHER],
    ["minecraft:mooshroom", LOOT_LEATHER],
    ["minecraft:donkey", LOOT_LEATHER],
    ["minecraft:horse", LOOT_LEATHER],
    ["minecraft:mule", LOOT_LEATHER],
    ["minecraft:llama", LOOT_LEATHER],
    ["minecraft:trader_llama", LOOT_LEATHER],
    ["minecraft:shulker", LOOT_LEATHER],
    ["minecraft:rabbit", entityLoot("minecraft:rabbit_hide")],
    ["minecraft:spider", entityLoot("minecraft:shulker_shell")],
    ["minecraft:cave_spider", LOOT_STRING],
]);

export const BLOCK_LOOT_TABLE: Map<string, BlockLoot> = new Map([
    ["minecraft:tallgrass", STRAW_FROM_GRASS],
    ["minecraft:short_grass", STRAW_FROM_GRASS],
    ["minecraft:fern", STRAW_FROM_GRASS],
    ["minecraft:wheat", STRAW_FROM_WHEAT],
    ["minecraft:rice_block_upper", STRAW_FROM_RICE],
    ["minecraft:sandy_shrub_block", blockLoot("farmersdelight/straw_from_sandy_shrub")],
]);

const DROPS_CAKE_SLICE: Set<string> = new Set([
    "minecraft:cake",
    "minecraft:candle_cake",
    "minecraft:white_candle_cake",
    "minecraft:orange_candle_cake",
    "minecraft:magenta_candle_cake",
    "minecraft:light_blue_candle_cake",
    "minecraft:yellow_candle_cake",
    "minecraft:lime_candle_cake",
    "minecraft:pink_candle_cake",
    "minecraft:gray_candle_cake",
    "minecraft:light_gray_candle_cake",
    "minecraft:cyan_candle_cake",
    "minecraft:purple_candle_cake",
    "minecraft:blue_candle_cake",
    "minecraft:brown_candle_cake",
    "minecraft:green_candle_cake",
    "minecraft:red_candle_cake",
    "minecraft:black_candle_cake",
]);

class Knife {
    //刀掉落物改变机制有关的战利品
    @subscribeEvent(world.afterEvents.entityDie)
    static onKill(args: EntityDieAfterEvent) {
        const attacker = args.damageSource.damagingEntity;
        const victim = args.deadEntity;
        if (!attacker || !victim) return;
        try {
            const stack = attacker
                .getComponent(EntityComponentTypes.Equippable)
                ?.getEquipmentSlot(EquipmentSlot.Mainhand)
                ?.getItem();
            if (!stack || !stack.hasComponent("farmersdelight:increase_production")) return;
            const loot = ENTITY_LOOT_TABLE.get(victim.typeId)?.(stack, victim);
            if (loot) {
                victim.dimension.spawnItem(loot, victim.location);
            }
        } catch {
        }
    }

    //草秆
    @subscribeEvent(world.afterEvents.playerBreakBlock)
    static onBreakBlock(args: PlayerBreakBlockAfterEvent) {
        const stack = args.itemStackAfterBreak;
        if (!stack || !stack.hasTag("farmersdelight:is_knife") || stack.hasComponent("farmersdelight:knife")) return;
        const player: Player = args.player;
        if (hasLimitedMaterials(player)) {
            const container = player?.getComponent(EntityComponentTypes.Inventory)?.container;
            if (container) {
                hurtItem(container, player.selectedSlotIndex);
            }
            const permutation = args.brokenBlockPermutation;
            const loot = BLOCK_LOOT_TABLE.get(permutation.type.id)?.(stack, permutation);
            if (loot) {
                spawnLootAtBlock(args.block, loot);
            }
        }
    }

    @subscribeEvent(world.beforeEvents.playerInteractWithBlock)
    static sliceCake(event: PlayerInteractWithBlockBeforeEvent) {
        const stack = event.itemStack;
        if (!stack || !DROPS_CAKE_SLICE.has(event.block.typeId) || !stack.hasTag("farmersdelight:is_knife")) return;
        event.cancel = true;
        const block = event.block;
        system.run(() => {
            const pos = block.center();
            const dimension = block.dimension;
            dimension.spawnItem(new ItemStack("farmersdelight:cake_slice"), pos);
            dimension.playSound("dig.cloth", block);
            if (block.typeId === "minecraft:cake") {
                const permutation = block.permutation;
                const consumed = permutation.getState("bite_counter") ?? 0;
                if (consumed < 6) {
                    block.setPermutation(permutation.withState("bite_counter", consumed + 1));
                } else {
                    block.setType("minecraft:air");
                }
            } else {
                world.getLootTableManager()
                    .generateLootFromBlockPermutation(block.permutation)
                    ?.forEach((stack) => dimension.spawnItem(stack, pos));
                block.setPermutation(BlockPermutation.resolve("minecraft:cake", { "bite_counter": 1 }));
            }
        });
    }
}

void Knife;