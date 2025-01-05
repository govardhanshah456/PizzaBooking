import { Request } from "express";

export interface RegisterUserRequest extends Request {
    body: UserData;
}

export interface LoginUserRequest extends Request {
    body: LoginUserData;
}

export interface AuthRequest extends Request {
    auth: {
        sub: number;
        role: string;
    }
}

export interface AuthCookie {
    accessToken: string;
}

export interface LoginUserData {
    email: string;
    password: string;
}
export interface UserData extends LoginUserData {
    firstName: string;
    lastName: string;

}