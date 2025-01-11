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
        id?: string;
    }
}

export interface AuthCookie {
    accessToken: string;
    refreshToken: string;
}

export interface IResponseJwtPayload {
    id: string;

}


export const enum ProcessingFor {
    REGISTER = 'register',
    LOGIN = 'login',
    REFRESH_TOKEN = 'refresh_token'
}


export interface LoginUserData {
    email: string;
    password: string;
}
export interface UserData extends LoginUserData {
    firstName: string;
    lastName: string;

}