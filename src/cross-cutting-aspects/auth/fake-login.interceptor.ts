import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  UnauthorizedException,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { UserService } from "src/services/user/user.service";
import { resolveCurrentUser } from "./current-user";

@Injectable()
export class FakeLoginInterceptor implements NestInterceptor {
  constructor(private userService: UserService) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest<any>();

    /**
     * TODO: Wire up this hardcoded user from a jwt and an auth guard
     */
    const user = await this.userService.getUser(
      resolveCurrentUser(request as Request),
    );

    if (!user) {
      throw new UnauthorizedException("User not found hardcode a valid user");
    }

    request.user = user;

    return next.handle();
  }
}
