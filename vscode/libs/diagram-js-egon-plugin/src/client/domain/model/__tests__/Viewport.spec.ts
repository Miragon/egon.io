import { describe, it, expect } from "vitest";
import { Viewport } from "../Viewport";

describe("Viewport (Value Object)", () => {
    it("should be immutable", () => {
        const viewport = new Viewport(0, 0, 100, 100);
        expect(Object.isFrozen(viewport)).toBe(true);
    });

    it("should compare equality by value", () => {
        const v1 = new Viewport(0, 0, 100, 100);
        const v2 = new Viewport(0, 0, 100, 100);
        const v3 = new Viewport(10, 10, 100, 100);

        expect(v1.equals(v2)).toBe(true);
        expect(v1.equals(v3)).toBe(false);
    });

    it("should convert to and from plain object", () => {
        const viewport = new Viewport(10, 20, 800, 600);
        const data = viewport.toPlainObject();
        const restored = Viewport.fromPlainObject(data);

        expect(restored.equals(viewport)).toBe(true);
    });
});
