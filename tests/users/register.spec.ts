import request from "supertest"
import app from "../../src/app"
describe("Register Service", () => {
    describe("given all fields", () => {
        it("should return 201 status code", async () => {
            const userData = {
                firstName: "Ansh",
                lastName: "Shah",
                email: "a@a.com",
                password: "secret"
            }
            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            const response = await request(app).post("/auth/register").send(userData);
            expect(response.statusCode).toBe(201)
        })
        it("should return 201 status code", async () => {
            const userData = {
                firstName: "Ansh",
                lastName: "Shah",
                email: "a@a.com",
                password: "secret"
            }
            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            const response = await request(app).post("/auth/register").send(userData);
            expect(response.headers["content-type"]).toEqual(expect.stringContaining("json"))
        })
    })
    describe("missing fields", () => {

    })
})