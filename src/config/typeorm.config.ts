import { TypeOrmModuleOptions } from "@nestjs/typeorm";

export const typeOrmConfig: TypeOrmModuleOptions = {
    type: 'better-sqlite3',
    database: './presentations.db',
    entities: [__dirname + '/../**/*.entity.{js,ts}'],
    synchronize: true,
    logging: true
};