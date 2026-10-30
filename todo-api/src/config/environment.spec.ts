import { validateEnvironment } from './environment';

const validEnvironment = {
  DB_HOST: 'localhost',
  DB_PORT: '5432',
  DB_USER: 'postgres',
  DB_PASSWORD: 'password',
  DB_NAME: 'todo',
  JWT_SECRET: 'a-random-secret-that-is-at-least-32-bytes',
};

describe('validateEnvironment', () => {
  it('validates required settings and applies optional defaults', () => {
    expect(validateEnvironment(validEnvironment)).toMatchObject({
      DB_PORT: 5432,
      JWT_EXPIRES_IN_SECONDS: 900,
      PORT: 3001,
    });
  });

  it.each([
    ['DB_PORT', '0'],
    ['DB_PORT', 'not-a-port'],
    ['PORT', '65536'],
    ['JWT_EXPIRES_IN_SECONDS', '-1'],
    ['JWT_EXPIRES_IN_SECONDS', '1.5'],
    ['JWT_SECRET', 'short'],
    ['DB_PASSWORD', '   '],
  ])('rejects invalid %s', (name, value) => {
    expect(() =>
      validateEnvironment({ ...validEnvironment, [name]: value }),
    ).toThrow(`Environment variable ${name}`);
  });

  it.each([
    'DB_HOST',
    'DB_PORT',
    'DB_USER',
    'DB_PASSWORD',
    'DB_NAME',
    'JWT_SECRET',
  ])('requires %s', (name) => {
    const environment: Record<string, string> = { ...validEnvironment };
    delete environment[name];

    expect(() => validateEnvironment(environment)).toThrow(
      `Environment variable ${name}`,
    );
  });
});
