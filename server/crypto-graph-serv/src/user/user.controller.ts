import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ValidationErrorObject } from '../common/objects/ValidationErrorObject';
import { UserService } from './services/user.service';
import { IRequestWithUser } from '../common/interfaces';
import { FavoritesDto } from './dto/user.dto';
import { ValidationUserResponse } from '../common/objects/userResponse';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('/get-favorite')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get list favorite cryptocurrency.' })
  @ApiResponse({
    status: 400,
    description: 'Bad request error',
    type: ValidationErrorObject,
  })
  @ApiResponse({
    status: 200,
    description: 'The list favorite cryptocurrency - received!',
    type: Object, // TODO add interface.
  })
  async getFavorites(
    @Res() response: Response,
    @Req() request: IRequestWithUser,
  ): Promise<Response> {
    const favorites = await this.userService.getFavoriteList(request.user.id);
    return response.status(HttpStatus.OK).json(favorites);
  }

  @Post('/set-favorite')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Add favorite cryptocurrency.' })
  @ApiResponse({
    status: 400,
    description: 'Bad request error',
    type: ValidationErrorObject,
  })
  @ApiResponse({
    status: 200,
    description: 'The favorite cryptocurrency - added!',
    type: ValidationUserResponse,
  })
  async setFavorite(
    @Res() response: Response,
    @Req() request: IRequestWithUser,
    @Body() body: FavoritesDto,
  ): Promise<Response> {
    const favorites = await this.userService.setFavorite(request.user.id, body.cryptoName);
    return response.status(HttpStatus.OK).json(favorites);
  }

  @Delete('/delete-favorite')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Delete the favorite cryptocurrency.' })
  @ApiResponse({
    status: 400,
    description: 'Bad request error',
    type: ValidationErrorObject,
  })
  @ApiResponse({
    status: 200,
    description: 'The favorite cryptocurrency - deleted!',
    type: ValidationUserResponse,
  })
  async deleteFavorite(
    @Res() response: Response,
    @Req() request: IRequestWithUser,
    @Body() body: FavoritesDto,
  ): Promise<Response> {
    const favorites = await this.userService.deleteFavoriteCrypto(request.user.id, body.cryptoName);
    return response.status(HttpStatus.OK).json(favorites);
  }
}
