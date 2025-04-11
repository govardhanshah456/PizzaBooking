import { UserService } from "../newUserService";
import { User } from "../../entity/User";
import { AppDataSource } from "../../data-source";
import * as bcrypt from "bcrypt";

// Mock the entire bcrypt module
jest.mock("bcrypt", () => ({
  hash: jest.fn().mockResolvedValue("hashedPassword123"),
}));

jest.mock("../../data-source", () => ({
    AppDataSource: {
        getRepository: jest.fn(),
    },
}));

describe("UserService", () => {
    let userService: UserService;
    let mockRepository: any;

    beforeEach(() => {
        mockRepository = {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        };

        (AppDataSource.getRepository as jest.Mock).mockReturnValue(mockRepository);
        userService = new UserService();
    });

    describe("create", () => {
        it("should create a user with tenant", async () => {
            const userData = {
                firstName: "John",
                lastName: "Doe",
                email: "john@example.com",
                password: "password123",
                role: "user",
            };

            const tenantId = 1;
            const hashedPassword = "hashedPassword123";
            const createdUser = { ...userData, id: 1, tenant: { id: tenantId } };

            // No need to spy on bcrypt.hash as we've already mocked it
            mockRepository.create.mockReturnValue(createdUser);
            mockRepository.save.mockResolvedValue(createdUser);

            const result = await userService.create(userData, tenantId);

            expect(result).toEqual(createdUser);
            expect(mockRepository.create).toHaveBeenCalledWith({
                ...userData,
                password: hashedPassword,
                tenant: { id: tenantId },
            });
            expect(bcrypt.hash).toHaveBeenCalledWith(userData.password, 10);
        });
    });

    describe("findAll", () => {
        it("should return users filtered by tenant", async () => {
            const tenantId = 1;
            const users = [
                { id: 1, firstName: "John", tenant: { id: tenantId } },
                { id: 2, firstName: "Jane", tenant: { id: tenantId } },
            ];

            mockRepository.find.mockResolvedValue(users);

            const result = await userService.findAll(tenantId);

            expect(result).toEqual(users);
            expect(mockRepository.find).toHaveBeenCalledWith({
                where: { tenant: { id: tenantId } },
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                    role: true,
                    tenant: { id: true },
                },
            });
        });
    });

    describe("findOne", () => {
        it("should return a user by id and tenant", async () => {
            const userId = 1;
            const tenantId = 1;
            const user = { id: userId, firstName: "John", tenant: { id: tenantId } };

            mockRepository.findOne.mockResolvedValue(user);

            const result = await userService.findOne(userId, tenantId);

            expect(result).toEqual(user);
            expect(mockRepository.findOne).toHaveBeenCalledWith({
                where: { id: userId, tenant: { id: tenantId } },
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                    role: true,
                    tenant: { id: true },
                },
            });
        });
    });

    describe("update", () => {
        it("should update a user", async () => {
            const userId = 1;
            const tenantId = 1;
            const userData = { firstName: "Updated" };
            const existingUser = { id: userId, firstName: "John", tenant: { id: tenantId } };
            const updatedUser = { ...existingUser, ...userData };

            mockRepository.findOne.mockResolvedValue(existingUser);
            mockRepository.update.mockResolvedValue({ affected: 1 });
            mockRepository.findOne.mockResolvedValueOnce(existingUser).mockResolvedValueOnce(updatedUser);

            const result = await userService.update(userId, userData, tenantId);

            expect(result).toEqual(updatedUser);
            expect(mockRepository.update).toHaveBeenCalledWith(
                { id: userId, tenant: { id: tenantId } },
                userData
            );
        });

        it("should hash password when updating with new password", async () => {
            const userId = 1;
            const tenantId = 1;
            const userData = { password: "newPassword" };
            const existingUser = { id: userId, firstName: "John", tenant: { id: tenantId } };
            const updatedUser = { ...existingUser, password: "hashedPassword123" };

            mockRepository.findOne.mockResolvedValue(existingUser);
            mockRepository.update.mockResolvedValue({ affected: 1 });
            mockRepository.findOne.mockResolvedValueOnce(existingUser).mockResolvedValueOnce(updatedUser);

            const result = await userService.update(userId, userData, tenantId);

            expect(result).toEqual(updatedUser);
            expect(bcrypt.hash).toHaveBeenCalledWith(userData.password, 10);
            expect(mockRepository.update).toHaveBeenCalledWith(
                { id: userId, tenant: { id: tenantId } },
                { password: "hashedPassword123" }
            );
        });
    });

    describe("delete", () => {
        it("should delete a user", async () => {
            const userId = 1;
            const tenantId = 1;

            mockRepository.delete.mockResolvedValue({ affected: 1 });

            const result = await userService.delete(userId, tenantId);

            expect(result).toBeTruthy();
            expect(mockRepository.delete).toHaveBeenCalledWith({
                id: userId,
                tenant: { id: tenantId },
            });
        });
    });
}); 