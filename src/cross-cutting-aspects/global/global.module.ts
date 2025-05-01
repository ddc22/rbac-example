import { Global, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "src/entities/User";
import { UserService } from "src/services/user/user.service";

@Global()
@Module({
  providers: [UserService],
  exports: [UserService],
  imports: [TypeOrmModule.forFeature([User])],
})
export class GlobalModule {}
