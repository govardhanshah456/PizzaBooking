import request from "supertest";
import app from "../../src/app";
import { DataSource } from "typeorm";
import { closeTestConnection, getTestConnection, resetDatabase } from "../utils";
import { Tenant } from "../../src/entity/Tenant";
import { User } from "../../src/entity/User";
import { Roles } from "../../src/constants";
import createJWKSMock from "mock-jwks";
import logger from "../../src/config/logger";

describe("Tenant Service", () => {
    let connection: DataSource;
    let jwks: ReturnType<typeof createJWKSMock>;
    let adminToken: string;
    let userToken: string;

    beforeAll(async () => {
        jwks = createJWKSMock("http://127.0.0.1:5501/");
        connection = await getTestConnection();
    });

    afterAll(async () => {
        await closeTestConnection(connection);
    });

    beforeEach(async () => {
        logger.info("Starting test");
        jwks.start();
        logger.info("JWKS started");
        await resetDatabase(connection);

        // Create admin and regular user
        const userRepository = connection.getRepository(User);
        const admin = await userRepository.save({
            firstName: "Admin",
            lastName: "User",
            email: "admin@test.com",
            password: "password",
            role: Roles.ADMIN,
        });

        const user = await userRepository.save({
            firstName: "Regular",
            lastName: "User",
            email: "user@test.com",
            password: "password",
            role: Roles.CUSTOMER,
        });

        // Generate tokens
        adminToken = jwks.token({
            sub: String(admin.id),
            role: admin.role,
        });

        userToken = jwks.token({
            sub: String(user.id),
            role: user.role,
        });
    });

    afterEach(() => {
        jwks.stop();
    });

    describe("Tenant Validation", () => {
        it("should reject empty name", async () => {
            const tenantData = {
                name: "",
                address: "123 Main St",
            };
            logger.info("Sending request");
            const response = await request(app)
                .post("/tenants")
                .set("Cookie", [`accessToken=${adminToken};`])
                .send(tenantData);

            expect(response.status).toBe(400);
            expect(response.body.errors).toContainEqual(
                expect.objectContaining({
                    msg: "Name is required",
                })
            );
        });

        it("should reject name shorter than 2 characters", async () => {
            const tenantData = {
                name: "A",
                address: "123 Main St",
            };

            const response = await request(app)
                .post("/tenants")
                .set("Cookie", [`accessToken=${adminToken};`])
                .send(tenantData);

            expect(response.status).toBe(400);
            expect(response.body.errors).toContainEqual(
                expect.objectContaining({
                    msg: "Name must be at least 2 characters long",
                })
            );
        });

        it("should reject empty address", async () => {
            const tenantData = {
                name: "Test Tenant",
                address: "",
            };

            const response = await request(app)
                .post("/tenants")
                .set("Cookie", [`accessToken=${adminToken};`])
                .send(tenantData);

            expect(response.status).toBe(400);
            expect(response.body.errors).toContainEqual(
                expect.objectContaining({
                    msg: "Address is required",
                })
            );
        });

        it("should reject address shorter than 5 characters", async () => {
            const tenantData = {
                name: "Test Tenant",
                address: "123",
            };

            const response = await request(app)
                .post("/tenants")
                .set("Cookie", [`accessToken=${adminToken};`])
                .send(tenantData);

            expect(response.status).toBe(400);
            expect(response.body.errors).toContainEqual(
                expect.objectContaining({
                    msg: "Address must be at least 5 characters long",
                })
            );
        });

        it("should reject update with invalid data", async () => {
            // Create a tenant first
            const tenantRepository = connection.getRepository(Tenant);
            const savedTenant = await tenantRepository.save({
                name: "Test Tenant",
                address: "123 Main St",
            });

            const updateData = {
                name: "",
                address: "123",
            };

            const response = await request(app)
                .put(`/tenants/${savedTenant.id}`)
                .set("Cookie", [`accessToken=${adminToken};`])
                .send(updateData);

            expect(response.status).toBe(400);
            expect(response.body.errors).toHaveLength(2);
            expect(response.body.errors).toContainEqual(
                expect.objectContaining({
                    msg: "Name is required",
                })
            );
            expect(response.body.errors).toContainEqual(
                expect.objectContaining({
                    msg: "Address must be at least 5 characters long",
                })
            );
        });
    });

    describe("Tenant CRUD Operations", () => {
        it("should create a new tenant (admin only)", async () => {
            const tenantData = {
                name: "Test Tenant",
                address: "123 Main St",
            };

            // Try with admin token
            const response = await request(app)
                .post("/tenants")
                .set("Cookie", [`accessToken=${adminToken};`])
                .send(tenantData);

            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty("id");
            expect(response.body.name).toBe(tenantData.name);
            expect(response.body.address).toBe(tenantData.address);

            // Try with regular user token (should fail)
            const userResponse = await request(app)
                .post("/tenants")
                .set("Cookie", [`accessToken=${userToken};`])
                .send(tenantData);

            expect(userResponse.status).toBe(403);
        });

        it("should get all tenants (authenticated users)", async () => {
            // Create a tenant first
            const tenantRepository = connection.getRepository(Tenant);
            await tenantRepository.save({
                name: "Test Tenant 1",
                address: "123 Main St",
            });

            // Try with admin token
            const adminResponse = await request(app)
                .get("/tenants")
                .set("Cookie", [`accessToken=${adminToken};`]);

            expect(adminResponse.status).toBe(200);
            expect(Array.isArray(adminResponse.body)).toBe(true);
            expect(adminResponse.body.length).toBe(1);

            // Try with regular user token
            const userResponse = await request(app)
                .get("/tenants")
                .set("Cookie", [`accessToken=${userToken};`]);

            expect(userResponse.status).toBe(200);
            expect(Array.isArray(userResponse.body)).toBe(true);
            expect(userResponse.body.length).toBe(1);
        });

        it("should get a specific tenant (authenticated users)", async () => {
            // Create a tenant first
            const tenantRepository = connection.getRepository(Tenant);
            const savedTenant = await tenantRepository.save({
                name: "Test Tenant",
                address: "123 Main St",
            });

            // Try with admin token
            const adminResponse = await request(app)
                .get(`/tenants/${savedTenant.id}`)
                .set("Cookie", [`accessToken=${adminToken};`]);

            expect(adminResponse.status).toBe(200);
            expect(adminResponse.body.id).toBe(savedTenant.id);

            // Try with regular user token
            const userResponse = await request(app)
                .get(`/tenants/${savedTenant.id}`)
                .set("Cookie", [`accessToken=${userToken};`]);

            expect(userResponse.status).toBe(200);
            expect(userResponse.body.id).toBe(savedTenant.id);
        });

        it("should update a tenant (admin only)", async () => {
            // Create a tenant first
            const tenantRepository = connection.getRepository(Tenant);
            const savedTenant = await tenantRepository.save({
                name: "Test Tenant",
                address: "123 Main St",
            });

            const updateData = {
                name: "Updated Tenant",
                address: "456 New St",
            };

            // Try with admin token
            const adminResponse = await request(app)
                .put(`/tenants/${savedTenant.id}`)
                .set("Cookie", [`accessToken=${adminToken};`])
                .send(updateData);

            expect(adminResponse.status).toBe(200);
            expect(adminResponse.body.name).toBe(updateData.name);

            // Try with regular user token (should fail)
            const userResponse = await request(app)
                .put(`/tenants/${savedTenant.id}`)
                .set("Cookie", [`accessToken=${userToken};`])
                .send(updateData);

            expect(userResponse.status).toBe(403);
        });

        it("should delete a tenant (admin only)", async () => {
            // Create a tenant first
            const tenantRepository = connection.getRepository(Tenant);
            const savedTenant = await tenantRepository.save({
                name: "Test Tenant",
                address: "123 Main St",
            });

            // Try with admin token
            const adminResponse = await request(app)
                .delete(`/tenants/${savedTenant.id}`)
                .set("Cookie", [`accessToken=${adminToken};`]);

            expect(adminResponse.status).toBe(204);

            // Try with regular user token (should fail)
            const userResponse = await request(app)
                .delete(`/tenants/${savedTenant.id}`)
                .set("Cookie", [`accessToken=${userToken};`]);

            expect(userResponse.status).toBe(403);
        });

        it("should return 401 for unauthenticated requests", async () => {
            const response = await request(app)
                .get("/tenants");

            expect(response.status).toBe(401);
        });
    });
}); 