import { Vector3 } from "@minecraft/server";

export function isSamePos(obj1: Vector3, obj2: any): boolean {
    return obj2 && obj1.x === obj2.x && obj1.y === obj2.y && obj1.z === obj2.z;
}