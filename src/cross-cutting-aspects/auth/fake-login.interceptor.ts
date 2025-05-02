import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { UserService } from "src/services/user/user.service";
import { CURRENT_USER_KEY } from "./current-user";

@Injectable()
export class FakeLoginInterceptor implements NestInterceptor {
  constructor(private userService: UserService) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();

    /**
     * TODO: Wire up this hardcoded user from a jwt and an auth guard
     */
    const userId = request.headers["user-id"];
    const user = await this.userService.getUser(userId ?? CURRENT_USER_KEY);

    if (!user) {
      throw new Error("User not found hardcode a valid user");
    }

    request.user = user;

    return next.handle();
  }
}
