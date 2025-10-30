import { ScoreboardObjective, world } from "@minecraft/server";
import { subscribeEvent } from "../lib/EventSubscriber";
import { ReceiveScriptMessageEvent, ScoreboardLoadEvent } from "../lib/Events";
import {
    COOKING_POT_RECIPES,
    populateV1, populateV2,
    RecipeSpecV1,
    RecipeSpecV2,
} from "../data/CookingPotRecipes";

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

    @subscribeEvent(ReceiveScriptMessageEvent, "farmersdelight:cooking_pot_recipe")
    static registerRecipe(message: string) {
        let spec;
        try {
            spec = JSON.parse(message) as RecipeSpecV1 | RecipeSpecV2;
        } catch (error) {
            console.error("Failed to parse cooking pot recipe", error);
            return;
        }
        if (!spec.time) return;
        if (!spec.result || !spec.result.item) return;
        if (!spec.ingredients || !spec.ingredients.length) return;
        if ((spec as RecipeSpecV2).format === 2) {
            COOKING_POT_RECIPES.addSortableRecipe(populateV2(spec as RecipeSpecV2));
        } else {
            COOKING_POT_RECIPES.addSortableRecipe(populateV1(spec as RecipeSpecV1));
        }
        console.info("Registered cooking pot recipe for", spec.result.item);
    }
}
