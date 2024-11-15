import request from "supertest";
import app from "../../src/app"
import { App } from "supertest/types";
import { DataSource } from "typeorm"
import { AppDataSource } from "../../src/data-source";
import { User } from "../../src/entity/User";
import { truncateTables } from "../utils";
describe("Register Service", () => {
    let connection: DataSource;

    beforeAll(async () => {
        connection = await AppDataSource.initialize()
    })

    afterAll(async () => {
        await connection.destroy()
    })

    beforeEach(async () => {
        await truncateTables(connection)
    })
    describe("given all fields", () => {
        it("should return 201 status code", async () => {
            const userData = {
                firstName: "Ansh",
                lastName: "Shah",
                email: "a@a.com",
                password: "secret"
            }
            const response = await request(app as unknown as App).post("/auth/register").send(userData);
            expect(response.statusCode).toBe(201)
        })
        it("should return 201 status code", async () => {
            const userData = {
                firstName: "Ansh",
                lastName: "Shah",
                email: "a@a.com",
                password: "secret"
            }
            const response = await request(app as unknown as App).post("/auth/register").send(userData);
            expect(response.headers["content-type"]).toEqual(expect.stringContaining("json"))
        })
        it("should persist data in db", async () => {
            const userData = {
                firstName: "Ansh",
                lastName: "Shah",
                email: "a@a.com",
                password: "secret"
            }
            await request(app as unknown as App).post("/auth/register").send(userData);
            const userRepo = connection.getRepository(User);
            const users = await userRepo.find()
            expect(users).toHaveLength(1)
        })
    })
    describe("missing fields", () => {

    })

})