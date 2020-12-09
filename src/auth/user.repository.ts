import { Repository, EntityRepository } from "typeorm"
import { User, UserStatus } from "./user.entity"
import { ConflictException, Logger } from "@nestjs/common";
import * as bcrypt from 'bcrypt';
import { AuthCredentialsDto } from "./dto/auth-credentials.dto";

@EntityRepository(User)
export class UserRepository extends Repository<User> {
    private logger = new Logger('UserRepository');

    private primitiveToBoolean(value: string | number | boolean | null | undefined): boolean {
        if (value === 'true') {
            return true;
        }

        return typeof value === 'string'
            ? !!+value   // we parse string to integer first
            : !!value;
    }

    private async hashPassword(password: string, salt: string): Promise<string> {
        return bcrypt.hash(password, salt);
    }

    async signUp(authCredentiaslDto: AuthCredentialsDto): Promise<void> {
        const { username, password } = authCredentiaslDto;

        const user = new User();
        user.name = username;
        user.password = password;

        await user.save();

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

    async validateUserPassword(user: User): Promise<User> {
        const { email, password } = user;
        const validUser = await this.findOne({ email });

        if (validUser && await validUser.validatePassword(password)) {
            return validUser;
        } else {
            return null;
        }
    }

}