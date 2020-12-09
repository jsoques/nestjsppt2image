import { Controller, Get, Param, Post, Body, ValidationPipe, UsePipes, ForbiddenException, UnauthorizedException, HttpCode } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from '../auth/user.entity';

@Controller('users')
export class UsersController {
    constructor(private userService: UsersService) { }

    @Get('/:email')
    async getUserByEmail(@Param('email') email: string): Promise<User> {
        return this.userService.getUserByEmail(email);
    }

    @Post('/create')
    @UsePipes(ValidationPipe)
    async createUser(@Body() newUser: User): Promise<any> {
        const createdUser = await this.userService.createUser(newUser);
        let rv = {};
        rv['name'] = createdUser.name;
        rv['email'] = createdUser.email;
        return rv;
    }

    @Post('/login')
    @HttpCode(200)
    async login(@Body() user: User): Promise<any> {
        const rv = await this.userService.validatePassword(user);
        if (rv === null) {
            throw new UnauthorizedException('Invalid credentials');
        } else {
            return rv;
        }
    }
}
