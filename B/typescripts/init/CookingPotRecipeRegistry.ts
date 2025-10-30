import { ScoreboardObjective, world } from "@minecraft/server";
import { SubscribeEvent } from "../lib/EventSubscriber";
import { ReceieveMessageEvent, ScoreboardLoadEvent } from "../lib/Events";
import { vanillaCookingPotRecipe } from "../data/recipe/cookingPotRecipe";

class CookingPotRecipeRegistry {
    @SubscribeEvent(ScoreboardLoadEvent)
    static loadRecipes(objectives: ScoreboardObjective[]) {
        for (const sco of objectives) {
            const name: string = sco.displayName;
            const reg: RegExpMatchArray | null = name.match(/farmersdelight_(\w+)/);
            if (reg) {
                world
                    .getDimension("overworld")
                    .runCommand(`function farmersdelight/cooking_pot_recipe_registries/${reg[1]}`);
            }
        }
    }
    @SubscribeEvent(ReceieveMessageEvent, "farmersdelight:cooking_pot_recipe")
    static registerRecipe(message: string) {
        try {
            const json: any = JSON.parse(message);
            if (!(json.time || json.ingredients || json.result)) return;
            if (!json.ingredients.length || !json.result.item) return;
            vanillaCookingPotRecipe.recipe.push(json);
            console.warn(`已加载 §4${vanillaCookingPotRecipe.recipe.length}§f 个厨锅配方`); // 还不如打印配方id
        } catch (_) {}
    }
}

export const {} = CookingPotRecipeRegistry; // 触发类加载