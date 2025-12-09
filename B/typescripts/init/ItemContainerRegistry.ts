import { subscribeEvent } from "../lib/EventSubscriber";
import { ReceiveScriptMessageEvent } from "../lib/Events";
import { registerContainer } from "../data/ItemContainers";

// noinspection JSUnusedGlobalSymbols
export class ItemContainerRegistry {
    @subscribeEvent(ReceiveScriptMessageEvent, "farmersdelight:item_container")
    static registerContainerForItems(message: string) {
        const [container, ...items] = message.split("\0");
        for (const item of items) {
            registerContainer(item, container);
        }
    }
}
