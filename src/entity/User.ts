
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm"
import "reflect-metadata"
import { Tenant } from "./Tenant";
@Entity({ name: "users" })
export class User {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ name: "first_name" })
    firstName: string;

    @Column({ name: "last_name" })
    lastName: string;

    @Column({ unique: true })

    email: string;

    @Column()
    password: string;

    @Column()
    role: string;

    @ManyToOne(() => Tenant)
    tenant: Tenant;
}


