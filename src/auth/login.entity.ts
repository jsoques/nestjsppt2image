import { User } from "src/auth/user.entity";
import { BaseEntity, Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Login extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(type => User, user => user.id, { eager: true })
    user: User;

    @Column({ type: 'varchar', width: 2000 })
    token: string;

    @Column({ type: 'varchar', width: 50 })
    logindate: string;

}