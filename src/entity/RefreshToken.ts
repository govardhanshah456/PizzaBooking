
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm"
import { User } from "./User"

@Entity({ name: "refresh_tokens" })
export class RefreshToken {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    expiresAt: Date

    @ManyToOne(() => User)
    user: User

    @UpdateDateColumn()
    updatedAt: number

    @CreateDateColumn()
    createdAt: number

}
