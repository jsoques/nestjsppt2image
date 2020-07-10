import { TypeOrmModuleOptions } from "@nestjs/typeorm";

export const typeOrmConfig: TypeOrmModuleOptions = {
    type: 'mssql',
    host: 'localhost',
    port: 1433,
    username: 'dental',
    password: 'Dental.2020$',
    database: 'dentalconferences',
    entities: [__dirname + '/../**/*.entity.{js,ts}'],
    synchronize: true,
    logging: true,
    options: {
        enableArithAbort: true,
    }
};