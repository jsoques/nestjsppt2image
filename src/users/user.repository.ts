import { Repository, EntityRepository } from "typeorm"
import { User } from "./user.entity"
import { Logger } from "@nestjs/common";

@EntityRepository(User)
export class UserRepository extends Repository<User> {
    private logger = new Logger('UserRepository');

    async validateUserPassword(user: User): Promise<string> {
        const { email, password } = user;
        const validUser = await this.findOne({ email });

        if (validUser && await validUser.validatePassword(password)) {
            return validUser.name;
        } else {
            return null;
        }
    }

}