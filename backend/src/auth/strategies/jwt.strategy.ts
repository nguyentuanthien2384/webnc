import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';
import { UserStatus } from '../../users/schemas/user.schema';
import { Request } from 'express';

interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  tokenVersion?: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
      passReqToCallback: true,
    });
  }

  async validate(_req: Request, payload: JwtPayload) {
    const user = await this.usersService.findOneByEmail(payload.email);
    if (!user || String(user._id) !== String(payload.sub) || (user.tokenVersion ?? 0) !== (payload.tokenVersion ?? 0)) {
      throw new UnauthorizedException();
    }

    if (user.status === UserStatus.BLOCKED) {
      throw new UnauthorizedException('Tài khoản đã bị khóa');
    }

    return {
      userId: String(user._id),
      email: user.email,
      role: user.role,
    };
  }
}
