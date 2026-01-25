import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getModelToken } from '@nestjs/mongoose';
import { User } from '../schemas/user.schema';

describe('UsersService', () => {
  let service: UsersService;

  const mockUser = {
    _id: '123',
    name: 'Test User',
    email: 'test@example.com',
    passwordHash: 'hashed123',
  };

  const mockUserModel = {
    findOne: jest.fn().mockReturnThis(),
    exec: jest.fn(),
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getModelToken(User.name), // or User.name
          useValue: mockUserModel, // <-- mock Mongoose model
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findUserByEmail', () => {
    it('should call findOne with correct email and return a user', async () => {
      // Arrange
      mockUserModel.exec.mockResolvedValueOnce(mockUser);

      // Act
      const result = await service.findUserByEmail('test@example.com');

      // Assert
      expect(mockUserModel.findOne).toHaveBeenCalledWith({
        email: 'test@example.com',
      });
      expect(result).toEqual(mockUser);
    });

    it('should return null if user not found', async () => {
      mockUserModel.exec.mockResolvedValueOnce(null);

      const result = await service.findUserByEmail('missing@example.com');

      expect(mockUserModel.findOne).toHaveBeenCalledWith({
        email: 'missing@example.com',
      });
      expect(result).toBeNull();
    });
  });

  describe('createUser', () => {
    it('should call create with correct arguments and return created user', async () => {
      mockUserModel.create.mockResolvedValueOnce(mockUser);

      const result = await service.createUser(
        'Test User',
        'test@example.com',
        'hashed123',
      );

      expect(mockUserModel.create).toHaveBeenCalledWith({
        name: 'Test User',
        email: 'test@example.com',
        passwordHash: 'hashed123',
      });
      expect(result).toEqual(mockUser);
    });
  });
});
