import { Vector3 } from "@minecraft/server";


export default class ObjectUtil {
    public static isEqual(obj1: any, obj2: any) {
        return JSON.stringify(obj1) === JSON.stringify(obj2);
    }
}

export function isSamePos(obj1: Vector3, obj2: Vector3) {
    return obj1.x == obj2.x && obj1.y == obj2.y && obj1.z == obj2.z;
}