"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("./src/utils");
describe.skip('App', () => {
    it("Should return correct discount", () => {
        const dis = (0, utils_1.calculateDiscount)(100, 10);
        expect(dis).toBe(10);
    });
});
