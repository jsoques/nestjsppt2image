import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { User, UserStatus } from './user.entity';
import { Connection } from 'typeorm';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {

    private userRepository: UserRepository;

    constructor(
        private readonly connection: Connection
    ) {
        this.userRepository = this.connection.getCustomRepository(UserRepository);
    }

    primitiveToBoolean(value: string | number | boolean | null | undefined): boolean {
        if (value === 'true') {
            return true;
        }

        return typeof value === 'string'
            ? !!+value   // we parse string to integer first
            : !!value;
    }

    async getUserByEmail(email: string): Promise<User> {
        const found = await this.userRepository.findOne({ where: { email } });
        if (!found) {
            throw new NotFoundException(`User with email "${email}" not found`);
        }

        return found;
    }

    async createUser(user: User): Promise<User> {
        console.log('New User Repository', user);
        const { name, email, password, isadmin } = user;
        console.log('isadmin', isadmin.valueOf());
        const newUser = new User();
        newUser.email = email;
        newUser.name = name;
        newUser.salt = await bcrypt.genSalt();
        newUser.password = await this.hashPassword(password, newUser.salt);
        newUser.isadmin = this.primitiveToBoolean(isadmin.toLowerCase()) === true ? '1' : '0';
        newUser.status = UserStatus.DISABLED;
        newUser.createdate = new Date().toISOString();
        try {
            await newUser.save();
        } catch (error) {
            let errMsg = error.message;
            if (errMsg.includes('Violation of UNIQUE KEY')) {
                errMsg = errMsg.split('. ').splice(1).join();
            }
            throw new ConflictException(errMsg);
        }


        return newUser;
    }

    async validatePassword(user: User): Promise<string> {
        const valid = await this.userRepository.validateUserPassword(user);
        console.log(valid, valid);
        return valid;
    }

    private async hashPassword(password: string, salt: string): Promise<string> {
        return bcrypt.hash(password, salt);
    }
}
