import { Request } from "express";

export interface RegisterUserRequest extends Request {
    body: UserData;
}

export interface UserData {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
}