import { Block, Entity, Vector3 } from "@minecraft/server";
import { isSamePos } from "../lib/ObjectUtil";

export function locateBlock(entity: Entity): Block | undefined {
    try {
        const pos = entity.getDynamicProperty("farmersdelight:blockEntityDataLocation");
        if (!pos) return undefined;
        if (!isSamePos(entity.location, pos)) {
            entity.teleport(pos as Vector3);
        }
        return entity.dimension.getBlock(pos as Vector3);
    } catch {
        return undefined;
    }
}