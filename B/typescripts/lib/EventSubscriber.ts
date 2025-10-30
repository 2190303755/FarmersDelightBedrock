export interface EventSignal<E, T> {
    subscribe(callback: (event: E) => any, option?: T): any;
}

export const SubscribeEvent = <E, T>(event: EventSignal<E, T>, filter?: T): MethodDecorator => {
    return (target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
        if (filter === undefined) {
            event.subscribe(descriptor.value);
        } else {
            event.subscribe(descriptor.value, filter);
        }
    };
};
