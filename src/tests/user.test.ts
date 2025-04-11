import { UserService } from "../services/newUserService";
import { User } from "../entity/User";
import { AppDataSource } from "../data-source";
import * as bcrypt from "bcrypt";

// Mock the bcrypt module
jest.mock("bcrypt", () => ({
  hash: jest.fn().mockResolvedValue("hashedPassword123"),
}));

// Mock the AppDataSource
jest.mock("../data-source", () => ({
  AppDataSource: {
    getRepository: jest.fn(),
  },
}));


describe("User CRUD Operations", () => {
  let userService: UserService;
  let mockRepository: any;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Setup mock repository
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

  describe("Create User", () => {
    it("should create a user with tenant", async () => {
      // Arrange
      const userData = {
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        password: "password123",
        role: "user",
      };
      const tenantId = 1;
      const createdUser = { ...userData, id: 1, tenant: { id: tenantId } };
      
      mockRepository.create.mockReturnValue(createdUser);
      mockRepository.save.mockResolvedValue(createdUser);

      // Act
      const result = await userService.create(userData, tenantId);

      // Assert
      expect(result).toEqual(createdUser);
      expect(mockRepository.create).toHaveBeenCalledWith({
        ...userData,
        password: "hashedPassword123",
        tenant: { id: tenantId },
      });
      expect(bcrypt.hash).toHaveBeenCalledWith(userData.password, 10);
    });
  });

  describe("Find All Users", () => {
    it("should return users filtered by tenant", async () => {
      // Arrange
      const tenantId = 1;
      const users = [
        { id: 1, firstName: "John", tenant: { id: tenantId } },
        { id: 2, firstName: "Jane", tenant: { id: tenantId } },
      ];
      
      mockRepository.find.mockResolvedValue(users);

      // Act
      const result = await userService.findAll(tenantId);

      // Assert
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

  describe("Find One User", () => {
    it("should return a user by id and tenant", async () => {
      // Arrange
      const userId = 1;
      const tenantId = 1;
      const user = { id: userId, firstName: "John", tenant: { id: tenantId } };
      
      mockRepository.findOne.mockResolvedValue(user);

      // Act
      const result = await userService.findOne(userId, tenantId);

      // Assert
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

  describe("Update User", () => {
    it("should update a user", async () => {
      // Arrange
      const userId = 1;
      const tenantId = 1;
      const userData = { firstName: "Updated" };
      const existingUser = { id: userId, firstName: "John", tenant: { id: tenantId } };
      const updatedUser = { ...existingUser, ...userData };
      
      mockRepository.findOne.mockResolvedValue(existingUser);
      mockRepository.update.mockResolvedValue({ affected: 1 });
      mockRepository.findOne.mockResolvedValueOnce(existingUser).mockResolvedValueOnce(updatedUser);

      // Act
      const result = await userService.update(userId, userData, tenantId);

      // Assert
      expect(result).toEqual(updatedUser);
      expect(mockRepository.update).toHaveBeenCalledWith(
        { id: userId, tenant: { id: tenantId } },
        userData
      );
    });

    it("should hash password when updating with new password", async () => {
      // Arrange
      const userId = 1;
      const tenantId = 1;
      const userData = { password: "newPassword" };
      const existingUser = { id: userId, firstName: "John", tenant: { id: tenantId } };
      const updatedUser = { ...existingUser, password: "hashedPassword123" };
      
      mockRepository.findOne.mockResolvedValue(existingUser);
      mockRepository.update.mockResolvedValue({ affected: 1 });
      mockRepository.findOne.mockResolvedValueOnce(existingUser).mockResolvedValueOnce(updatedUser);

      // Act
      const result = await userService.update(userId, userData, tenantId);

      // Assert
      expect(result).toEqual(updatedUser);
      expect(bcrypt.hash).toHaveBeenCalledWith(userData.password, 10);
      expect(mockRepository.update).toHaveBeenCalledWith(
        { id: userId, tenant: { id: tenantId } },
        { password: "hashedPassword123" }
      );
    });
  });

  describe("Delete User", () => {
    it("should delete a user", async () => {
      // Arrange
      const userId = 1;
      const tenantId = 1;
      
      mockRepository.delete.mockResolvedValue({ affected: 1 });

      // Act
      const result = await userService.delete(userId, tenantId);

      // Assert
      expect(result).toBeTruthy();
      expect(mockRepository.delete).toHaveBeenCalledWith({
        id: userId,
        tenant: { id: tenantId },
      });
    });
  });
}); 