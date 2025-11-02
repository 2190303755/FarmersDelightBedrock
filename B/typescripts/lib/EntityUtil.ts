import {
    Container,
    Direction,
    Entity,
    EntityComponentTypes,
    GameMode,
    Player,
    system,
} from "@minecraft/server";

// 玩家是否材料有限（JE LivingEntity#hasInfiniteMaterials)
export function hasLimitedMaterials(player: Player): boolean {
    return player.getGameMode() != GameMode.Creative;
}

// 返回实体水平朝向（JE LivingEntity#getDirecion)
export function horizontalDirectionOf(entity: Entity): Direction {
    const rot = entity.getRotation().y;
    if (rot < -135) return Direction.North;
    if (rot < -45) return Direction.East;
    if (rot < 45) return Direction.South;
    if (rot < 135) return Direction.West;
    return Direction.North;
}

export function dropsItems(
    entity: Entity,
    container?: Container
) {
    if (!container) {
        container = entity.getComponent(EntityComponentTypes.Inventory)?.container
        if (!container) return;
    }
    const { dimension, location } = entity;
    for (let i = 0, size = container.size; i < size; ++i) {
        const stack = container.getItem(i);
        if (stack) {
            dimension.spawnItem(stack, location);
        }
    }
    container.clearAll();
}

export function discard(entity: Entity) {
    system.run(() => entity.remove());
}