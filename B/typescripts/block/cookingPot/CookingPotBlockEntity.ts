import {
    Block,
    Container,
    ContainerSlot,
    Entity,
    EntityComponentTypes, ItemComponentTypes,
    ItemStack,
    Vector3,
} from "@minecraft/server";
import { isHeated } from "../../data/Heaters";
import { attachedBlockEntity } from "../../lib/EventSubscriber";
import { hasMatches, makeStack, StackSpec } from "../../lib/Ingredients";
import { hasContainer, isContainer } from "../../data/ItemContainers";
import { takeItemInSlot } from "../../lib/ItemUtil";
import { COOKING_POT_RECIPES, CookingPotRecipe } from "../../data/recipe/cookingPotRecipe";

interface CookingContext {
    last: CookingPotRecipe | undefined;
    time: number;
    total: number;
}

const COOKING_CONTEXTS: Map<string, CookingContext> = new Map();

// 拿到有足够原料且产物可以继续堆叠的配方
function getAvailableRecipe(container: Container, result: ContainerSlot, last?: CookingPotRecipe): CookingPotRecipe | undefined {
    const input: ItemStack[] = [];
    for (let i = 0; i < 6; ++i) {
        const stack = container.getItem(i);
        if (stack) {
            input.push(stack);
        }
    }
    if (!input.length) return undefined;
    let isAvailable: (recipe: CookingPotRecipe) => boolean;
    if (result.hasItem()) {
        isAvailable = (recipe) => {
            if (input.length !== recipe.ingredients.length) return false;
            const cooked = makeStack(recipe.result);
            if (cooked.amount + result.amount > result.maxAmount || !result.isStackableWith(cooked)) return false;
            return hasMatches(input, recipe.ingredients);
        };
    } else {
        isAvailable = (recipe) => hasMatches(input, recipe.ingredients);
    }
    if (last && isAvailable(last)) return last;
    return COOKING_POT_RECIPES.findSortedRecipe(isAvailable);
}

function assemble(cooked: StackSpec, result: ContainerSlot): boolean {
    const stack = makeStack(cooked);
    if (result.hasItem()) {
        const total = stack.amount + result.amount;
        if (total > result.maxAmount || !result.isStackableWith(stack)) return false;
        result.amount = total;
    } else {
        result.setItem(stack);
    }
    return true;
}

function transferCookedItem(cooked: ContainerSlot, container: Container) {
    const result = cooked.getItem();
    if (!result) return;
    const typeId = result.typeId;
    let delta = result.amount;
    let utensil: ContainerSlot | undefined;
    if (hasContainer(typeId)) {
        utensil = container.getSlot(7);
        const stack = utensil.getItem();
        if (!stack || !isContainer(typeId, stack)) return;
        delta = Math.min(delta, stack.amount);
    }
    const output = container.getSlot(8);
    if (output.hasItem()) {
        if (output.isStackableWith(result)) {
            const amount = output.amount;
            delta = Math.min(delta, output.maxAmount - amount);
            output.amount = amount + delta;
        } else return;
    } else {
        result.amount = delta;
        output.setItem(result);
    }
    takeItemInSlot(cooked, delta, false);
    if (utensil) {
        takeItemInSlot(utensil, delta, false);
    }
}

@attachedBlockEntity({
    entityTypes: ["farmersdelight:cooking_pot"],
    eventTypes: ["farmersdelight:cooking_pot_tick"],
})
export class CookingPotBlockEntity {
    static onDiscard(entity: Entity): undefined {
        const { dimension, location } = entity;
        const loot = new ItemStack("farmersdelight:cooking_pot");
        const container = entity.getComponent(EntityComponentTypes.Inventory)?.container;
        if (!container) {
            dimension.spawnItem(loot, location);
            return;
        }
        let stack: ItemStack | undefined = container.getItem(6);
        if (stack) {
            container.setItem(6, undefined);
            loot.setDynamicProperty("farmersdelight:cookedItem", stack.typeId);
            const amount = stack.amount;
            if (amount > 1) {
                loot.setDynamicProperty("farmersdelight:cookedItemCount", amount);
                loot.setLore([{
                    translate: "farmersdelight.tooltip.cooking_pot.many_servings",
                    with: {
                        rawtext: [
                            { text: amount.toString() },
                            { translate: stack.localizationKey },
                        ],
                    },
                }]);
            } else {
                loot.setLore([{
                    translate: "farmersdelight.tooltip.cooking_pot.single_serving",
                    with: { rawtext: [{ translate: stack.localizationKey }] },
                }]);
            }
        }
        dimension.spawnItem(loot, location);
        for (let i = 0; i < 9; ++i) {
            stack = container.getItem(i);
            if (stack) { // 此时6是undefined
                dimension.spawnItem(stack, location);
                container.setItem(i, undefined);
            }
        }
        container.setItem(9, undefined);
        container.setItem(10, undefined);
    }

