import {
    Block,
    BlockComponentPlayerInteractEvent,
    BlockComponentRandomTickEvent,
    BlockComponentTickEvent,
    BlockCustomComponent, BlockPermutation,
    CustomComponentParameters, Dimension,
    Direction,
    EntityInventoryComponent,
    EquipmentSlot,
    GameMode,
    StartupEvent,
    system,
} from "@minecraft/server";
import { subscribeEvent } from "../../lib/EventSubscriber";
import { KnownBlockStates, KnownTypedBlockStateKeys } from "../../data/KnownBlockStates";
import { spawnLootAtBlock } from "../../lib/LootUtil";
import { takeItem, takeItemInSlot } from "../../lib/ItemUtil";
import { getEquipmentSlot } from "../../lib/EntityUtil";

export function playBoneMealEffect(block: Block, dimension: Dimension = block.dimension) {
    dimension.playSound("item.bone_meal.use", block);
    dimension.spawnParticle("minecraft:crop_growth_emitter", block.center());
}

export type CropsComponentParams = {
    loot: string;
    state: {
        name: KnownTypedBlockStateKeys<number>;
        age: number
        age_after_harvest?: number
    }
};

class CropsComponent implements BlockCustomComponent {
    constructor() {
        this.onPlayerInteract = this.onPlayerInteract.bind(this);
        this.onRandomTick = this.onRandomTick.bind(this);
    }

    onPlayerInteract(args: BlockComponentPlayerInteractEvent, param: CustomComponentParameters): void {
        const player = args.player;
        if (!player) return;
        const spec = param.params as CropsComponentParams;
        const maxAge = spec.state.age;
        const block = args.block;
        const age = block.permutation.getState(spec.state.name) ?? 0;
        if (age < maxAge) {
            const slot = getEquipmentSlot(player, EquipmentSlot.Mainhand);
            if (!slot?.hasItem() || slot.typeId !== "minecraft:bone_meal") return;
            playBoneMealEffect(block);
            if (player.getGameMode() == GameMode.Creative) {
                block.setPermutation(block.permutation.withState(spec.state.name, maxAge));
                return;
            }
            if (Math.random() < 0.75) {
                block.setPermutation(block.permutation.withState(spec.state.name, age + 1));
                takeItemInSlot(slot, 1, false);
            }
        }
        else{
            block.setPermutation(block.permutation.withState(spec.state.name, spec.state.age_after_harvest ?? 0));
            spawnLootAtBlock(block, spec.loot.replace("loot_tables/", "").replace(".json", ""));

        }

    }
    onRandomTick(args: BlockComponentRandomTickEvent, param: CustomComponentParameters): void {
        let params = param.params as CropsComponentParams;
        const block = args.block;
        const age = Number(block.permutation.getState(params.state.name));
        const maxAge = params.state.age;
        if (age < maxAge) {
            block.setPermutation(block.permutation.withState(params.state.name, age + 1));
        }
    }
}
class TorchflowerComponent implements BlockCustomComponent {
    constructor() {
        this.onPlayerInteract = this.onPlayerInteract.bind(this);
        this.onRandomTick = this.onRandomTick.bind(this);
    }

