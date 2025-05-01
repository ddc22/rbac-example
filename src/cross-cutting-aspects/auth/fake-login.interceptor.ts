/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
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
    const user = await this.userService.getUser(CURRENT_USER_KEY);
    request.user = user;

    return next.handle();
  }
}
