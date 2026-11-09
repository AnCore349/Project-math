import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';

@Injectable()
export class GoogleOAuthGuard extends AuthGuard('google') {
  getAuthenticateOptions(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<Request>();
    if (request.path !== '/auth/google/redirect') return {};
    return { state: request.query.state };
  }

  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<Request>();
    if (request.path === '/auth/google/callback') {
      const response = context.switchToHttp().getResponse<Response>();
      const expectedState = request.cookies?.oauthState;
      const receivedState = request.query.state;
      response.clearCookie('oauthState');
      if (
        !expectedState ||
        typeof receivedState !== 'string' ||
        expectedState !== receivedState
      ) {
        throw new UnauthorizedException('Invalid Google sign-in state.');
      }
    }
    return super.canActivate(context);
  }
}
