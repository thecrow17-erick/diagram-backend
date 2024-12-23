import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class AuthTokenGuard implements CanActivate {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean>  {
    //saco el token del header
    const req = context.switchToHttp().getRequest<Request>();
    const token = req.headers['auth-token'];
    //pregunto si lo saque o si es un arreglo
    if (!token || Array.isArray(token))
      throw new UnauthorizedException('No hay token');

    return true;
  }
}
