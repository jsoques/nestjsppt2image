import { Presentation } from "src/presentations/presentation.entity";
import { PresentationPages } from "src/presentations/presentationpages.entity";
import { User } from "src/auth/user.entity";
import { BaseEntity, Column, Entity, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class UserNotes extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    userId: number;

    @ManyToOne(type => User, user => user.notes, { eager: false })
    user: User

    @ManyToOne(type => Presentation, presentation => presentation.id, { eager: false })
    presentaton: Presentation;

    // @Column()
    // pageId: number;

    @ManyToOne(type => PresentationPages, pages => pages.id, { eager: false })
    page: PresentationPages;

    @Column({ type: 'varchar', width: 50 })
    createdate: string;

    @Column({ type: 'varchar', width: 50, nullable: true })
    modifydate: string;

}