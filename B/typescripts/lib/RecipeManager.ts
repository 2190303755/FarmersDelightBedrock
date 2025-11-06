export type Recipe = {
    priority?: number;
}

export class RecipeManager<T extends Recipe> {
    private recipes: T[] = [];
    private dirty: boolean = true;
    addRecipe(recipe: T): void {
        this.dirty = true;
        this.recipes.push(recipe);
    }
    findRecipe(predicate: (recipe:  T) => boolean): T | undefined {
        if (this.dirty) {
            this.recipes.sort(
                (left, right) =>  (right.priority ?? 0) - (left.priority ?? 0)
            );
            this.dirty = false;
        }
        for (const recipe of this.recipes) {
            if (predicate(recipe)) return recipe;
        }
        return undefined;
    }
}