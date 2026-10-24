import { Body, Controller, Post, Req, Res, UnauthorizedException } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import { AuthService, REFRESH_TTL_MS } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { SignupDto } from './dto/signup.dto';
import { Public } from './public.decorator';

const REFRESH_COOKIE = 'refresh_token';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  private setRefreshCookie(res: Response, token: string) {
    res.cookie(REFRESH_COOKIE, token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/auth',
      maxAge: REFRESH_TTL_MS,
    });
  }

  @Public()
  @Post('signup')
  signup(@Body() dto: SignupDto) {
    return this.authService.signup(dto);
  }

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post('login')
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const user = await this.authService.validate(dto.email, dto.password);
    const { accessToken, refreshToken, user: safeUser } =
      await this.authService.issueTokens(user);
    this.setRefreshCookie(res, refreshToken);
    return { accessToken, user: safeUser };
  }

  @Public()
  @Post('refresh')
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const raw = req.cookies?.[REFRESH_COOKIE];
    if (!raw) throw new UnauthorizedException('No refresh token');
    const { accessToken, refreshToken, user } = await this.authService.rotate(raw);
    this.setRefreshCookie(res, refreshToken);
    return { accessToken, user };
  }

  @Public()
  @Post('logout')
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const raw = req.cookies?.[REFRESH_COOKIE];
    if (raw) await this.authService.revoke(raw);
    res.clearCookie(REFRESH_COOKIE, { path: '/auth' });
    return { loggedOut: true };
  }
}