import { ItemStack } from "@minecraft/server";
import { matchStack } from "../lib/ItemUtil";

const ITEM_CONTAINERS: Map<string, string | Set<string>> = new Map();

export function registerContainer(content: string, tagOrId: string) {
    const registered = ITEM_CONTAINERS.get(content);
    if (registered) {
        if (registered instanceof Set) {
            registered.add(tagOrId);
        } else if (registered !== tagOrId) {
            ITEM_CONTAINERS.set(content, new Set([registered, tagOrId]));
        }
    } else {
        ITEM_CONTAINERS.set(content, tagOrId);
    }
}

export function hasContainer(content: string) {
    return ITEM_CONTAINERS.has(content);
}

export function isContainer(content: string, stack: ItemStack) {
    const candidates = ITEM_CONTAINERS.get(content);
    if (!candidates) return false;
    if (candidates instanceof Set) {
        if (candidates.has(stack.typeId)) return true;
        for (const candidate of candidates) {
            if (candidate[0] === "#" && stack.hasTag(candidate.substring(1))) return true;
        }
        return false;
    }
    return matchStack(candidates, stack);
}