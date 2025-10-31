import {
    Block,
    Container,
    ContainerSlot,
    EnchantmentType,
    Entity,
    EntityComponentTypes,
    EquipmentSlot,
    GameMode,
    ItemComponentTypes,
    ItemStack,
    ItemType,
    Player,
    Vector3,
} from "@minecraft/server";

export function enchantmentLevelOf(stack: ItemStack | undefined, enchantment: string | EnchantmentType): number {
    const instance = stack?.getComponent(ItemComponentTypes.Enchantable)?.getEnchantment(enchantment);
    return instance ? instance.level : 0;
}

export function hurtItem(container: Container, index: number, damage: number = 1) {
    const stack = container.getItem(index);
    if (!stack) return;
    const durability = stack.getComponent(ItemComponentTypes.Durability);
    if (durability && durability.maxDurability > durability.damage) {
        durability.damage += damage;
        container.setItem(index, stack);
        return;
    }
    container.setItem(index, undefined);
}

// 返回仍需取出的物品量
export function takeItemInSlot(slot: ContainerSlot, max: number): number {
    const remaining = slot.amount;
    if (remaining > max) {
        slot.amount = remaining - max;
        return 0;
    }
    slot.setItem(undefined);
    return max - remaining;
}

// 返回仍需取出的物品量
export function takeItem(container: Container, slot: number, max: number = 1): number {
    const reference = container.getSlot(slot);
    return reference ? takeItemInSlot(reference, max) : max;
}

// 返回仍需取出的物品量
export function takeEquippedItem(
    entity: Entity,
    slot: EquipmentSlot = EquipmentSlot.Mainhand,
    max: number = 1
): number {
    const reference = entity.getComponent(EntityComponentTypes.Equippable)?.getEquipmentSlot(slot);
    return reference ? takeItemInSlot(reference, max) : max;
}

export function consumeItem(player: Player, slot: number = player.selectedSlotIndex, convertTo?: ItemStack) {
    const container = player.getComponent(EntityComponentTypes.Inventory)?.container;
    const stack = container?.getItem(slot);
    if (!stack) return;
    if (player.getGameMode() != GameMode.Creative) {
        const remaining = stack.amount;
        if (remaining > 1) {
            stack.amount = remaining - 1;
            container!!.setItem(slot, stack);
        } else {
            container!!.setItem(slot, convertTo);
            return;
        }
    }
    if (convertTo) {
        const remaining = container!!.addItem(convertTo);
        if (remaining) {
            player.dimension.spawnItem(remaining, player.location);
        }
    }
}

export function spawnItem(
    source: Block | Entity,
    item: string | ItemType,
    amount: number = 1,
    pos?: Vector3
): Entity | undefined {
    return spawnStack(source, new ItemStack(item, amount), pos);
}

export function spawnStack(
    source: Block | Entity,
    stack: ItemStack,
    pos: Vector3 = source instanceof Entity
        ? source.location
        : Math.random() < 0.5
        ? source.center()
        : source.bottomCenter()
): Entity | undefined {
    try {
        return source.dimension.spawnItem(stack, pos);
    } catch {
        return undefined;
    }
}
