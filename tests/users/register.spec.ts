import request from "supertest";
import app from "../../src/app"
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
        connection = await utils.getTestConnection() as DataSource;
    });

    afterAll(async () => {
        await utils.closeTestConnection(connection);
    });

    beforeEach(async () => {
        await utils.resetDatabase(connection);
    });
    describe("given all fields", () => {
        it("should return 201 status code", async () => {
            const userData = {
                firstName: "Ansh",
                lastName: "Shah",
                email: "a@abc.com",
                password: "secretmmi"
            }
            const response = await request(app).post("/auth/register").send(userData);
            expect(response.statusCode).toBe(201)
        })
        it("should persist data in db", async () => {
            const userData = {
                firstName: "Ansh",
                lastName: "Shah",
                email: "a@a.com",
                password: "secretmmi"
            }
            await request(app).post("/auth/register").send(userData);
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
                password: "secretmmi"
            }
            const response = await request(app).post("/auth/register").send(userData);
            expect(JSON.parse(response.text)).toHaveProperty('id')
        })
        it("should return role of newly created user", async () => {
            const userData = {
                firstName: "Ansh",
                lastName: "Shah",
                email: "a@a.com",
                password: "secretmmi"
            }
            await request(app).post("/auth/register").send(userData);
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
                password: "secretmmi"
            }
            await request(app).post("/auth/register").send(userData);
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
                password: "secretmmi",
                role: Roles.CUSTOMER
            }
            await (connection.getRepository(User)).save(userData);
            const userData1 = {
                firstName: "Ansh",
                lastName: "Shah",
                email: "a@a.com",
                password: "secretmmi",
                role: Roles.CUSTOMER
            }
            const response = await request(app).post("/auth/register").send(userData1);
            expect(response.statusCode).toBe(400)
        })
        it("should return 400 firstName not provided", async () => {
            const userData = {
                firstName: "",
                lastName: "Shah",
                email: "",
                password: "secretmmi",
                role: Roles.CUSTOMER
            }
            const response = await request(app).post("/auth/register").send(userData);
            expect(response.statusCode).toBe(400)
        })
        it("should return 400 lastName not provided", async () => {
            const userData = {
                firstName: "Ansh",
                lastName: "",
                email: "",
                password: "secretmmi",
                role: Roles.CUSTOMER
            }
            const response = await request(app).post("/auth/register").send(userData);
            expect(response.statusCode).toBe(400)
        })
        it("should return 400 password not provided", async () => {
            const userData = {
                firstName: "Ansh",
                lastName: "Shah",
                email: "",
                password: "",
                role: Roles.CUSTOMER
            }
            const response = await request(app).post("/auth/register").send(userData);
            expect(response.statusCode).toBe(400)
        })
        it("should return 400 password 8 length provided", async () => {
            const userData = {
                firstName: "Ansh",
                lastName: "Shah",
                email: "",
                password: "aaa",
                role: Roles.CUSTOMER
            }
            const response = await request(app).post("/auth/register").send(userData);
            expect(response.statusCode).toBe(400)
        })
        it("should return 400 invalid email", async () => {
            const userData = {
                firstName: "Ansh",
                lastName: "Shah",
                email: "aaaaa",
                password: "aaa",
                role: Roles.CUSTOMER
            }
            const response = await request(app).post("/auth/register").send(userData);
            expect(response.statusCode).toBe(400)
        })
        it("should return 400 missing email", async () => {
            const userData = {
                firstName: "Ansh",
                lastName: "Shah",
                password: "aaa",
                role: Roles.CUSTOMER
            }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const response: any = await request(app).post("/auth/register").send(userData);
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument
            expect(JSON.parse(response.text).errors.length).toBeGreaterThan(0)
        })
        it("should validate access and refresh token", async () => {
            const userData = {
                firstName: "Ansh",
                lastName: "Shah",
                email: "a@a.com",
                password: "secretmmi"
            }
            interface Headers {
                ['set-cookie']: string[]
            }
            const response = await request(app).post("/auth/register").send(userData);
            const cookies = (response.headers as unknown as Headers)['set-cookie'] || []
            let accessToken: string = "";
            let refreshToken: string = "";
            cookies.forEach((cookie) => {
                if (cookie.startsWith('accessToken=')) {
                    accessToken = cookie.split(';')[0].split('=')[1];
                }
                if (cookie.startsWith('refreshToken=')) {
                    refreshToken = cookie.split(';')[0].split('=')[1];
                }
            })
            const refreshTokenRepo = AppDataSource.getRepository(RefreshToken)
            const tokens = await refreshTokenRepo.find()
            expect(accessToken).not.toBe(null)
            expect(refreshToken).not.toBe(null)
            const isValidJwt = utils.isValidJwt
            expect(isValidJwt(accessToken)).toBeTruthy()
            expect(isValidJwt(refreshToken)).toBeTruthy()
            expect(tokens).toHaveLength(1)
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
                password: "secretmmi",
                role: Roles.CUSTOMER
            }
            await request(app).post("/auth/register").send(userData);
            const userRepo = connection.getRepository(User);
            const users = await userRepo.find()
            expect(users[0].email).toBe(userData.email.trim())
        })
    })

})