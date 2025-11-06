import { RecipeManager } from "../lib/RecipeManager";
import {
    compileIngredientSpec, compileInlineIngredient, compileInlineIngredients,
    Ingredient,
    IngredientSpec,
    inlineIngredient,
    InlineIngredientSpec,
    StackSpec,
} from "../lib/Ingredients";
import { registerContainer } from "./ItemContainers";


export type RecipeSpecV1 = {
    identifer?: string; // sic
    identifier?: string;
    tags: string[];
    priority?: number;
    time: number;
    container?: IngredientSpec;
    experience?: number;
    ingredients: IngredientSpec[];
    result: StackSpec;
}

export type RecipeSpecV2 = {
    format: 2;
    identifier?: string;
    time: number;
    priority?: number;
    experience?: number;
    ingredients: InlineIngredientSpec[];
    result: StackSpec;
}

export interface CookingPotRecipe {
    readonly time: number;
    readonly priority?: number;
    readonly experience?: number;
    readonly ingredients: Ingredient[];
    readonly result: StackSpec;
}

type UnsortedIngredients = [number, Ingredient][]

// 提前排序，使最复杂的原料更早处理以便触发剪枝
function sortIngredients(complied: UnsortedIngredients) {
    complied.sort((left, right) => right[0] - left[0])
    for (const index in complied) {
        (complied as unknown as Ingredient[])[index] = complied[index][1];
    }
}

export function populateV1(spec: RecipeSpecV1): CookingPotRecipe {
    const container = spec.container;
    if (container) {
        if (Array.isArray(container)) {
            const item = spec.result.item as string;
            for (const entry of container) {
                registerContainer(item, inlineIngredient(entry));
            }
        } else {
            registerContainer(spec.result.item as string, inlineIngredient(container));
        }
    }
    const ingredients = spec.ingredients;
    for (const index in ingredients) {
        const ingredient = compileIngredientSpec(ingredients[index]);
        (ingredients as unknown as UnsortedIngredients)[index] = [ingredient.complexity(), ingredient]
    }
    sortIngredients(ingredients as unknown as UnsortedIngredients);
    delete (spec as any).tags;
    delete spec.container;
    return spec as unknown as CookingPotRecipe;
}

export function populateV2(spec: RecipeSpecV2): CookingPotRecipe {
    const ingredients = spec.ingredients;
    for (const index in ingredients) {
        const tagOrId = ingredients[index];
        const ingredient = Array.isArray(tagOrId)
            ? compileInlineIngredients(tagOrId)
            : compileInlineIngredient(tagOrId);
        (ingredients as unknown as UnsortedIngredients)[index] = [ingredient.complexity(), ingredient]
    }
    sortIngredients(ingredients as unknown as UnsortedIngredients);
    delete (spec as any).format;
    return spec as unknown as CookingPotRecipe;
}

export const COOKING_POT_RECIPES: RecipeManager<CookingPotRecipe> = new RecipeManager();

