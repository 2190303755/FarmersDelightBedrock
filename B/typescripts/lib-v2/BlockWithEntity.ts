import { Block, Entity, Vector3 } from "@minecraft/server";
import { isSamePos } from "../lib/ObjectUtil";

export function initBlockEntity(block: Block, typeId: string): Entity {
    const pos = block.bottomCenter();
    const impl = block.dimension.spawnEntity(typeId, pos);
    impl.setDynamicProperty("farmersdelight:blockEntityDataLocation", pos);
    impl.setDynamicProperty("farmersdelight:entityId", impl.id);
    return impl;
}

export function getBlockEntity(block: Block, typeId: string): Entity | undefined {
    const pos = block.bottomCenter();
    const candidates = block.dimension.getEntities({ location: pos, type: typeId });
    for (const candidate of candidates) {
        if (candidate.id !== candidate.getDynamicProperty("farmersdelight:entityId")) continue;
        if (isSamePos(pos, candidate.getDynamicProperty("farmersdelight:blockEntityDataLocation"))) {
            return candidate;
        }
    }
    return undefined;
}