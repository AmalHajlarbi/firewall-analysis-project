import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(JwtAuthGuard.name);

  /**
   * handleRequest is called by Passport after verifying the JWT.
   * It receives 3 arguments:
   * @param err – any error from Passport strategy
   * @param user – the validated user object (if valid)
   * @param info – additional info about validation failure
   */
  handleRequest(err: any, user: any, info: any) {
    // If Passport threw an internal error
    if (err) {
      this.logger.warn(`Authentication error: ${err.message}`);
      throw new UnauthorizedException('Authentication error');
    }

    // If token is expired or invalid, info usually contains details
    if (!user) {
      // Example content of info: { name: 'TokenExpiredError', message: 'jwt expired' }
      const message =
        info?.message === 'jwt expired'
          ? 'Session expired. Please login again.'
          : info?.message || 'Unauthorized access';

      this.logger.warn(`Unauthorized request: ${message}`);

      throw new UnauthorizedException(message);
    }

    // If we get here, user is valid — return it to be attached to request
    return user;
  }
}