([ //finish
    {
        identifier: "farmersdelight:bone_broth",
        tags: ["cooking_pot"],
        priority: 0,
        time: 200,
        container: {
            item: "minecraft:bowl",
        },
        ingredients: [
            {
                item: "minecraft:red_mushroom",
            },
            {
                item: "minecraft:bone",
            },
        ],
        result: {
            item: "farmersdelight:bone_broth",
        },
    },
    //finish
    {
        identifier: "farmersdelight:glow_berry_custard",
        tags: ["cooking_pot"],
        priority: 0,
        time: 200,
        ingredients: [
            {
                item: "farmersdelight:milk_bottle",
            },
            {
                item: "minecraft:glow_berries",
            },
            {
                tag: "minecraft:egg",
            },
            {
                item: "minecraft:sugar",
            },
        ],
        result: {
            item: "farmersdelight:glow_berry_custard",
        },
    },
    //finish
    {
        identifier: "farmersdelight:apple_cider",
        tags: ["cooking_pot"],
        priority: 0,
        time: 200,
        container: {
            item: "minecraft:glass_bottle",
        },
        ingredients: [
            {
                item: "minecraft:apple",
            },
            {
                item: "minecraft:apple",
            },
            {
                item: "minecraft:sugar",
            },
        ],
        result: {
            item: "farmersdelight:apple_cider",
        },
    },
    //finish
    {
        identifier: "farmersdelight:hot_cocoa",
        tags: ["cooking_pot"],
        priority: 0,
        time: 200,
        experience: 1.0,
        ingredients: [
            {
                item: "minecraft:cocoa_beans",
            },
            {
                item: "minecraft:cocoa_beans",
            },
            {
                item: "minecraft:sugar",
            },
            {
                item: "farmersdelight:milk_bottle",
            },
        ],
        result: {
            item: "farmersdelight:hot_cocoa",
        },
    },
    //finish
    {
        identifier: "farmersdelight:dumplings",
        tags: ["cooking_pot"],
        priority: 0,
        time: 200,
        experience: 1.0,
        ingredients: [
            [
                { item: "minecraft:porkchop" },
                { item: "better_on_bedrock:beef_patty_raw" },
                { item: "minecraft:beef" },
                { item: "minecraft:chicken" },
                { item: "minecraft:brown_mushroom" },
                { tag: "farmersdelight:is_raw_porkchop" },
                { tag: "farmersdelight:is_raw_chicken" },
                { tag: "farmersdelight:is_raw_beef" },
            ],
            [{ tag: "farmersdelight:is_cabbage" }, { item: "better_on_bedrock:gabage_leaves" }],
            [
                {
                    tag: "farmersdelight:is_onion",
                },
                { item: "better_on_bedrock:onion" },
            ],
            [
                {
                    tag: "farmersdelight:is_dough",
                },
                {
                    item: "better_on_bedrock:dough",
                },
            ],
        ],
        result: {
            item: "farmersdelight:dumplings",
            count: 2,
        },
    },
    //finish
    {
        identifier: "farmersdelight:cooked_rice",
        tags: ["cooking_pot"],
        priority: 0,
        container: {
            item: "minecraft:bowl",
        },
        time: 200,
        experience: 1.0,
        ingredients: [
            {
                tag: "farmersdelight:is_rice",
            },
        ],
        result: {
            item: "farmersdelight:cooked_rice",
        },
    },
    //finish
    {
        identifier: "farmersdelight:beef_stew",
        tags: ["cooking_pot"],
        priority: 0,
        container: {
            item: "minecraft:bowl",
        },
        time: 200,
        experience: 1.0,
        ingredients: [
            [
                { tag: "farmersdelight:is_raw_beef" },
                { item: "minecraft:beef" },
                { item: "better_on_bedrock:beef_patty_raw" },
            ],
            {
                item: "minecraft:carrot",
            },
            {
                item: "minecraft:potato",
            },
        ],
        result: {
            item: "farmersdelight:beef_stew",
        },
    },
    //finish
    {
        identifier: "farmersdelight:chicken_soup",
        tags: ["cooking_pot"],
        priority: 0,
        container: {
            item: "minecraft:bowl",
        },
        time: 200,
        experience: 1.0,
        ingredients: [
            [{ tag: "farmersdelight:is_raw_chicken" }, { item: "minecraft:chicken" }],
            [
                {
                    tag: "farmersdelight:is_cabbage",
                },
                { item: "better_on_bedrock:gabage_leaves" },
            ],
            {
                item: "minecraft:carrot",
            },
            [
                { item: "minecraft:carrot" },
                { item: "minecraft:potato" },
                { item: "minecraft:beetroot" },
                { tag: "farmersdelight:is_onion" },
                { item: "better_on_bedrock:onion" },
                { tag: "farmersdelight:is_tomato" },
                { item: "better_on_bedrock:tomato_seed" },
            ],
        ],
        result: {
            item: "farmersdelight:chicken_soup",
        },
    },
    //finish
    {
        identifier: "farmersdelight:vegetable_soup",
        tags: ["cooking_pot"],
        priority: 0,
        container: {
            item: "minecraft:bowl",
        },
        time: 200,
        experience: 1.0,
        ingredients: [
            [
                {
                    tag: "farmersdelight:is_cabbage",
                },
                { item: "better_on_bedrock:gabage_leaves" },
            ],
            {
                item: "minecraft:beetroot",
            },
            {
                item: "minecraft:potato",
            },
            {
                item: "minecraft:carrot",
            },
        ],
        result: {
            item: "farmersdelight:vegetable_soup",
        },
    },
    //finish
    {
        identifier: "farmersdelight:fish_stew",
        tags: ["cooking_pot"],
        priority: 0,
        time: 200,
        experience: 1.0,
        ingredients: [
            [{ tag: "farmersdelight:is_raw_fish" }, { item: "minecraft:salmon" }, { item: "minecraft:cod" }],
            [
                {
                    tag: "farmersdelight:is_onion",
                },
                { item: "better_on_bedrock:onion" },
            ],
            {
                item: "farmersdelight:tomato_sauce",
            },
        ],
        result: {
            item: "farmersdelight:fish_stew",
        },
    },
    //finish
    {
        identifier: "farmersdelight:fried_rice",
        tags: ["cooking_pot"],
        priority: 0,
        container: {
            item: "minecraft:bowl",
        },
        time: 200,
        experience: 1.0,
        ingredients: [
            {
                tag: "farmersdelight:is_rice",
            },
            {
                tag: "minecraft:egg",
            },
            [
                {
                    tag: "farmersdelight:is_onion",
                },
                { item: "better_on_bedrock:onion" },
            ],
            {
                item: "minecraft:carrot",
            },
        ],
        result: {
            item: "farmersdelight:fried_rice",
        },
    },
    //finish
    {
        identifier: "farmersdelight:pumpkin_soup",
        tags: ["cooking_pot"],
        priority: 0,
        container: {
            item: "minecraft:bowl",
        },
        time: 200,
        experience: 1.0,
        ingredients: [
            [
                {
                    tag: "farmersdelight:is_cabbage",
                },
                { item: "better_on_bedrock:gabage_leaves" },
            ],
            {
                item: "farmersdelight:pumpkin_slice",
            },
            {
                tag: "farmersdelight:is_milk",
            },
            [{ tag: "farmersdelight:is_raw_porkchop" }, { item: "minecraft:porkchop" }],
        ],
        result: {
            item: "farmersdelight:pumpkin_soup",
        },
    },
    //finish
    {
        identifier: "farmersdelight:tomato_sauce",
        tags: ["cooking_pot"],
        priority: 0,
        container: {
            item: "minecraft:bowl",
        },
        time: 200,
        experience: 1.0,
        ingredients: [
            [{ tag: "farmersdelight:is_tomato" }, { item: "better_on_bedrock:tomato_seed" }],
            [{ tag: "farmersdelight:is_tomato" }, { item: "better_on_bedrock:tomato_seed" }],
        ],
        result: {
            item: "farmersdelight:tomato_sauce",
        },
    },
    //finish
    {
        identifier: "farmersdelight:baked_cod_stew",
        tags: ["cooking_pot"],
        priority: 0,
        container: {
            item: "minecraft:bowl",
        },
        time: 200,
        experience: 1.0,
        ingredients: [
            [
                {
                    tag: "farmersdelight:is_cabbage",
                },
                { item: "better_on_bedrock:gabage_leaves" },
            ],
            {
                tag: "minecraft:egg",
            },
            [{ item: "minecraft:cod" }, { tag: "farmersdelight:cod_slice" }],

            [
                {
                    tag: "farmersdelight:is_tomato",
                },
                { item: "better_on_bedrock:tomato_seed" },
            ],
        ],
        result: {
            item: "farmersdelight:baked_cod_stew",
        },
    },
    //finish
    {
        identifier: "farmersdelight:pasta_with_meatballs",
        tags: ["cooking_pot"],
        priority: 0,
        time: 200,
        experience: 1.0,
        ingredients: [
            {
                item: "farmersdelight:tomato_sauce",
            },
            [
                { item: "better_on_bedrock:beef_patty_raw" },
                {
                    item: "farmersdelight:minced_beef",
                },
            ],
            {
                tag: "farmersdelight:is_pasta",
            },
        ],
        result: {
            item: "farmersdelight:pasta_with_meatballs",
        },
    },
    //finish
    {
        identifier: "farmersdelight:pasta_with_mutton_chop",
        tags: ["cooking_pot"],
        priority: 0,
        time: 200,
        experience: 1.0,
        ingredients: [
            [
                {
                    item: "minecraft:mutton",
                },
                {
                    tag: "farmersdelight:is_raw_mutton",
                },
                { item: "better_on_bedrock:raw_mutton_chops" },
            ],
            {
                item: "farmersdelight:tomato_sauce",
            },
            {
                tag: "farmersdelight:is_pasta",
            },
        ],
        result: {
            item: "farmersdelight:pasta_with_mutton_chop",
        },
    },
    //finish
    {
        identifier: "farmersdelight:vegetable_noodles",
        tags: ["cooking_pot"],
        priority: 0,
        container: {
            item: "minecraft:bowl",
        },
        time: 200,
        experience: 1.0,
        ingredients: [
            [
                {
                    tag: "farmersdelight:is_cabbage",
                },
                { item: "better_on_bedrock:gabage_leaves" },
            ],
            {
                item: "minecraft:brown_mushroom",
            },
            {
                item: "minecraft:carrot",
            },
            {
                item: "farmersdelight:raw_pasta",
            },
            [
                { item: "minecraft:carrot" },
                { item: "minecraft:potato" },
                { item: "minecraft:beetroot" },
                { tag: "farmersdelight:is_onion" },
                { item: "better_on_bedrock:onion" },
                { tag: "farmersdelight:is_tomato" },
                { item: "better_on_bedrock:tomato_seed" },
            ],
        ],
        result: {
            item: "farmersdelight:vegetable_noodles",
        },
    },
    //finish
    {
        identifier: "farmersdelight:squid_ink_pasta",
        tags: ["cooking_pot"],
        priority: 0,
        container: {
            item: "minecraft:bowl",
        },
        time: 200,
        experience: 1.0,
        ingredients: [
            {
                tag: "farmersdelight:is_pasta",
            },
            [
                {
                    tag: "farmersdelight:is_tomato",
                },
                { item: "better_on_bedrock:tomato_seed" },
            ],
            {
                item: "minecraft:ink_sac",
            },
            [{ item: "minecraft:cod" }, { tag: "farmersdelight:is_raw_fish" }, { tag: "minecraft:salmon" }],
        ],
        result: {
            item: "farmersdelight:squid_ink_pasta",
        },
    },
    //finish
    {
        identifier: "farmersdelight:stuffed_pumpkin_block_item",
        tags: ["cooking_pot"],
        priority: 0,
        container: {
            item: "minecraft:pumpkin",
        },
        time: 200,
        experience: 2.0,
        ingredients: [
            {
                tag: "farmersdelight:is_rice",
            },
            [
                {
                    tag: "farmersdelight:is_onion",
                },
                { item: "better_on_bedrock:onion" },
            ],
            {
                item: "minecraft:brown_mushroom",
            },
            {
                item: "minecraft:potato",
            },
            {
                item: "minecraft:sweet_berries",
            },
            [
                { item: "minecraft:carrot" },
                { item: "minecraft:potato" },
                { item: "minecraft:beetroot" },
                { tag: "farmersdelight:is_onion" },
                { item: "better_on_bedrock:onion" },
                { tag: "farmersdelight:is_cabbage" },
                { item: "better_on_bedrock:gabage_leaves" },
                { tag: "farmersdelight:is_tomato" },
                { item: "better_on_bedrock:tomato_seed" },
            ],
        ],
        result: {
            item: "farmersdelight:stuffed_pumpkin_block_item",
        },
    },
    //finish
    {
        identifier: "farmersdelight:rabbit_stew",
        tags: ["cooking_pot"],
        priority: 0,
        container: {
            item: "minecraft:bowl",
        },
        time: 200,
        experience: 1.0,
        ingredients: [
            {
                item: "minecraft:baked_potato",
            },
            {
                item: "minecraft:rabbit",
            },
            {
                item: "minecraft:carrot",
            },
            [
                {
                    item: "minecraft:brown_mushroom",
                },
                {
                    item: "minecraft:red_mushroom",
                },
            ],
        ],
        result: {
            item: "minecraft:rabbit_stew",
        },
    },
    //finish
    {
        identifier: "farmersdelight:cabbage_rolls",
        tags: ["cooking_pot"],
        priority: 0,
        time: 200,
        experience: 1.0,
        ingredients: [
            [
                {
                    tag: "farmersdelight:cabbage_roll_ingredients",
                },
                {
                    item: "minecraft:porkchop",
                },
                {
                    item: "minecraft:carrot",
                },
                {
                    item: "minecraft:potato",
                },
                {
                    item: "minecraft:beetroot",
                },
                {
                    item: "minecraft:brown_mushroom",
                },
                {
                    item: "minecraft:red_mushroom",
                },
                {
                    tag: "minecraft:egg",
                },
                { item: "better_on_bedrock:beef_patty_raw" },
                {
                    item: "minecraft:beef",
                },
                {
                    item: "minecraft:chicken",
                },
                {
                    item: "minecraft:salmon",
                },
                {
                    item: "minecraft:cod",
                },
            ],
            [
                {
                    tag: "farmersdelight:is_cabbage",
                },
                { item: "better_on_bedrock:gabage_leaves" },
            ],
        ],
        result: {
            item: "farmersdelight:cabbage_rolls",
        },
    },
    //finish
    {
        identifier: "farmersdelight:noodle_soup",
        tags: ["cooking_pot"],
        priority: 0,
        container: {
            item: "minecraft:bowl",
        },
        time: 200,
        experience: 1.0,
        ingredients: [
            {
                tag: "farmersdelight:is_pasta",
            },
            {
                tag: "farmersdelight:is_cooked_egg",
            },
            {
                item: "minecraft:dried_kelp",
            },
            [
                {
                    tag: "farmersdelight:is_raw_porkchop",
                },
                {
                    item: "minecraft:porkchop",
                },
            ],
        ],
        result: {
            item: "farmersdelight:noodle_soup",
        },
    },
    {
        identifier: "farmersdelight:dog_food",
        tags: ["cooking_pot"],
        priority: 0,
        container: {
            item: "minecraft:bowl",
        },
        time: 200,
        experience: 1.0,
        ingredients: [
            {
                tag: "farmersdelight:is_rice",
            },
            {
                item: "minecraft:bone_meal",
            },
            {
                item: "minecraft:rotten_flesh",
            },
            [
                {
                    tag: "farmersdelight:wolf_prey",
                },
                {
                    item: "minecraft:chicken",
                },
                {
                    item: "minecraft:mutton",
                },
                { item: "better_on_bedrock:raw_mutton_chops" },
            ],
        ],
        result: {
            item: "farmersdelight:dog_food",
        },
    },
    //finish
    {
        identifier: "farmersdelight:mushroom_rice",
        tags: ["cooking_pot"],
        priority: 0,
        container: {
            item: "minecraft:bowl",
        },
        time: 200,
        experience: 1.0,
        ingredients: [
            {
                item: "minecraft:brown_mushroom",
            },
            {
                item: "minecraft:red_mushroom",
            },
            {
                item: "minecraft:carrot",
            },
            {
                item: "farmersdelight:rice",
            },
        ],
        result: {
            item: "farmersdelight:mushroom_rice",
        },
    },
] as RecipeSpecV1[]).forEach(spec => {
    COOKING_POT_RECIPES.addRecipe(populateV1(spec));
    console.info("Registered cooking pot recipe for", spec.result.item);
});
