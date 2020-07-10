import { Controller, Get, Param, Post, Body, ValidationPipe, UsePipes } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './user.entity';

@Controller('users')
export class UsersController {
    constructor(private userService: UsersService) { }

    @Get('/:email')
    async getUserByEmail(@Param('email') email: string): Promise<User> {
        return this.userService.getUserByEmail(email);
    }

    @Post()
    @UsePipes(ValidationPipe)
    createUser(@Body() newUser: User): Promise<User> {
        console.log('New User', newUser);
        return this.userService.createUser(newUser);
    }

    @Post('/validate')
    validateUser(@Body() user: User): Promise<string> {
        return this.userService.validatePassword(user);
    }
}
