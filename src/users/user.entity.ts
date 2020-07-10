import { UserNotes } from "src/user-notes/usernotes.entity";
import { BaseEntity, Entity, PrimaryGeneratedColumn, Column, PrimaryColumn, Unique, OneToMany, IsNull } from "typeorm";
import * as bcrypt from 'bcrypt';
import { Presentation } from "src/presentations/presentation.entity";

@Entity()
export class User extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', width: 100 })
    name: string;

    @Column()
    @Unique(['email'])
    email: string;

    @Column({ type: 'varchar', width: 100 })
    password: string;

    @Column({ type: 'varchar', width: 20 })
    status: UserStatus;

    @Column({ type: 'char', width: 1 })
    isadmin: string;

    @Column()
    salt: string;

    @OneToMany(type => UserNotes, notes => notes.user, { eager: true })
    notes: UserNotes[];

    @OneToMany(type => Presentation, presentation => presentation.user, { eager: true })
    presentation: Presentation[];

    @Column({ type: 'varchar', width: 50 })
    createdate: string;

    @Column({ type: 'varchar', width: 50, nullable: true })
    modifydate: string;

    async validatePassword(password: string): Promise<boolean> {
        const hash = await bcrypt.hash(password, this.salt);
        return hash === this.password;
    }
}

export enum UserStatus {
    ENABLED = 'ENABLED',
    DISABLED = 'DISABLED',
}