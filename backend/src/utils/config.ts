import dotenv from 'dotenv';

dotenv.config();

interface Config {
  nodeEnv: string;
  port: number;
  corsOrigins: string[];

  // Database
  databaseUrl: string;

  // Redis
  redisUrl: string;

  // API Keys
  alchemyApiKey: string;
  infuraApiKey: string;
  geminiApiKey: string;
  tenderlyApiKey: string;
  tenderlyAccountId: string;
  tenderlyProjectId: string;

  // Blockchain
  rpcUrls: {
    ethereum: string;
    arbitrum: string;
    polygon: string;
    optimism: string;
  };

  // Security
  jwtSecret: string;
  sessionSecret: string;
  encryptionKey: string;

  // AWS/KMS (for production key storage)
  awsRegion: string;
  awsAccessKeyId: string;
  awsSecretAccessKey: string;
  kmsKeyId: string;

  // Rate Limiting
  rateLimitWindowMs: number;
  rateLimitMaxRequests: number;

  // AI Agent
  aiPerceptionIntervalMs: number;
  aiMaxRetries: number;
  aiTimeout: number;

  // Logging
  logLevel: string;
  logFormat: string;

  // Feature Flags
  enableAutonomousMode: boolean;
  enableVoiceCommands: boolean;
  enableSimulation: boolean;

  // Limits
  maxGasPrice: number;
  maxDailySpend: number;
  maxTransactionValue: number;
}

function parseBoolean(value: string | undefined, defaultValue: boolean): boolean {
  if (!value) return defaultValue;
  return value.toLowerCase() === 'true';
}

function parseNumber(value: string | undefined, defaultValue: number): number {
  if (!value) return defaultValue;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
}

function parseArray(value: string | undefined, defaultValue: string[]): string[] {
  if (!value) return defaultValue;
  return value.split(',').map(item => item.trim()).filter(Boolean);
}

export const config: Config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseNumber(process.env.PORT, 3001),
  corsOrigins: parseArray(
    process.env.CORS_ORIGINS,
    ['http://localhost:3000', 'http://localhost:3001']
  ),

  // Database
  databaseUrl: process.env.DATABASE_URL || 'postgresql://localhost:5432/sentientwallet',

  // Redis
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',

  // API Keys
  alchemyApiKey: process.env.ALCHEMY_API_KEY || '',
  infuraApiKey: process.env.INFURA_API_KEY || '',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  tenderlyApiKey: process.env.TENDERLY_API_KEY || '',
  tenderlyAccountId: process.env.TENDERLY_ACCOUNT_ID || '',
  tenderlyProjectId: process.env.TENDERLY_PROJECT_ID || '',

  // Blockchain RPC URLs
  rpcUrls: {
    ethereum: process.env.RPC_ETHEREUM || `https://eth-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
    arbitrum: process.env.RPC_ARBITRUM || `https://arb-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
    polygon: process.env.RPC_POLYGON || `https://polygon-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
    optimism: process.env.RPC_OPTIMISM || `https://opt-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
  },

  // Security
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
  sessionSecret: process.env.SESSION_SECRET || 'your-session-secret-change-in-production',
  encryptionKey: process.env.ENCRYPTION_KEY || 'your-encryption-key-change-in-production',

  // AWS/KMS
  awsRegion: process.env.AWS_REGION || 'us-east-1',
  awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
  awsSecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  kmsKeyId: process.env.KMS_KEY_ID || '',

  // Rate Limiting
  rateLimitWindowMs: parseNumber(process.env.RATE_LIMIT_WINDOW_MS, 15 * 60 * 1000), // 15 minutes
  rateLimitMaxRequests: parseNumber(process.env.RATE_LIMIT_MAX_REQUESTS, 100),

  // AI Agent
  aiPerceptionIntervalMs: parseNumber(process.env.AI_PERCEPTION_INTERVAL_MS, 5 * 60 * 1000), // 5 minutes
  aiMaxRetries: parseNumber(process.env.AI_MAX_RETRIES, 3),
  aiTimeout: parseNumber(process.env.AI_TIMEOUT, 30000), // 30 seconds

  // Logging
  logLevel: process.env.LOG_LEVEL || 'info',
  logFormat: process.env.LOG_FORMAT || 'json',

  // Feature Flags
  enableAutonomousMode: parseBoolean(process.env.ENABLE_AUTONOMOUS_MODE, true),
  enableVoiceCommands: parseBoolean(process.env.ENABLE_VOICE_COMMANDS, true),
  enableSimulation: parseBoolean(process.env.ENABLE_SIMULATION, true),

  // Limits
  maxGasPrice: parseNumber(process.env.MAX_GAS_PRICE, 100), // 100 Gwei
  maxDailySpend: parseNumber(process.env.MAX_DAILY_SPEND, 10000), // $10,000
  maxTransactionValue: parseNumber(process.env.MAX_TRANSACTION_VALUE, 50000), // $50,000
};

// Validate required configuration
export function validateConfig(): void {
  const requiredFields: (keyof Config)[] = [
    'databaseUrl',
    'jwtSecret',
  ];

  const missingFields = requiredFields.filter(field => !config[field]);

  if (missingFields.length > 0) {
    throw new Error(
      `Missing required configuration: ${missingFields.join(', ')}`
    );
  }

  // Warn about missing optional but important fields
  const warnings: string[] = [];

  if (!config.alchemyApiKey && !config.infuraApiKey) {
    warnings.push('No blockchain RPC API key configured (ALCHEMY_API_KEY or INFURA_API_KEY)');
  }

  if (!config.geminiApiKey) {
    warnings.push('No Gemini API key configured (GEMINI_API_KEY) - AI features will not work');
  }

  if (!config.tenderlyApiKey) {
    warnings.push('No Tenderly API key configured (TENDERLY_API_KEY) - transaction simulation disabled');
  }

  if (config.nodeEnv === 'production') {
    if (config.jwtSecret === 'your-secret-key-change-in-production') {
      throw new Error('JWT_SECRET must be changed in production!');
    }

    if (config.sessionSecret === 'your-session-secret-change-in-production') {
      throw new Error('SESSION_SECRET must be changed in production!');
    }

    if (config.encryptionKey === 'your-encryption-key-change-in-production') {
      throw new Error('ENCRYPTION_KEY must be changed in production!');
    }

    if (!config.awsAccessKeyId || !config.kmsKeyId) {
      warnings.push('AWS KMS not configured - session keys will be stored insecurely');
    }
  }

  if (warnings.length > 0) {
    console.warn('Configuration warnings:');
    warnings.forEach(warning => console.warn(`  - ${warning}`));
  }
}

// Export helper to check if running in production
export const isProduction = config.nodeEnv === 'production';
export const isDevelopment = config.nodeEnv === 'development';
export const isTest = config.nodeEnv === 'test';
