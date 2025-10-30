import { Direction, Entity, GameMode, Player } from "@minecraft/server";

export function cardinalDirection(player: Entity, yOffset: number = 0) {
    const rot = player.getRotation();
    let rotY = rot.y + yOffset;
    if (rotY > 180) rotY -= 360;
    if (-45 <= rotY && rotY < 45) {
        return Direction.North;
    } else if (45 <= rotY && rotY < 135) {
        return Direction.East;
    } else if (-135 <= rotY && rotY < -45) {
        return Direction.West;
    } else if (135 <= rotY || rotY < -135) {
        return Direction.South;
    }
}

// 玩家是否材料有限（JE LivingEntity#hasInfiniteMaterials)
export function hasLimitedMaterials(player: Player): boolean {
    return player.getGameMode() != GameMode.Creative;
}
