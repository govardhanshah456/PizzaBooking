
import { calculateDiscount } from "./src/utils"

describe('App', () => {
    it("Should return correct discount", () => {
        const dis = calculateDiscount(100, 10)
        expect(dis).toBe(10)
    })
})