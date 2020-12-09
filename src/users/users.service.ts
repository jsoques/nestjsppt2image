import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { UserRepository } from '../auth/user.repository';
import { User, UserStatus } from '../auth/user.entity';
import { Connection } from 'typeorm';

@Injectable()
export class UsersService {

    private userRepository: UserRepository;

    constructor(
        private readonly connection: Connection
    ) {
        this.userRepository = this.connection.getCustomRepository(UserRepository);
    }

    async getUserByEmail(email: string): Promise<User> {
        const found = await this.userRepository.findOne({ where: { email } });
        if (!found) {
            throw new NotFoundException(`User with email "${email}" not found`);
        }

        return found;
    }

    async createUser(user: User): Promise<User> {
        return this.userRepository.createUser(user);
    }

    async validatePassword(user: User): Promise<any> {
        const valid = await this.userRepository.validateUserPassword(user);
        console.log('is valid', valid);
        if (valid != null) {
            const rv = {};
            rv['email'] = valid.email;
            rv['name'] = valid.name;
            rv['id'] = valid.id;
            return rv;
        } else {
            return null;
        }
    }


}
