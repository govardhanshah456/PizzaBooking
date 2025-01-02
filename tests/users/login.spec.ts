import request from "supertest";
import app from "../../src/app"
import { App } from "supertest/types";
import { DataSource } from "typeorm"
import { AppDataSource } from "../../src/data-source";
import { User } from "../../src/entity/User";
// import { truncateTables } from "../utils";
import { Roles } from "../../src/constants";
import * as utils from "../utils";
import { RefreshToken } from "../../src/entity/RefreshToken";
describe("Register Service", () => {

    let connection: DataSource;

    beforeAll(async () => {
        connection = await AppDataSource.initialize();
    });

    afterAll(async () => {
        await connection.dropDatabase();
        await connection.destroy();
    });

    beforeEach(async () => {
        const userData = {
            firstName: "Ansh",
            lastName: "Shah",
            email: "a@a.com",
            password: "secretmmi"
        }
        await request(app as unknown as App).post("/auth/register").send(userData)
    });

    afterEach(async () => {
        await connection.dropDatabase();
        await connection.synchronize();
    });
    describe("given all fields", () => {
        it("should return 201 status code", async () => {
            const userData = {
                email: "a@a.com",
                password: "secretmmi"
            }
            const response = await request(app as unknown as App).post("/auth/login").send(userData);
            expect(response.statusCode).toBe(201)
        })
        it("should return unique email check", async () => {
            const userData = {
                email: "a@b.com",
                password: "secretmmi",
            }
            const response = await request(app as unknown as App).post("/auth/login").send(userData);
            expect(response.statusCode).toBe(500)
        })
        it("should return 400 firstName not provided", async () => {
            const userData = {
                email: "",
                password: "secretmmi",
            }
            const response = await request(app as unknown as App).post("/auth/login").send(userData);
            expect(response.statusCode).toBe(400)
        })
        it("should return 400 password not provided", async () => {
            const userData = {
                email: "a@a.com",
                password: "",
            }
            const response = await request(app as unknown as App).post("/auth/login").send(userData);
            expect(response.statusCode).toBe(400)
        })
    })

})