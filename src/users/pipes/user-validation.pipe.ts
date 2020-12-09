import { PipeTransform, BadRequestException } from "@nestjs/common";
import { UserStatus } from "../../auth/user.entity";

export class UserValidationPipe implements PipeTransform {

    transform(value: any) {
        value = value.toUpperCase();

        if(!this.isStatusValid(value)) {
            throw new BadRequestException(`'${value}' is an invalid status`);
        }

        return value;
    }

    private isStatusValid(status: any) {
        return (Object.values(UserStatus).includes(status))
    }
}