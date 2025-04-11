import { Router } from "express";
import { UserController } from "../controllers/UserController";

const router = Router();
const userController = new UserController();

// Create a new user
router.post("/", (req, res) => {
  userController.create(req, res);
});

// Get all users
router.get("/", (req, res) => {
  userController.findAll(req, res);
});

// Get a single user by id
router.get("/:id", (req, res) => {
  userController.findOne(req, res);
});

// Update a user
router.put("/:id", (req, res) => {
  userController.update(req, res);
});

// Delete a user
router.delete("/:id", (req, res) => {
  userController.delete(req, res);
});

export default router; 