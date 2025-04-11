import request from "supertest";
import app from "../../src/app"
import { DataSource } from "typeorm"
import { closeTestConnection, getTestConnection, resetDatabase } from "../utils";
import createJWKSMock from "mock-jwks";
import { Roles } from "../../src/constants";
import { User } from "../../src/entity/User";
describe("User Service", () => {
    let connection: DataSource;
    let jwks: ReturnType<typeof createJWKSMock>;

    beforeAll(async () => {
        jwks = createJWKSMock("http://0.0.0.0:5501/")
        connection = await getTestConnection() as DataSource;
    });

    afterAll(async () => {
        await closeTestConnection(connection);
    });

    beforeEach(async () => {
        jwks.start()
        await resetDatabase(connection);
    });
    afterEach(() => {
        jwks.stop()
    })
    describe("/auth/me", () => {
        it("should return the user data", async () => {
            // Register user
            const userData = {
                firstName: "Rakesh",
                lastName: "K",
                email: "rakesh@mern.space",
                password: "password",
            };
            const userRepository = connection.getRepository(User);
            const data = await userRepository.save({
                ...userData,
                role: Roles.CUSTOMER,
            });
            // Generate token
            const accessToken = jwks.token({
                sub: String(data.id),
                role: data.role,
            });

            // Add token to cookie
            const response = await request(app)
                .get("/auth/me")
                .set("Cookie", [`accessToken=${accessToken};`])
                .send();
            // Assert
            // Check if user id matches with registered user
            expect((response.body as Record<string, string>)).not.toHaveProperty("password");
        });
        it("should return 401 if token is not passed", async () => {
            const response = await request(app)
                .get("/auth/me")
                .send();
            expect(response.status).toBe(401);
        });
    })
})