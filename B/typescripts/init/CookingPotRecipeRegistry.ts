import { ScoreboardObjective, world } from "@minecraft/server";
import { subscribeEvent } from "../lib/EventSubscriber";
import { ReceiveMessageEvent, ScoreboardLoadEvent } from "../lib/Events";
import { COOKING_POT_RECIPES } from "../data/CookingPotRecipes";

class CookingPotRecipeRegistry {
    @subscribeEvent(ScoreboardLoadEvent)
    static loadRecipes(objectives: ScoreboardObjective[]) {
        for (const objective of objectives) {
            const match: RegExpMatchArray | null = objective.displayName.match(/farmersdelight_(\w+)/);
            if (match) {
                world.getDimension("overworld")
                    .runCommand(`function farmersdelight/cooking_pot_recipe_registries/${match[1]}`);
            }
        }
    }
    @subscribeEvent(ReceiveMessageEvent, "farmersdelight:cooking_pot_recipe")
    static registerRecipe(message: string) {
        try {
            const json: any = JSON.parse(message);
            if (!(json.time || json.ingredients || json.result)) return;
            if (!json.ingredients.length || !json.result.item) return;
            COOKING_POT_RECIPES.push(json);
            console.info("Registered cooking pot recipe with id", json.identifer ?? json.identifier);
        } catch {}
    }
}

export const {} = CookingPotRecipeRegistry;
