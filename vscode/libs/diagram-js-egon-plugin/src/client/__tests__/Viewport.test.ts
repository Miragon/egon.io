import { Viewport } from "../domain/model/Viewport";

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

    it("should not equal viewport with different x", () => {
        const v1 = new Viewport(0, 0, 100, 100);
        const v2 = new Viewport(1, 0, 100, 100);
        expect(v1.equals(v2)).toBe(false);
    });

    it("should not equal viewport with different y", () => {
        const v1 = new Viewport(0, 0, 100, 100);
        const v2 = new Viewport(0, 1, 100, 100);
        expect(v1.equals(v2)).toBe(false);
    });

    it("should not equal viewport with different width", () => {
        const v1 = new Viewport(0, 0, 100, 100);
        const v2 = new Viewport(0, 0, 101, 100);
        expect(v1.equals(v2)).toBe(false);
    });

    it("should not equal viewport with different height", () => {
        const v1 = new Viewport(0, 0, 100, 100);
        const v2 = new Viewport(0, 0, 100, 101);
        expect(v1.equals(v2)).toBe(false);
    });

    it("should convert to plain object", () => {
        const viewport = new Viewport(10, 20, 800, 600);
        const data = viewport.toPlainObject();

        expect(data).toEqual({
            x: 10,
            y: 20,
            width: 800,
            height: 600,
        });
    });

    it("should create from plain object", () => {
        const data = { x: 10, y: 20, width: 800, height: 600 };
        const viewport = Viewport.fromPlainObject(data);

        expect(viewport.x).toBe(10);
        expect(viewport.y).toBe(20);
        expect(viewport.width).toBe(800);
        expect(viewport.height).toBe(600);
    });

    it("should round-trip conversion", () => {
        const original = new Viewport(10, 20, 800, 600);
        const data = original.toPlainObject();
        const restored = Viewport.fromPlainObject(data);

        expect(restored.equals(original)).toBe(true);
    });
});
