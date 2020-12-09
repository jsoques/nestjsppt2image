import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { UserRepository } from './user.repository';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(UserRepository)
        private userReposityory: UserRepository,
    ) { }

    signUp(authCredentialsDto: AuthCredentialsDto): Promise<void> {
        return this.userReposityory.signUp(authCredentialsDto);
    }
}
