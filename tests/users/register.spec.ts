import request from "supertest";
import app from "../../src/app"
import { App } from "supertest/types";
import { DataSource } from "typeorm"
import { AppDataSource } from "../../src/data-source";
import { User } from "../../src/entity/User";
// import { truncateTables } from "../utils";
import { Roles } from "../../src/constants";
describe("Register Service", () => {
    let connection: DataSource;

    beforeAll(async () => {
        connection = await AppDataSource.initialize()
    })

    afterAll(async () => {
        await connection.destroy()
    })

    beforeEach(async () => {
        await connection.dropDatabase();
        await connection.synchronize()
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
                email: "a@ab.com",
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
            expect(users[0].firstName).toBe(userData.firstName)
            expect(users[0].lastName).toBe(userData.lastName)
            expect(users[0].email).toBe(userData.email)
        })
        it("should return id of newly created user", async () => {
            const userData = {
                firstName: "Ansh",
                lastName: "Shah",
                email: "a@a.com",
                password: "secret"
            }
            const response = await request(app as unknown as App).post("/auth/register").send(userData);
            expect(JSON.parse(response.text)).toHaveProperty('id')
        })
        it("should return role of newly created user", async () => {
            const userData = {
                firstName: "Ansh",
                lastName: "Shah",
                email: "a@a.com",
                password: "secret"
            }
            await request(app as unknown as App).post("/auth/register").send(userData);
            const userRepo = connection.getRepository(User);
            const users = await userRepo.find()
            expect(users[0]).toHaveProperty('role')
            expect(users[0].role).toBe(Roles.CUSTOMER)
        })
        it("should return check password of newly created user", async () => {
            const userData = {
                firstName: "Ansh",
                lastName: "Shah",
                email: "a@a.com",
                password: "secret"
            }
            await request(app as unknown as App).post("/auth/register").send(userData);
            const userRepo = connection.getRepository(User);
            const users = await userRepo.find()
            expect(users[0].password).not.toBe(userData.password)
            expect(users[0].role).toBe(Roles.CUSTOMER)
        })
        it("should return unique email check", async () => {
            const userData = {
                firstName: "Ansh",
                lastName: "Shah",
                email: "a@a.com",
                password: "secret",
                role: Roles.CUSTOMER
            }
            await request(app as unknown as App).post("/auth/register").send(userData);
            const response = await request(app as unknown as App).post("/auth/register").send(userData);
            expect(response.statusCode).toBe(400)
        })
        it("should return 400 email not provided", async () => {
            const userData = {
                firstName: "Ansh",
                lastName: "Shah",
                email: "",
                password: "secret",
                role: Roles.CUSTOMER
            }
            const response = await request(app as unknown as App).post("/auth/register").send(userData);
            expect(response.statusCode).toBe(400)
        })
    })
    // describe("missing fields", () => {


    // })

    describe("Fields not in proper ormat", () => {
        it("should trim email field", async () => {
            const userData = {
                firstName: "Ansh",
                lastName: "Shah",
                email: "rakesh@mern.space      ",
                password: "secret",
                role: Roles.CUSTOMER
            }
            await request(app as unknown as App).post("/auth/register").send(userData);
            const userRepo = connection.getRepository(User);
            const users = await userRepo.find()
            expect(users[0].email).toBe(userData.email.trim())
        })
    })

})