    onPlayerInteract(args: BlockComponentPlayerInteractEvent): void {
        const player = args.player;
        const slot = getEquipmentSlot(player, EquipmentSlot.Mainhand);
        if (!slot?.hasItem() || slot.typeId !== "minecraft:bone_meal") return;
        const block = args.block;
        const age = block.permutation.getState("farmersdelight:growth") ?? 0;
        playBoneMealEffect(block);
        if (age < 7) {
            if (Math.random() < 0.6) {
                block.setPermutation(block.permutation.withState("farmersdelight:growth", age + 1));
            }
            if (player!!.getGameMode() !== GameMode.Creative) {
                takeItemInSlot(slot, 1, false);
            }
        } else {
            block.setType("farmersdelight:rich_soil_torchflower");
        }
    }
    onRandomTick(args: BlockComponentRandomTickEvent): void {
        const block = args.block;
        const age = block.permutation.getState("farmersdelight:growth") ?? 0;
        if (age < 7) {
            block.setPermutation(block.permutation.withState("farmersdelight:growth", age + 1));
        } else {
            block.setType("farmersdelight:rich_soil_torchflower");
        }
    }
}
class SugarCaneComponent implements BlockCustomComponent {
    constructor() {
        this.onPlayerInteract = this.onPlayerInteract.bind(this);
        this.onRandomTick = this.onRandomTick.bind(this);
    }
    onPlayerInteract(args: BlockComponentPlayerInteractEvent): void {
        const player = args.player;
        if (!player) return;
        const block = args.block;
        const dimension = args.dimension;
        const topLocation = {
            x: block.x,
            y: block.y + 1,
            z: block.z,
        };
        const slot = getEquipmentSlot(player, EquipmentSlot.Mainhand);
        try {
            const itemId = slot?.hasItem() ? slot.typeId : undefined;
            if (itemId === "minecraft:sugar_cane") {
                if (args.face != Direction.Up) return;
                if (block.typeId == "farmersdelight:rich_soil_sugar_cane_bottom") {
                    dimension.playSound("dig.grass", block);
                    dimension.setBlockType(topLocation, "farmersdelight:rich_soil_sugar_cane_middle");
                }
                if (block.typeId == "farmersdelight:rich_soil_sugar_cane_middle") {
                    dimension.playSound("dig.grass", block);
                    dimension.setBlockType(topLocation, "farmersdelight:rich_soil_sugar_cane_top");
                }
                if (block.typeId == "farmersdelight:rich_soil_sugar_cane_top") {
                    dimension.playSound("dig.grass", block);
                    dimension.setBlockType(topLocation, "farmersdelight:rich_soil_sugar_cane_top");
                }
            }
            if (itemId === "minecraft:bone_meal") {
                if (block.typeId === "farmersdelight:rich_soil_sugar_cane_bottom") {
                    if (dimension.getBlock(topLocation)?.typeId == "minecraft:air") {
                        const pos = {
                            x: block.location.x,
                            y: block.location.y + 2,
                            z: block.location.z,
                        };
                        if (dimension.getBlock(pos)?.typeId == "minecraft:air") {
                            dimension.setBlockType(pos, "farmersdelight:rich_soil_sugar_cane_top");
                        }
                        dimension.setBlockType(topLocation, "farmersdelight:rich_soil_sugar_cane_middle");
                        playBoneMealEffect(block, dimension);
                        takeItemInSlot(slot!!, 1, false);
                    }
                }
                if (block.typeId === "farmersdelight:rich_soil_sugar_cane_middle") {
                    if (dimension.getBlock(topLocation)?.typeId == "minecraft:air") {
                        dimension.setBlockType(topLocation, "farmersdelight:rich_soil_sugar_cane_top");
                        playBoneMealEffect(block, dimension);
                        takeItemInSlot(slot!!, 1, false);
                    }
                }
            }
        } catch (error) {}
    }
    onRandomTick(args: BlockComponentRandomTickEvent): void {
        const block = args.block;
        const dimension = args.dimension;
        const age = Number(block.permutation.getState("farmersdelight:growth"));
        const topLocation = {
            x: block.location.x,
            y: block.location.y + 1,
            z: block.location.z,
        };
        if (age < 15) {
            block.setPermutation(block.permutation.withState("farmersdelight:growth", age + 1));
        } else {
            if (
                dimension.getBlock(topLocation)?.typeId == "minecraft:air" &&
                block.typeId == "farmersdelight:rich_soil_sugar_cane_bottom"
            ) {
                dimension.setBlockType(topLocation, "farmersdelight:rich_soil_sugar_cane_middle");
            }
            if (
                dimension.getBlock(topLocation)?.typeId == "minecraft:air" &&
                block.typeId == "farmersdelight:rich_soil_sugar_cane_middle"
            ) {
                dimension.setBlockType(topLocation, "farmersdelight:rich_soil_sugar_cane_top");
            }
        }
    }
}
class RiceComponent implements BlockCustomComponent {
    constructor() {
        this.onPlayerInteract = this.onPlayerInteract.bind(this);
        this.onRandomTick = this.onRandomTick.bind(this);
        this.onTick = this.onTick.bind(this);
    }
    onPlayerInteract(args: BlockComponentPlayerInteractEvent): void {
        const player = args.player;
        if (!player) return;
        const block = args.block;
        const dimension = args.dimension;
        const topLocation = {
            x: block.location.x,
            y: block.location.y + 1,
            z: block.location.z,
        };
        if (block.typeId == "farmersdelight:rice_block") {
            const slot = getEquipmentSlot(player, EquipmentSlot.Mainhand);
            try {
                const itemId = slot?.hasItem() ? slot.typeId : undefined;
                if (itemId == "minecraft:bone_meal") {
                    playBoneMealEffect(block, dimension);
                    if (player?.getGameMode() == GameMode.Creative) {
                        block.setPermutation(block.permutation.withState("farmersdelight:age", 3));
                        if (dimension.getBlock(topLocation)?.typeId === "minecraft:air") {
                            block.setPermutation(block.permutation.withState("farmersdelight:upper", true));
                            dimension.setBlockPermutation(
                                topLocation,
                                BlockPermutation.resolve("farmersdelight:rice_block_upper", { "farmersdelight:growth": 3 }),
                            );
                        }
                    } else {
                        if (Math.random() < 0.6) {
                            const age = block.permutation.getState("farmersdelight:age") ?? 0;
                            if (age == 3 && dimension.getBlock(topLocation)?.typeId === "minecraft:air") {
                                block.setPermutation(block.permutation.withState("farmersdelight:upper", true));
                                dimension.setBlockType(topLocation, "farmersdelight:rice_block_upper");
                            }
                            if (age < 3) {
                                block.setPermutation(block.permutation.withState("farmersdelight:age", age + 1));
                            }
                        }
                        takeItemInSlot(slot!!, 1, false);
                    }
                }
            } catch (error) {}
        }
        if (block.typeId == "farmersdelight:rice_block_upper") {
            const growth = Number(block.permutation.getState("farmersdelight:growth"));
            if (growth >= 3) {
                block.setPermutation(block.permutation.withState("farmersdelight:growth", 0));
                spawnLootAtBlock(block, "farmersdelight/crops/farmersdelight_rice_riped");
            } else {
                const slot = getEquipmentSlot(player, EquipmentSlot.Mainhand);
                if (slot?.hasItem() && slot.typeId === "minecraft:bone_meal") {
                    if (Math.random() < 0.6) {
                        block.setPermutation(block.permutation.withState("farmersdelight:growth", growth + 1));
                    }
                    playBoneMealEffect(block, dimension);
                    if (player.getGameMode() !== GameMode.Creative) {
                        takeItemInSlot(slot, 1, false);

                    }
                }
            }
        }
    }
    onRandomTick(args: BlockComponentRandomTickEvent): void {
        const block = args.block;
        if (block.typeId == "farmersdelight:rice_block_upper") {
            const growth = Number(block.permutation.getState("farmersdelight:growth"));
            if (growth < 3) {
                block.setPermutation(block.permutation.withState("farmersdelight:growth", growth + 1));
            }
        }
        if (block.typeId == "farmersdelight:rice_block") {
            const age = block.permutation.getState("farmersdelight:age") ?? 0;
            if (age < 3) {
                block.setPermutation(block.permutation.withState("farmersdelight:age", age + 1));
            } else {
                const above = block.above();
                if (above?.typeId !== "minecraft:air") return;
                above.setType("farmersdelight:rice_block_upper");
                block.setPermutation(block.permutation.withState("farmersdelight:upper", true));
            }
        }
    }
    onTick(args: BlockComponentTickEvent): void {
        const block = args.block;
        if (block.permutation.getState("farmersdelight:age") === 3 && block.above()?.typeId !== "farmersdelight:rice_block_upper") {
            block.setPermutation(block.permutation.withState("farmersdelight:upper", false));
        }
    }
}
export class CropComponentRegister {
    @subscribeEvent(system.beforeEvents.startup)
    register(args: StartupEvent) {
        args.blockComponentRegistry.registerCustomComponent("farmersdelight:crop", new CropsComponent());
        args.blockComponentRegistry.registerCustomComponent("farmersdelight:torchflower", new TorchflowerComponent());
        args.blockComponentRegistry.registerCustomComponent("farmersdelight:sugar_cane", new SugarCaneComponent());
        args.blockComponentRegistry.registerCustomComponent("farmersdelight:rice", new RiceComponent());
    }
}
