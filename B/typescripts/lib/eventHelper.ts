
export const methodEventSub = (event: any, opt?: any): MethodDecorator => {
    return (target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
        if (!opt) {
            event.subscribe((args: any) => {
                descriptor.value(args);
            })
        } else {
            event.subscribe((args: any) => {
                descriptor.value(args);
            }, opt)
        }
    }
}