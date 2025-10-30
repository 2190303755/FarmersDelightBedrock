import { ScoreboardObjective, world } from "@minecraft/server";
import { SubscribeEvent } from "../lib/EventSubscriber";
import { ReceieveMessageEvent, ScoreboardLoadEvent } from "../lib/Events";
import { COOKING_POT_RECIPES } from "../data/recipe/cookingPotRecipe";

class CookingPotRecipeRegistry {
    @SubscribeEvent(ScoreboardLoadEvent)
    static loadRecipes(objectives: ScoreboardObjective[]) {
        for (const objective of objectives) {
            const match: RegExpMatchArray | null = objective.displayName.match(/farmersdelight_(\w+)/);
            if (match) {
                world
                    .getDimension("overworld")
                    .runCommand(`function farmersdelight/cooking_pot_recipe_registries/${match[1]}`);
            }
        }
    }
    @SubscribeEvent(ReceieveMessageEvent, "farmersdelight:cooking_pot_recipe")
    static registerRecipe(message: string) {
        try {
            const json: any = JSON.parse(message);
            if (!(json.time || json.ingredients || json.result)) return;
            if (!json.ingredients.length || !json.result.item) return;
            COOKING_POT_RECIPES.push(json);
            console.info("Registered cooking pot recipe with id", json.identifer ?? json.identifier);
        } catch (_) {}
    }
}

export const {} = CookingPotRecipeRegistry; // 触发类加载
