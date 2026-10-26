import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../../auth/schemas/user-schema';
import { Model, Types } from 'mongoose';
import { IUserList } from '../../common/interfaces';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async findByEmail(email: string): Promise<User> {
    try {
      return this.userModel.findOne({ email: email }).lean().exec();
    } catch (err) {
      throw new NotFoundException(err);
    }
  }

  async findUser(id: string): Promise<User> {
    try {
      return this.userModel.findById(Types.ObjectId(id)).lean().exec();
    } catch (err) {
      throw new NotFoundException(err);
    }
  }

  async getFavoriteList(id: string): Promise<IUserList> {
    const user = await this.userModel
      .findById(Types.ObjectId(id))
      .select('watchlist')
      .lean()
      .exec();
    if (!user) throw new NotFoundException('User not found');
    return { watchlist: user.watchlist ?? [], userId: user._id };
  }

  async setFavorite(id: string, cryptoFavorite: string): Promise<string[]> {
    const user = await this.userModel
      .findByIdAndUpdate(
        Types.ObjectId(id),
        { $addToSet: { watchlist: cryptoFavorite } },
        { new: true },
      )
      .select('watchlist')
      .lean()
      .exec();
    if (!user) throw new NotFoundException('User not found');
    return user.watchlist ?? [];
  }

  async deleteFavoriteCrypto(
    id: string,
    cryptoFavorite: string,
  ): Promise<string[]> {
    const user = await this.userModel
      .findByIdAndUpdate(
        Types.ObjectId(id),
        { $pull: { watchlist: cryptoFavorite } },
        { new: true },
      )
      .select('watchlist')
      .lean()
      .exec();
    if (!user) throw new NotFoundException('User not found');
    return user.watchlist ?? [];
  }
}
