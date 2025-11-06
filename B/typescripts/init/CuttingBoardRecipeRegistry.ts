import { ScoreboardObjective, world } from "@minecraft/server";
import { subscribeEvent } from "../lib/EventSubscriber";
import { ReceiveScriptMessageEvent, ScoreboardLoadEvent } from "../lib/Events";
import {
    CUTTABLE_WITH_AXE_BLOCKS,
    CUTTABLE_WITH_KNIFE_ITEMS,
    CUTTABLE_WITH_AXE_ITEMS,
    CUTTABLE_WITH_SHEARS_ITEMS,
    CUTTABLE_WITH_PICKAXE_BLOCKS,
    CUTTABLE_WITH_PICKAXE_ITEMS,
    CUTTABLE_WITH_KNIFE_BLOCKS,
    CUTTABLE_WITH_SHOLVE_BLOCKS,
} from "../data/Cuttables";

class CuttingBoardRegistry {
    @subscribeEvent(ScoreboardLoadEvent)
    static loadRecipes(objectives: ScoreboardObjective[]) {
        for (const objective of objectives) {
            const match: RegExpMatchArray | null = objective.displayName.match(/farmersdelight_(\w+)/);
            if (match) {
                world.getDimension("overworld")
                    .runCommand(`function farmersdelight/cutting_board_recipe_registries/${match[1]}`);
            }
        }
    }
    @subscribeEvent(ReceiveScriptMessageEvent, "farmersdelight:cutting_board_recipe")
    static registerCuttable(message: string) {
        try {
            const splited = message.split("?");
            if (splited.length == 2) {
                const identifier = splited[0];
                switch (splited[1]) {
                    case "ItemofPickaxeList":
                        CUTTABLE_WITH_PICKAXE_ITEMS.add(identifier);
                        console.info(identifier, "(item) is cuttable with pickaxe");
                        break;
                    case "ItemofAxeList":
                        CUTTABLE_WITH_AXE_ITEMS.add(identifier);
                        console.info(identifier, "(item) is cuttable with axe");
                        break;
                    case "ItemofShearsList":
                        CUTTABLE_WITH_SHEARS_ITEMS.add(identifier);
                        console.info(identifier, "(item) is cuttable with shears");
                        break;
                    case "BlockofAxeList":
                        CUTTABLE_WITH_AXE_BLOCKS.add(identifier);
                        console.info(identifier, "(block) is cuttable with axe");
                        break;
                    case "BlockofPickaxeList":
                        CUTTABLE_WITH_PICKAXE_BLOCKS.add(identifier);
                        console.info(identifier, "(block) is cuttable with pickaxe");
                        break;
                    case "BlockofKnifeList":
                        CUTTABLE_WITH_KNIFE_BLOCKS.add(identifier);
                        console.info(identifier, "(block) is cuttable with knife");
                        break;
                        break;
                    case "BlockofShovelList":
                        CUTTABLE_WITH_SHOLVE_BLOCKS.add(identifier);
                        console.info(identifier, "(block) is cuttable with shovel");
                        break;
                }
            } else {
                CUTTABLE_WITH_KNIFE_ITEMS.add(message);
                console.info(message, "(item) is cuttable with knife");
            }
        } catch {}
    }
}

void CuttingBoardRegistry