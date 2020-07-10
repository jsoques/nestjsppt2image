import { BaseEntity, Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Presentation } from "./presentation.entity";

@Entity()
export class PresentationPages extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    // @Column()
    // presentationid: number;

    @ManyToOne(type => Presentation, presentation => presentation.pages, { eager: false })
    presentation: Presentation;

    @Column()
    page: number;

   
}