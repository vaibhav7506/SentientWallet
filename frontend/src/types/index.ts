// Core Agent Types
export interface AgentAction {
  id: string;
  timestamp: number;
  thought_process: string;
  action_type: 'SWAP' | 'STAKE' | 'UNSTAKE' | 'WAIT' | 'HARVEST' | 'REBALANCE';
  data: {
    token_in?: string;
    token_out?: string;
    amount?: string;
    protocol?: string;
    pool_id?: string;
    from_protocol?: string;
    to_protocol?: string;
  };
  confidence_score: number;
  requires_approval: boolean;
  status: 'pending' | 'approved' | 'rejected' | 'executing' | 'completed' | 'failed';
  simulation_result?: SimulationResult;
  transaction_hash?: string;
  error_message?: string;
}

export interface SimulationResult {
  success: boolean;
  gas_estimate: string;
  output_amount?: string;
  slippage?: number;
  error?: string;
  revert_reason?: string;
}

export interface ReasoningCard {
  id: string;
  timestamp: number;
  title: string;
  description: string;
  confidence_score: number;
  status: 'thinking' | 'analyzing' | 'simulating' | 'completed' | 'failed';
  logs: AgentLog[];
  action?: AgentAction;
  expanded: boolean;
}

export interface AgentLog {
  timestamp: number;
  level: 'info' | 'warning' | 'error' | 'success';
  message: string;
  data?: any;
}

// User Settings Types
export interface UserSettings {
  user_id: string;
  wallet_address: string;
  autonomous_mode: boolean;
  daily_spend_limit: number;
  max_gas_price: number; // in Gwei
  whitelist: ProtocolWhitelist[];
  blacklist: string[];
  notification_preferences: NotificationPreferences;
  risk_tolerance: 'conservative' | 'moderate' | 'aggressive';
  target_apy: number;
  max_drawdown: number;
}

export interface ProtocolWhitelist {
  protocol: string;
  name: string;
  logo: string;
  enabled: boolean;
  contract_addresses: string[];
  chains: number[];
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  websocket: boolean;
  threshold_amount: number;
}

// Portfolio Types
export interface Portfolio {
  total_value_usd: number;
  assets: Asset[];
  positions: Position[];
  performance: PerformanceMetrics;
  last_updated: number;
}

export interface Asset {
  token_address: string;
  symbol: string;
  name: string;
  balance: string;
  decimals: number;
  price_usd: number;
  value_usd: number;
  logo: string;
  chain_id: number;
}

export interface Position {
  protocol: string;
  protocol_logo: string;
  type: 'lending' | 'liquidity' | 'staking' | 'farming';
  token_symbol: string;
  amount: string;
  value_usd: number;
  apy: number;
  claimable_rewards: ClaimableReward[];
  entry_price: number;
  current_price: number;
  pnl_usd: number;
  pnl_percentage: number;
  chain_id: number;
}

export interface ClaimableReward {
  token_symbol: string;
  amount: string;
  value_usd: number;
}

export interface PerformanceMetrics {
  daily_pnl: number;
  weekly_pnl: number;
  monthly_pnl: number;
  total_pnl: number;
  current_apy: number;
  current_drawdown: number;
  sharpe_ratio: number;
  win_rate: number;
  total_transactions: number;
  successful_transactions: number;
  failed_transactions: number;
}

// Market Data Types
export interface YieldOpportunity {
  protocol: string;
  protocol_logo: string;
  pool_id: string;
  pool_name: string;
  apy: number;
  tvl_usd: number;
  tokens: string[];
  chain_id: number;
  risk_score: number;
  category: 'stablecoin' | 'blue-chip' | 'exotic';
}

export interface MarketSentiment {
  timestamp: number;
  overall_score: number; // -100 to 100
  fear_greed_index: number;
  trending_topics: string[];
  protocol_alerts: ProtocolAlert[];
  gas_price_gwei: number;
  eth_price_usd: number;
}

export interface ProtocolAlert {
  protocol: string;
  severity: 'info' | 'warning' | 'critical';
  message: string;
  timestamp: number;
  source: string;
}

