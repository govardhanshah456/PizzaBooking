import request from "supertest";
import bcrypt from "bcrypt";
import app from "../../src/app"
import { DataSource } from "typeorm"
import { AppDataSource } from "../../src/data-source";
import { User } from "../../src/entity/User";
// import { truncateTables } from "../utils";
import { Roles } from "../../src/constants";
import * as utils from "../utils";
import { RefreshToken } from "../../src/entity/RefreshToken";
describe("Login Service", () => {

    let connection: DataSource;

    beforeAll(async () => {
        connection = await AppDataSource.initialize();
    });

    afterAll(async () => {
        await connection.destroy();
    });

    beforeEach(async () => {
        await connection.dropDatabase();
        await connection.synchronize();
    });

    describe("given all fields", () => {
        it("should return 201 status code", async () => {
            const userData1 = {
                firstName: "Ansh",
                lastName: "Shah",
                email: "a@h.com",
                password: "secretmmi",
                role: Roles.CUSTOMER
            }
            const hashedPassword = await bcrypt.hash(userData1.password, 10);
            await (connection.getRepository(User)).save({ ...userData1, password: hashedPassword });
            const userData = {
                email: "a@h.com",
                password: "secretmmi"
            }
            const response = await request(app).post("/auth/login").send(userData);
            expect(response.statusCode).toBe(200)
        })
        it("should return incorrect password 500 status code", async () => {
            const userData1 = {
                firstName: "Ansh",
                lastName: "Shah",
                email: "a@h.com",
                password: "secretmmi",
                role: Roles.CUSTOMER
            }
            const hashedPassword = await bcrypt.hash(userData1.password, 10);
            await (connection.getRepository(User)).save({ ...userData1, password: hashedPassword });
            const userData = {
                email: "a@h.com",
                password: "secretmi"
            }
            const response = await request(app).post("/auth/login").send(userData);
            expect(response.statusCode).toBe(500)
        })
        it("should return unique email check", async () => {
            const userData = {
                email: "a@b.com",
                password: "secretmmi",
            }
            const response = await request(app).post("/auth/login").send(userData);
            expect(response.statusCode).toBe(400)
        })
        it("should return 400 firstName not provided", async () => {
            const userData = {
                email: "",
                password: "secretmmi",
            }
            const response = await request(app).post("/auth/login").send(userData);
            expect(response.statusCode).toBe(400)
        })
        it("should return 400 password not provided", async () => {
            const userData = {
                email: "a@a.com",
                password: "",
            }
            const response = await request(app).post("/auth/login").send(userData);
            expect(response.statusCode).toBe(400)
        })
    })

})