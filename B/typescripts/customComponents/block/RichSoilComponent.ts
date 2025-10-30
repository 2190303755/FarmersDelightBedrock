import {
    BlockComponentPlayerInteractEvent,
    BlockComponentRandomTickEvent,
    BlockCustomComponent,
    BlockPermutation,
    CustomComponentParameters,
    Direction,
    EquipmentSlot,
    GameMode,
} from "@minecraft/server";
import { blockComponent } from "../../lib/EventSubscriber";
import { getEquipmentSlot } from "../../lib/EntityUtil";
import { hurtItemInSlot, takeItemInSlot } from "../../lib/ItemUtil";

@blockComponent("farmersdelight:rich_soil")
export class RichSoilComponent implements BlockCustomComponent {
    onPlayerInteract(args: BlockComponentPlayerInteractEvent): void {
        const player = args.player;
        const slot = getEquipmentSlot(player, EquipmentSlot.Mainhand);
        if (!slot?.hasItem()) return;
        if (slot.hasTag("minecraft:is_hoe")) {
            const block = args.block;
            block.setType("farmersdelight:rich_soil_farmland");
            block.dimension.playSound("use.gravel", block);
            if (player!!.getGameMode() !== GameMode.Creative) {
                hurtItemInSlot(slot);
            }
            return;
        }
        if (args.face === Direction.Up) {
            let type: string;
            switch (slot.typeId) {
                case "minecraft:sugar_cane":
                    type = "farmersdelight:rich_soil_sugar_cane_bottom";
                    break;
                case "minecraft:brown_mushroom":
                    type = "farmersdelight:brown_mushroom_colony";
                    break;
                case "minecraft:red_mushroom":
                    type = "farmersdelight:red_mushroom_colony";
                    break;
                default:
                    return;
            }
            const above = args.block.above();
            if (above?.typeId !== "minecraft:air") return;
            above.dimension.playSound("dig.grass", above);
            above.setType(type);
            takeItemInSlot(slot, 1, false);
        }
    }

    onRandomTick(event: BlockComponentRandomTickEvent, _: CustomComponentParameters): void {
        const above = event.block.above();
        switch (above?.typeId) {
            case "minecraft:brown_mushroom":
                above!!.setPermutation(BlockPermutation.resolve(
                    "farmersdelight:brown_mushroom_colony",
                    { "farmersdelight:growth": 1 },
                ));
                return;
            case "minecraft:red_mushroom":
                above!!.setPermutation(BlockPermutation.resolve(
                    "farmersdelight:red_mushroom_colony",
                    { "farmersdelight:growth": 1 },
                ));
                return;
        }
        if (above?.getComponent("farmersdelight:mushroom_cluster")) { // 怎么没有hasComponent
            const permutation = above!!.permutation;
            if (permutation.getState("farmersdelight:growth") === 0) {
                above!!.setPermutation(permutation.withState("farmersdelight:growth", 1));
                // return;
            }
        }
    }
}
