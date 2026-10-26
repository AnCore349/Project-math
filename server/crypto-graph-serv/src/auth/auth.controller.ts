import {
  BadRequestException,
  Body,
  Controller,
  Post,
  Res,
  HttpStatus,
  UseGuards,
  Req,
  Get,
  Put,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { LoginDto, RegisterDto } from './dto/auth.dto';
import { ValidationErrorObject } from '../common/objects/ValidationErrorObject';
import { AuthService } from './services/auth/auth.service';
import { Response } from 'express';
import { SuccessSessionResponseObject } from '../common/objects/SuccessSessionResponseObject';
import { AuthGuard } from './guards/auth.guard';
import { UserService } from '../user/services/user.service';
import { IRequestUser, IRequestWithUser } from '../common/interfaces';
import JwtRefreshGuard from './guards/jwt-refresh.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { JwtAccessDto } from './dto/jwtAccess.dto';

@ApiBearerAuth()
@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @Post('register')
  @ApiOperation({ summary: 'Create User' })
  @ApiResponse({ status: 403, description: 'Access denied .' })
  @ApiResponse({
    status: 400,
    description: 'Bad request error',
    type: ValidationErrorObject,
  })
  @ApiResponse({
    status: 200,
    description: 'Success registration',
    type: SuccessSessionResponseObject,
  })
  async register(
    @Body() body: RegisterDto,
    @Res() response: Response,
  ): Promise<Response> {
    const { receivedUser, accessToken, refreshToken } =
      await this.authService.register(body);
    //@
    // It's almost security variant.
    // response.cookie('Set-Cookie', refreshTokenCookie, { domain: '.crypto-graph.com', path: '/auth/' });
    //@
    return response
      .status(HttpStatus.OK)
      .cookie('tokenRefresh', refreshToken, { httpOnly: true })
      .json({ jwt: accessToken, email: receivedUser.email });
  }

  @Post('login')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Logged user.' })
  @ApiResponse({
    status: 400,
    description: 'Bad request error',
    type: ValidationErrorObject,
  })
  @ApiResponse({
    status: 200,
    description: 'Success login',
    type: SuccessSessionResponseObject,
  })
  async login(
    @Body() user: LoginDto,
    @Res() response: Response,
  ): Promise<Response> {
    const { LoggedUser, tokenRefresh } = await this.authService.login(user);
    const accessToken = this.authService.getJwtAccessToken(LoggedUser._id);
    if (!user) {
      throw new BadRequestException(['Register Error']);
    }
    //@
    // It's almost security variant.
    // response.cookie('Set-Cookie', refreshTokenCookie, { domain: '.crypto-graph.com', path: '/auth/' });
    //@
    return response
      .status(HttpStatus.OK)
      .cookie('tokenRefresh', tokenRefresh, { httpOnly: true })
      .json({ jwt: accessToken, nickName: LoggedUser.nickname });
  }

  @Get('refresh-tokens')
  @UseGuards(JwtRefreshGuard)
  async refresh(@Req() request: IRequestUser, @Res() response: Response) {
    try {
      // console.log('/auth/refresh-tokens', request.user.userId);
      const userForRefresh = await this.userService.findUser(
        request.user.userId,
      );
      const accessToken = this.authService.getJwtAccessToken(
        userForRefresh._id,
      );
      const refreshToken = this.authService.getCookieWithJwtRefreshToken(
        userForRefresh._id,
      );
      await this.authService.setCurrentRefreshToken(
        refreshToken,
        userForRefresh._id,
      );
      //@
      // It's almost security variant.
      // response.cookie('Set-Cookie', refreshToken, {httpOnly: true});
      //@
      return response
        .status(HttpStatus.OK)
        .cookie('tokenRefresh', refreshToken, { httpOnly: true })
        .json({ jwt: accessToken });
    } catch (err) {
      throw new BadRequestException(err);
    }
  }

  @Post('jwtAccess')
  @UseGuards(JwtAuthGuard)
  @ApiResponse({
    status: 400,
    description: 'Bad request error',
    type: ValidationErrorObject,
  })
  @ApiResponse({
    status: 200,
    description: 'Success login',
    type: SuccessSessionResponseObject,
  })
  getAccessWithJWT(
    @Body() body: JwtAccessDto,
    @Res() response: Response,
    @Req() request: IRequestWithUser,
  ) {
    return response
      .status(HttpStatus.OK)
      .json({ jwt: body.jwt, nickName: request.user.nickname });
  }

  @Put('logout')
  @UseGuards(JwtAuthGuard)
  @ApiResponse({
    status: 400,
    description: 'Bad request error',
    type: ValidationErrorObject,
  })
  @ApiResponse({
    status: 200,
    description: 'LogOut success',
    type: SuccessSessionResponseObject,
  })
  async logOutUser(
    @Req() request: IRequestWithUser,
    @Res() response: Response,
  ) {
    const resDel = await this.authService.deleteRefreshToken(request.user.id);
    return response
      .status(HttpStatus.OK)
      .clearCookie('tokenRefresh')
      .json({ resDel });
  }
  //Endpoint off *******************************************
  // @UseGuards(JwtAuthGuard)
  // @Post('get-user')
  // @ApiOperation({ summary: 'Logged user.' })
  // @ApiResponse({
  //   status: 400,
  //   description: 'Bad request error',
  //   type: ValidationErrorObject,
  // })
  // @ApiResponse({
  //   status: 200,
  //   description: 'Success login',
  //   type: SuccessSessionResponseObject,
  // })
  // async getUser(
  //   @Body() accesToken: string,
  //   @Res() response: Response,
  // ): Promise<any> {
  //   const result = await this.authService.getUser(accesToken);
  //   if (!result) {
  //     throw new BadRequestException(['Register Error']);
  //   }
  //   return response.status(HttpStatus.OK).json(result);
  // }
}