    static onRemove(entityId: string) {
        COOKING_CONTEXTS.delete(entityId);
    }

    static onTick(entity: Entity, block: Block) {
        const container = entity.getComponent(EntityComponentTypes.Inventory)?.container;
        if (!container) return;
        let context: CookingContext | undefined = COOKING_CONTEXTS.get(entity.id);
        if (!context) {
            context = {
                last: undefined,
                time: entity.getDynamicProperty("recipe:progressTick") as number ?? 0, // 这是什么命名空间
                total: entity.getDynamicProperty("farmersdelight:totalTime") as number ?? 0,
            };
            COOKING_CONTEXTS.set(entity.id, context);
        }
        const heated = isHeated(block);
        const cooked = container.getSlot(6);
        if (heated) {
            const last = context.last;
            const recipe = getAvailableRecipe(container, cooked, last);
            if (recipe) {
                if (last !== recipe) {
                    context.last = recipe;
                    context.time = 0;
                    context.total = recipe.time;
                    entity.setDynamicProperty("farmersdelight:totalTime", context.total);
                } else if (++context.time >= recipe.time && assemble(recipe.result, cooked)) {
                    context.time = 0;
                    if (recipe.experience) {
                        // 先记着罢
                        const current = Number(entity.getDynamicProperty("farmersdelight:experience"));
                        entity.setDynamicProperty("farmersdelight:experience", Number.isNaN(current) ? recipe.experience : recipe.experience + current);
                    }
                    for (let i = 0; i < 6; ++i) {
                        const slot = container.getSlot(i);
                        if (!slot.hasItem()) continue;
                        const amount = slot.amount - 1;
                        if (amount > 0) {
                            slot.amount = amount;
                        } else {
                            slot.setItem(undefined);
                        }
                    }
                }
            } else {
                context.time = 0;
            }
            if (Math.random() < 0.04) { // 触发间隔大于15刻的概率约为50%
                const { x, y, z }: Vector3 = entity.location;
                block.dimension.spawnParticle("farmersdelght:bubble", { x: x, y: y + 0.63, z: z });
            }
            if (Math.random() < 0.02) { // 总之概率是上面的一半
                const { x, y, z }: Vector3 = entity.location;
                block.dimension.spawnParticle(`farmersdelight:steam_${Math.floor(Math.random() * 10)}`, {
                    x: x,
                    y: y + 1,
                    z: z,
                });
            }
            if (Math.random() < 0.008) { // 触发间隔大于80刻的概率约为50%
                entity.runCommand(cooked.hasItem()
                    ? "playsound block.farmersdelight.cooking_pot.boil_soup @a ~ ~ ~ 1 1"
                    : "playsound block.farmersdelight.cooking_pot.boil_water @a ~ ~ ~ 1 1",
                );
            }
            if (container.getItem(10)?.typeId !== "farmersdelight:fire_1") {
                container.setItem(10, new ItemStack("farmersdelight:fire_1"));
            }
        } else {
            if (context.time > 0) {
                context.time = Math.max(0, context.time - 2);
            }
            if (container.getItem(10)?.typeId !== "farmersdelight:fire_0") {
                container.setItem(10, new ItemStack("farmersdelight:fire_0"));
            }
        }
        transferCookedItem(cooked, container);
        entity.setDynamicProperty("recipe:progressTick", context.time);
        const progress = context.total ? context.time / context.total : 0;
        const expected = `farmersdelight:cooking_pot_arrow_${Math.floor(progress * 10) * 10}`;
        if (container.getItem(9)?.typeId !== expected) {
            container.setItem(9, new ItemStack(expected));
        }
    }
}