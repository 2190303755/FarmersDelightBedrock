import { ItemStack, ItemType } from "@minecraft/server";

export interface StackSpec {
    readonly item: string | ItemType;
    readonly count?: number;
}

export interface TagSpec {
    readonly tag: string;
    readonly count?: number;
}

export type IngredientSpec = StackSpec | TagSpec | (StackSpec | TagSpec)[];

export type TagOrIdentifier = string

export type InlineIngredientSpec = TagOrIdentifier | TagOrIdentifier[]

export interface Ingredient {
    match(stack: ItemStack): boolean;
    complexity(): number;
}

const ANY_STACK: Ingredient = {
    match(_: ItemStack): boolean {
        return true;
    },
    complexity(): number {
        return 0;
    }
} as const;

export class IdentifierIngredient implements Ingredient {
    readonly itemId: string;
    readonly count: number;

    constructor(itemId: string, count: number = 1) {
        this.itemId = itemId;
        this.count = count > 0 ? count : 1;
    }

    match(stack: ItemStack): boolean {
        return stack.amount >= this.count && stack.typeId === this.itemId;
    }

    complexity(): number {
        return 1;
    }
}

export class TagIngredient implements Ingredient {
    readonly tag: string;
    readonly count: number;

    constructor(tag: string, count: number = 1) {
        this.tag = tag;
        this.count = count > 0 ? count : 1;
    }

    match(stack: ItemStack): boolean {
        return stack.amount >= this.count && stack.hasTag(this.tag);
    }

    complexity(): number {
        return 3;
    }
}

export class ComplexIngredient implements Ingredient {
    readonly ids: string | Set<string> | undefined;
    readonly tags: string | string[] | undefined;
    readonly count: number;

    constructor(ids: string | Set<string> | undefined, tags: string | string[] | undefined, count: number = 1) {
        this.ids = ids;
        this.tags = tags;
        this.count = count > 0 ? count : 1;
    }

    match(stack: ItemStack): boolean {
        if (stack.amount < this.count) return false;
        let cache: string | Set<string> | string[] | undefined = this.ids;
        if (cache) {
            if (cache instanceof Set) {
                if (cache.has(stack.typeId)) return true;
            } else if (cache === stack.typeId) return true;
        }
        cache = this.tags;
        if (cache) {
            if (Array.isArray(cache)) {
                for (const tag of cache) {
                    if (stack.hasTag(tag)) return true;
                }
            } else if (stack.hasTag(cache)) return true;
        }
        return false;
    }

    complexity(): number {
        let complexity = 2;
        const tags = this.tags;
        if (tags) {
            if (Array.isArray(tags)) {
                complexity += tags.length;
            } else {
                ++complexity;
            }
        }
        return complexity;
    }
}

export function makeStack(spec: StackSpec) {
    const count = spec.count ?? 1;
    return new ItemStack(spec.item, count > 0 ? count : 1);
}

export function inlineIngredient(ingredient: StackSpec | TagSpec) {
    const tag = (ingredient as TagIngredient).tag;
    if (tag) return "#" + tag;
    return (ingredient as StackSpec).item as string;
}

export function compileInlineIngredient(ingredient: TagOrIdentifier): Ingredient {
    return ingredient[0] === "#"
        ? new TagIngredient(ingredient.substring(1))
        : new IdentifierIngredient(ingredient);
}

function compileMixedIngredients(tags: Set<string>, ids: Set<string>): Ingredient {
    if (tags.size > 1) {
        if (ids.size > 1) return new ComplexIngredient(ids, Array.from(tags));
        const [id] = ids;
        return new ComplexIngredient(id, Array.from(tags));
    } else if (ids.size > 1) {
        const [tag] = tags;
        return new ComplexIngredient(ids, tag);
    }
    const [tag] = tags;
    const [id] = ids;
    return tag
        ? id ? new ComplexIngredient(id, tag) : new TagIngredient(tag)
        : id ? new IdentifierIngredient(id) : ANY_STACK;
}

export function compileInlineIngredients(ingredient: TagOrIdentifier[]): Ingredient {
    const tags = new Set<string>();
    const ids = new Set<string>();
    for (const tagOrId of ingredient) {
        if (tagOrId[0] === "#") {
            tags.add(tagOrId.substring(1));
        } else {
            ids.add(tagOrId);
        }
    }
    return compileMixedIngredients(tags, ids);
}

export function compileIngredientSpec(ingredient: IngredientSpec): Ingredient {
    if (Array.isArray(ingredient)) {
        if (ingredient.length) {
            const tags = new Set<string>();
            const ids = new Set<string>();
            for (const spec of ingredient) {
                const tag = (spec as TagSpec).tag;
                if (tag) {
                    tags.add(tag);
                } else {
                    ids.add((spec as StackSpec).item as string);
                }
            }
            return compileMixedIngredients(tags, ids);
        }
        return ANY_STACK;
    }
    const tag = (ingredient as TagSpec).tag;
    return tag
        ? new TagIngredient(tag, ingredient.count)
        : new IdentifierIngredient((ingredient as StackSpec).item as string, ingredient.count);
}

function tryMatch(stacks: ItemStack[], ingredients: Ingredient[], used: boolean[], finished: number): boolean {
    if (ingredients.length === finished) return true;
    const ingredient = ingredients[finished];
    for (let i = 0, n = stacks.length; i < n; ++i) {
        if (!used[i] && ingredient.match(stacks[i])) {
            used[i] = true;
            if (tryMatch(stacks, ingredients, used, finished + 1)) return true;
            used[i] = false;
        }
    }
    return false;
}

export function hasMatches(stacks: ItemStack[], ingredients: Ingredient[]): boolean {
    return stacks.length === ingredients.length && tryMatch(stacks, ingredients, [], 0);
}