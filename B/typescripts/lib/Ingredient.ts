import { ItemType } from "@minecraft/server";

export interface StackIngredient {
    item: string | ItemType;
    count?: number;
}

export interface TagIngredient {
    tag: string;
    count?: number;
}

export type Ingredient = StackIngredient | TagIngredient | Ingredient[];
