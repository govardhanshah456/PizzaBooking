
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm"
import "reflect-metadata"
@Entity({ name: "users" })
export class User {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    firstName: string;

    @Column()
    lastName: string;

    @Column({ unique: true })

    email: string;

    @Column()
    password: string;

    @Column()
    role: string;
}


