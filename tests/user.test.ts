import { signIn } from '../src/handlers/user';
import prisma from '../src/db';
import * as auth from '../src/modules/auth';

jest.mock('../src/db', () => ({
  __esModule: true,
  default: {
    user: {
      findUnique: jest.fn()
    }
  }
}));

jest.mock('../src/modules/auth', () => ({
  __esModule: true,
  comparePassword: jest.fn(),
  createJWT: jest.fn(),
  hashedPassword: jest.fn()
}));

describe('signIn', () => {
  it('responds with 401 when user is missing', async () => {
    const req: any = { body: { username: 'test', password: 'pass' } };
    const res: any = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

    await signIn(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Invalid username or password' });
    expect(auth.comparePassword).not.toHaveBeenCalled();
  });
});
