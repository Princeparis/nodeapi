import { hashedPassword, comparePassword } from '../src/modules/auth';

describe('auth module', () => {
  it('hashes and validates password', async () => {
    const password = 'secret';
    const hash = await hashedPassword(password);
    expect(hash).not.toBe(password);
    const isValid = await comparePassword(password, hash);
    expect(isValid).toBe(true);
  });
});
