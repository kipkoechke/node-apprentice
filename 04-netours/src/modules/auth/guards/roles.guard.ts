import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../../../common/decorators/roles.decorator';
import { Role } from '../../users/enums/role.enum';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Retrieve required roles from metadata
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(), // Check method-level metadata
      context.getClass(), // Check class-level metadata
    ]);

    // If no roles are required, allow access
    if (!requiredRoles) {
      return true;
    }
    // Extract the user object from the request
    const { user } = context.switchToHttp().getRequest();

    // Check if the user's role matches any of the required roles
    return requiredRoles.some((role) => user.role === role);
  }
}
