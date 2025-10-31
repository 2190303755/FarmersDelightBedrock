import { Direction, Entity, GameMode, Player } from "@minecraft/server";

// 玩家是否材料有限（JE LivingEntity#hasInfiniteMaterials)
export function hasLimitedMaterials(player: Player): boolean {
    return player.getGameMode() != GameMode.Creative;
}

// 返回实体水平朝向（JE LivingEntity#getDirecion)
export function horizontalDirectionOf(entity: Entity): Direction {
    const rot = entity.getRotation().y;
    if (135 <= rot) return Direction.North;
    if (45 <= rot) return Direction.West;
    if (-45 <= rot) return Direction.South;
    if (-135 <= rot) return Direction.East;
    return Direction.North;
}
