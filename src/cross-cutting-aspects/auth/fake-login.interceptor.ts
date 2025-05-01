/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from "@nestjs/common";
import { ownerUserId } from "helper/seed";
import { Observable } from "rxjs";
import { UserService } from "src/services/user/user.service";

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
    const user = await this.userService.getUser(ownerUserId);
    request.user = user;

    return next.handle();
  }
}
