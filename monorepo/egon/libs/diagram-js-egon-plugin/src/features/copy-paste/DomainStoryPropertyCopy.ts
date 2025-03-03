import EventBus from "diagram-js/lib/core/EventBus";
import { forEach, has, isArray, isDefined, isObject, reduce, sortBy } from "min-dash";

type CopiedProperty = boolean | Map<string, any>;

const DISALLOWED_PROPERTIES = ["incoming", "outgoing"];

export class DomainStoryPropertyCopy {
    static $inject: string[] = [];

    constructor(private readonly eventBus: EventBus) {
        // copy extension elements last
        eventBus.on("propertyCopy.canCopyProperties", function (context: any) {
            const propertyNames: string[] = context.propertyNames;

            if (!propertyNames || !propertyNames.length) {
                return;
            }

            return sortBy(propertyNames, function (propertyName): any {
                const val = propertyName === "extensionElements";
                console.debug("[DomainStoryPropertyCopy]" + val);
                return val;
            });
        });

        // default check whether property can be copied
        eventBus.on("propertyCopy.canCopyProperty", function (context: any) {
            const propertyName = context.propertyName;
            return !(propertyName && DISALLOWED_PROPERTIES.indexOf(propertyName) !== -1);
        });
    }

    copyElement(
        sourceElement: Map<string, any>,
        targetElement: Map<string, any>,
        propertyNames?: string[],
    ) {
        if (propertyNames && !isArray(propertyNames)) {
            propertyNames = [propertyNames];
        }

        const canCopyProperties = this.eventBus.fire("propertyCopy.canCopyProperties", {
            propertyNames: propertyNames,
            sourceElement: sourceElement,
            targetElement: targetElement,
        });

        if (canCopyProperties === false) {
            return targetElement;
        }

        if (isArray(canCopyProperties)) {
            propertyNames = canCopyProperties;
        }

        // copy properties
        forEach(propertyNames, (propertyName) => {
            let sourceProperty;

            if (has(sourceElement, propertyName)) {
                sourceProperty = sourceElement.get(propertyName);
            }

            const copiedProperty = this.copyProperty(
                sourceProperty,
                targetElement,
                propertyName,
            );

            const canSetProperty = this.eventBus.fire(
                "propertyCopy.canSetCopiedProperty",
                {
                    parent: targetElement,
                    property: copiedProperty,
                    propertyName: propertyName,
                },
            );

            if (canSetProperty === false) {
                return;
            }

            if (isDefined(copiedProperty)) {
                targetElement.set(propertyName, copiedProperty);
            }
        });

        return targetElement;
    }

    copyProperty(
        property: Map<string, any>,
        parent: Map<string, any>,
        propertyName: string,
    ): CopiedProperty | undefined {
        // allow others to copy property
        let copiedProperty: CopiedProperty | undefined = this.eventBus.fire(
            "propertyCopy.canCopyProperty",
            {
                parent: parent,
                property: property,
                propertyName: propertyName,
            },
        );

        console.debug("[DomainStoryPropertyCopy] copied property: " + copiedProperty);

        // return if copying is NOT allowed
        if (typeof copiedProperty === "boolean" && !copiedProperty) {
            return;
        }

        if (copiedProperty) {
            if (isObject(copiedProperty) && !copiedProperty.has("$parent")) {
                copiedProperty.set("$parent", parent);
            }

            // if copiedProperty is a boolean and true, returns true
            // if copiedProperty is an object, returns the object
            // if copiedProperty is whatever, returns whatever
            return copiedProperty;
        }

        // TODO: Does the following part get ever executed???

        // copy arrays
        if (isArray(property)) {
            return reduce(
                property,
                (childProperties: any, childProperty: any): any => {
                    // recursion
                    copiedProperty = this.copyProperty(
                        childProperty,
                        parent,
                        propertyName,
                    );

                    // copying might NOT be allowed
                    if (copiedProperty) {
                        // @ts-expect-error TypeScript does not like it :(
                        copiedProperty["$parent"] = parent;

                        return childProperties.concat(copiedProperty);
                    }

                    return childProperties;
                },
                [],
            );
        }

        // copy model elements
        if (isObject(property)) {
            copiedProperty = new Map();

            copiedProperty.set("$parent", parent);

            // recursion
            copiedProperty = this.copyElement(property, copiedProperty);

            return copiedProperty;
        }

        // copy primitive properties
        return property;
    }
}

DomainStoryPropertyCopy.$inject = ["eventBus"];
