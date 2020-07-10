import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PresentationsController } from './presentations/presentations.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from './config/typeorm.config';
import { UsersController } from './users/users.controller';
import { UsersModule } from './users/users.module';
import { UsersService } from './users/users.service';
import { UserRepository } from './users/user.repository';
import { UserNotesController } from './user-notes/user-notes.controller';
import { UserNotesModule } from './user-notes/user-notes.module';
import { PresentationsModule } from './presentations/presentations.module';

@Module({
  imports: [MulterModule.register({
    dest: './uploads',
  }),
  TypeOrmModule.forRoot(typeOrmConfig),
    UsersModule,
    UserNotesModule,
    PresentationsModule,
  ],
  controllers: [AppController, PresentationsController, UsersController, UserNotesController],
  providers: [AppService, UsersService, UserRepository],
})
export class AppModule { }
