import { container } from "tsyringe";

export function config() {
    container.register("DomainStoryModelerViewType", {
        useValue: "egon.io",
    });
}
