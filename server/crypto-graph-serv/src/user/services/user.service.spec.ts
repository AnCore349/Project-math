import { NotFoundException } from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { UserDocument } from '../../auth/schemas/user-schema';
import { UserService } from './user.service';

const createQuery = (result: unknown) => ({
  select: jest.fn().mockReturnThis(),
  lean: jest.fn().mockReturnThis(),
  exec: jest.fn().mockResolvedValue(result),
});

describe('UserService favorites', () => {
  const userId = '507f1f77bcf86cd799439011';
  let userModel: {
    findById: jest.Mock;
    findByIdAndUpdate: jest.Mock;
  };
  let service: UserService;

  beforeEach(() => {
    userModel = {
      findById: jest.fn(),
      findByIdAndUpdate: jest.fn(),
    };
    service = new UserService(userModel as unknown as Model<UserDocument>);
  });

  it('returns an empty list when a user has no watchlist', async () => {
    const user = { _id: Types.ObjectId(userId), watchlist: undefined };
    userModel.findById.mockReturnValue(createQuery(user));

    await expect(service.getFavoriteList(userId)).resolves.toEqual({
      userId: user._id,
      watchlist: [],
    });
  });

  it('adds a favorite without duplicates and returns the updated list', async () => {
    const watchlist = ['bitcoin', 'ethereum'];
    userModel.findByIdAndUpdate.mockReturnValue(
      createQuery({ watchlist }),
    );

    await expect(service.setFavorite(userId, 'ethereum')).resolves.toEqual(
      watchlist,
    );
    expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith(
      Types.ObjectId(userId),
      { $addToSet: { watchlist: 'ethereum' } },
      { new: true },
    );
  });

  it('removes a favorite and returns the updated list', async () => {
    const watchlist = ['bitcoin'];
    userModel.findByIdAndUpdate.mockReturnValue(
      createQuery({ watchlist }),
    );

    await expect(
      service.deleteFavoriteCrypto(userId, 'ethereum'),
    ).resolves.toEqual(watchlist);
    expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith(
      Types.ObjectId(userId),
      { $pull: { watchlist: 'ethereum' } },
      { new: true },
    );
  });

  it('reports a missing user when reading favorites', async () => {
    userModel.findById.mockReturnValue(createQuery(null));

    await expect(service.getFavoriteList(userId)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('reports a missing user when updating favorites', async () => {
    userModel.findByIdAndUpdate.mockReturnValue(createQuery(null));

    await expect(service.setFavorite(userId, 'bitcoin')).rejects.toBeInstanceOf(
      NotFoundException,
    );
    await expect(
      service.deleteFavoriteCrypto(userId, 'bitcoin'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
