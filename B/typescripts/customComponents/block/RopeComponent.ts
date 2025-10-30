import {
    BlockComponentPlayerBreakEvent,
    BlockComponentPlayerInteractEvent,
    BlockComponentRandomTickEvent,
    BlockComponentTickEvent,
    BlockCustomComponent,
    EquipmentSlot,
    GameMode,
    Player,
    StartupEvent,
    system,
} from "@minecraft/server";
import { isEnchanted, takeItemInSlot } from "../../lib/ItemUtil";
import { subscribeEvent } from "../../lib/EventSubscriber";
import { spawnLootAtBlock } from "../../lib/LootUtil";
import { getEquipment, getEquipmentSlot } from "../../lib/EntityUtil";
import { KnownBlockStates } from "../../data/KnownBlockStates";
import { PlayerTickEvent } from "../../lib/Events";
import { playBoneMealEffect } from "./CropComponent";

export class RopeComponent implements BlockCustomComponent {
    onPlayerInteract(args: BlockComponentPlayerInteractEvent): void {
        const block = args.block;
        const stage = block.permutation.getState("farmersdelight:stage") ?? 0;
        if (stage == 4) {
            block.setPermutation(block.permutation.withState("farmersdelight:stage", 1));
            spawnLootAtBlock(block, "farmersdelight/crops/farmersdelight_tomato_riped");
        } else {
            const player = args.player;
            const slot = getEquipmentSlot(player, EquipmentSlot.Mainhand);
            if (slot?.hasItem() && slot.typeId === "minecraft:bone_meal") {
                playBoneMealEffect(block);
                if (Math.random() < 0.6) {
                    block.setPermutation(block.permutation.withState("farmersdelight:stage", stage + 1));
                }
                if (player!!.getGameMode() !== GameMode.Creative) {
                    takeItemInSlot(slot, 1, false);
                }
            }
        }
    }
    onPlayerBreak(args: BlockComponentPlayerBreakEvent): void {
        const player = args.player;
        if (!player) return;
        if ((args.brokenBlockPermutation.getState("farmersdelight:stage") ?? 0) > 0 && !isEnchanted(getEquipment(player, EquipmentSlot.Mainhand), "silk_touch")) {
            args.block.setType("farmersdelight:rope");
        }
       
    }
    onRandomTick(args: BlockComponentRandomTickEvent): void {
        const block = args.block;
        const location = block.location;
        const dimension = args.dimension;
        const stage = block.permutation.getState('farmersdelight:stage') as number;
        const directions = [
            { x: 0, z: -1 },  // N
            { x: 0, z: 1 },   // S
            { x: -1, z: 0 },  // E
            { x: 1, z: 0 }    // W
        ];

        const hasRopeAround = directions.some(({ x, z }) =>
            dimension.getBlock({ x: location.x + x, y: location.y, z: location.z + z })?.hasTag("rope")
        );
        const blockBelow = dimension.getBlock({ x: location.x, y: location.y - 1, z: location.z });
        const tomatoCrop = blockBelow?.hasTag('tomato_crop');
        const tomatoCropWithRope = blockBelow?.hasTag('tomato_crop_with_rope');
        
        const canGrow = dimension.getBlock({ x: location.x, y: location.y - 1, z: location.z })?.permutation.getState('farmersdelight:can_grow') as boolean;


        if (stage > 0 && stage < 4) {
            block.setPermutation(block.permutation.withState('farmersdelight:stage', stage + 1));
        }

        if (tomatoCrop && (stage == 0 )&& !hasRopeAround) {
            block.setPermutation(block.permutation.withState('farmersdelight:stage', 1));
        }
        if (canGrow && tomatoCropWithRope&&(stage == 0) && !hasRopeAround) {
            block.setPermutation(block.permutation.withState('farmersdelight:stage', 1));
            block.setPermutation(block.permutation.withState('farmersdelight:can_grow', false));
        }

    }
    onTick(args: BlockComponentTickEvent): void {
        const block = args.block;
        const location = block.location;
        const dimension = args.dimension;
        const stage = block.permutation.getState('farmersdelight:stage') as number;
        if (stage == 0) {
            const ropePositions = [
                { x: location.x, y: location.y, z: location.z - 1, direction: 'north' },
                { x: location.x, y: location.y, z: location.z + 1, direction: 'south' },
                { x: location.x - 1, y: location.y, z: location.z, direction: 'east' },
                { x: location.x + 1, y: location.y, z: location.z, direction: 'west' }
            ];

            ropePositions.forEach(pos => {
                const rope = dimension.getBlock(pos)?.hasTag("rope") ?? false;
                block.setPermutation(block.permutation.withState(`farmersdelight:${pos.direction}_connected` as keyof KnownBlockStates, rope));
            })
        } else {
            const tomato = block.below();
            if (!tomato || !tomato.hasTag("tomato_crop") && !tomato.hasTag("tomato_crop_with_rope")) {
                block.setPermutation(block.permutation.withState('farmersdelight:stage', 0));
                block.setPermutation(block.permutation.withState('farmersdelight:can_grow', true));
            }
        }
    }

    @subscribeEvent(PlayerTickEvent)
    static simulateClimbing(player: Player) {
        if (player.dimension.getBlock(player.location)?.getComponent("farmersdelight:rope")) {
            const pitch = player.getViewDirection().y;
            if (pitch > 0) {
                player.addEffect("levitation", 5, { showParticles: false });
            } else if (pitch < 0) {
                player.addEffect("slow_falling", 5, { showParticles: false });

            }
        }
    }
}
export class RopeComponentRegister {
    @subscribeEvent(system.beforeEvents.startup)
    register(args: StartupEvent) {
        args.blockComponentRegistry.registerCustomComponent('farmersdelight:rope', new RopeComponent());
    }

}
