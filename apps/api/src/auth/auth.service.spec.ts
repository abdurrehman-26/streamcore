import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import bcrypt from 'bcryptjs';

jest.mock('bcryptjs');

describe('AuthService', () => {
  let service: AuthService;
  const mockUserService = {
    findUserByEmail: jest.fn(),
    createUser: jest.fn(),
  };
  const mockJwtService = {
    signAsync: jest.fn(),
  };
  const mockUser = {
    _id: '123',
    name: 'Test User',
    email: 'test@example.com',
    passwordHash: 'hashed123',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: mockUserService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('signUp', () => {
    it('should sign up a new user successfully', async () => {
      // Arrange: set up fake return values
      mockUserService.findUserByEmail.mockResolvedValueOnce(null); // no existing user
      (bcrypt.hash as jest.Mock).mockResolvedValueOnce('hashedPassword');
      mockUserService.createUser.mockResolvedValueOnce(mockUser);

      // Act: call the real function
      const result = await service.signUp(
        'Test User',
        'test@example.com',
        'password',
      );

      // Assert: check how mocks were called
      expect(mockUserService.findUserByEmail).toHaveBeenCalledWith(
        'test@example.com',
      );
      expect(bcrypt.hash).toHaveBeenCalledWith('password', 10);
      expect(mockUserService.createUser).toHaveBeenCalledWith(
        'Test User',
        'test@example.com',
        'hashedPassword',
      );
      expect(result).toEqual(mockUser);
    });

    it('should throw if user already exists', async () => {
      mockUserService.findUserByEmail.mockResolvedValueOnce(mockUser);

      await expect(
        service.signUp('Test User', 'test@example.com', 'password'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
  describe('signIn', () => {
    it('should sign in an existing user successfully', async () => {
      // Arrange: set up fake return values
      mockUserService.findUserByEmail.mockResolvedValueOnce(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(true);
      const fakeToken = 'fake-jwt-token';
      jest.spyOn(mockJwtService, 'signAsync').mockResolvedValueOnce(fakeToken);

      // Act: call the real function
      const result = await service.logIn('test@example.com', 'password');
      // Assert: check how mocks were called
      expect(mockUserService.findUserByEmail).toHaveBeenCalledWith(
        'test@example.com',
      );
      expect(bcrypt.compare).toHaveBeenCalledWith(
        'password',
        mockUser.passwordHash,
      );
      expect(result).toEqual({ access_token: fakeToken });
      expect(mockJwtService.signAsync).toHaveBeenCalledWith({
        userId: mockUser._id,
        email: mockUser.email,
      });
      expect(result).toEqual({ access_token: fakeToken });
    });
  });
});
