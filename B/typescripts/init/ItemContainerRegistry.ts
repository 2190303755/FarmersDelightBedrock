import { subscribeEvent } from "../lib/EventSubscriber";
import { ReceiveScriptMessageEvent } from "../lib/Events";
import { registerContainer } from "../data/ItemContainers";

class ItemContainerRegistry {
    @subscribeEvent(ReceiveScriptMessageEvent, "farmersdelight:item_container")
    static registerRecipe(message: string) {
        const pairs = message.split("/&/");
        for (const pair of pairs) {
            const [item, tagOrId] = pair.split("/", 2);
            if (tagOrId) {
                registerContainer(item, tagOrId);
            }
        }
    }
}