// WebSocket Types
export interface WebSocketMessage {
  type: 'agent_action' | 'log_update' | 'portfolio_update' | 'notification' | 'approval_request' | 'transaction_update';
  payload: any;
  timestamp: number;
}

export interface ApprovalRequest {
  action_id: string;
  action: AgentAction;
  expires_at: number;
}

// Strategy Types
export interface Strategy {
  id: string;
  name: string;
  description: string;
  type: 'yield_farming' | 'arbitrage' | 'rebalancing' | 'risk_management';
  enabled: boolean;
  parameters: StrategyParameters;
  performance: StrategyPerformance;
  status: 'active' | 'paused' | 'stopped';
}

export interface StrategyParameters {
  target_apy?: number;
  max_drawdown?: number;
  rebalance_threshold?: number;
  min_liquidity?: number;
  max_slippage?: number;
  preferred_protocols?: string[];
  [key: string]: any;
}

export interface StrategyPerformance {
  total_profit_usd: number;
  total_profit_percentage: number;
  trades_executed: number;
  success_rate: number;
  avg_apy: number;
  max_drawdown_hit: number;
  created_at: number;
  last_execution: number;
}

// Asset Orb Health Types
export type OrbHealthStatus = 'excellent' | 'good' | 'warning' | 'critical' | 'emergency';

export interface OrbHealth {
  status: OrbHealthStatus;
  score: number; // 0-100
  factors: {
    portfolio_balance: number;
    risk_level: number;
    apy_performance: number;
    gas_efficiency: number;
    drawdown_level: number;
  };
  color: string;
  pulse_speed: number;
}

// Transaction Types
export interface Transaction {
  id: string;
  hash: string;
  type: 'swap' | 'stake' | 'unstake' | 'harvest' | 'approve';
  status: 'pending' | 'confirmed' | 'failed';
  from_token?: string;
  to_token?: string;
  amount_in?: string;
  amount_out?: string;
  protocol: string;
  gas_used?: string;
  gas_price?: string;
  timestamp: number;
  block_number?: number;
  chain_id: number;
  initiated_by: 'user' | 'agent';
}

// Command Bar Types
export interface QuickAction {
  id: string;
  label: string;
  icon: string;
  description: string;
  action: () => void;
  enabled: boolean;
}

export interface VoiceCommand {
  transcript: string;
  confidence: number;
  timestamp: number;
  action?: string;
  parameters?: any;
}

// Protocol Types
export interface Protocol {
  id: string;
  name: string;
  logo: string;
  description: string;
  chains: number[];
  categories: string[];
  tvl_usd: number;
  website: string;
  contracts: Record<number, string[]>; // chainId -> contract addresses
}

// Chart Data Types
export interface ChartDataPoint {
  timestamp: number;
  value: number;
  label?: string;
}

export interface PortfolioChartData {
  portfolio_value: ChartDataPoint[];
  apy_history: ChartDataPoint[];
  pnl_history: ChartDataPoint[];
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: number;
}

export interface PaginatedResponse<T = any> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

// Wallet Types
export interface WalletConfig {
  address: string;
  chain_id: number;
  safe_address?: string;
  session_key?: string;
  permissions: WalletPermissions;
}

export interface WalletPermissions {
  can_execute_autonomous: boolean;
  max_transaction_value: number;
  allowed_protocols: string[];
  allowed_tokens: string[];
  daily_limit: number;
  daily_spent: number;
  last_reset: number;
}

// Notification Types
export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'approval';
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  action?: NotificationAction;
}

export interface NotificationAction {
  label: string;
  handler: () => void;
}

// Error Types
export interface AppError {
  code: string;
  message: string;
  details?: any;
  timestamp: number;
  recoverable: boolean;
}

// Filter and Sort Types
export type SortDirection = 'asc' | 'desc';

export interface TableFilter {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains';
  value: any;
}

export interface TableSort {
  field: string;
  direction: SortDirection;
}

// Theme Types
export type ThemeMode = 'light' | 'dark' | 'auto';

export interface ThemeConfig {
  mode: ThemeMode;
  primaryColor: string;
  accentColor: string;
  enableGlassEffect: boolean;
  enableAnimations: boolean;
}
