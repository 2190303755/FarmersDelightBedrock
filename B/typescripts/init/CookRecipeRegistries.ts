import { ScoreboardObjective, world } from "@minecraft/server";
import { subscribeEvent } from "../lib/EventSubscriber";
import { ReceiveMessageEvent, ScoreboardLoadEvent } from "../lib/Events";
import { SMELTABLES } from "../data/Smeltables";

class CookRecipeRegistry {
    @subscribeEvent(ScoreboardLoadEvent)
    static loadRecipes(objectives: ScoreboardObjective[]) {
        for (const objective of objectives) {
            const match: RegExpMatchArray | null = objective.displayName.match(/farmersdelight_(\w+)/);
            if (match) {
                world
                    .getDimension("overworld")
                    .runCommand(`function farmersdelight/cook_recipe_registries/${match[1]}`);
            }
        }
    }
    @subscribeEvent(ReceiveMessageEvent, "farmersdelight:cook")
    static registerRecipe(message: string) {
        try {
            SMELTABLES.add(message);
            console.info(message, "is registered as smeltable");
        } catch {}
    }
}

export const {} = CookRecipeRegistry; // 触发类加载
