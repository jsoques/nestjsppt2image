import { User } from "src/auth/user.entity";
import { BaseEntity, Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { PresentationPages } from "./presentationpages.entity";

@Entity()
export class Presentation extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', width: 100 })
    name: string;

    @Column({ type: 'varchar', width: 50 })
    presentationdate: string;

    @Column()
    userId: number;

    @ManyToOne(type => User, user => user.presentation, { eager: false })
    user: User

    @OneToMany(type => PresentationPages, presentationpages => presentationpages.presentation , { eager: true })
    pages: PresentationPages[];

    @Column({ type: 'varchar', width: 20 })
    status: PresentationStatus

    @Column({ type: 'varchar', width: 50 })
    createdate: string;

    @Column({ type: 'varchar', width: 50, nullable: true })
    modifydate: string;

}

export enum PresentationStatus {
    ENABLED = 'ENABLED',
    DISABLED = 'DISABLED',
}