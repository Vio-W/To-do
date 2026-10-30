export interface EnvironmentConfig {
  DB_HOST: string;
  DB_PORT: number;
  DB_USER: string;
  DB_PASSWORD: string;
  DB_NAME: string;
  JWT_SECRET: string;
  JWT_EXPIRES_IN_SECONDS: number;
  PORT: number;
}

export function validateEnvironment(
  config: Record<string, unknown>,
): Record<string, unknown> & EnvironmentConfig {
  const requiredString = (name: string) => {
    const value = config[name];
    if (typeof value !== 'string' || value.trim().length === 0) {
      throw new Error(
        `Environment variable ${name} must be a non-empty string`,
      );
    }
    return value;
  };

  const positiveInteger = (name: string, defaultValue?: number) => {
    const value = config[name];
    if (value === undefined && defaultValue !== undefined) return defaultValue;
    if (typeof value !== 'string' || !/^[1-9]\d*$/.test(value)) {
      throw new Error(
        `Environment variable ${name} must be a positive integer`,
      );
    }
    const parsed = Number(value);
    if (
      !Number.isSafeInteger(parsed) ||
      (parsed > 65535 && name !== 'JWT_EXPIRES_IN_SECONDS')
    ) {
      throw new Error(
        `Environment variable ${name} is outside the supported range`,
      );
    }
    return parsed;
  };

  const jwtSecret = requiredString('JWT_SECRET');
  if (Buffer.byteLength(jwtSecret, 'utf8') < 32) {
    throw new Error(
      'Environment variable JWT_SECRET must be at least 32 bytes',
    );
  }

  return {
    ...config,
    DB_HOST: requiredString('DB_HOST'),
    DB_PORT: positiveInteger('DB_PORT'),
    DB_USER: requiredString('DB_USER'),
    DB_PASSWORD: requiredString('DB_PASSWORD'),
    DB_NAME: requiredString('DB_NAME'),
    JWT_SECRET: jwtSecret,
    JWT_EXPIRES_IN_SECONDS: positiveInteger('JWT_EXPIRES_IN_SECONDS', 900),
    PORT: positiveInteger('PORT', 3001),
  };
}
