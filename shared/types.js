/**
 * Shared event types between server and client
 * Based on Oh My Opencode's Agent collaboration system
 */

// Agent Types
export const AGENT_TYPES = {
  // Primary Orchestrators
  SISYPHUS: 'sisyphus',
  ATLAS: 'atlas',
  
  // Planning Triad
  PROMETHEUS: 'prometheus',
  METIS: 'metis',
  MOMUS: 'momus',
  
  // Specialized Agents
  ORACLE: 'oracle',
  LIBRARIAN: 'librarian',
  EXPLORE: 'explore',
  HEPHAESTUS: 'hephaestus',
  
  // Junior Variants
  SISYPHUS_JUNIOR: 'sisyphus-junior'
};

// Agent Categories for Delegation
export const AGENT_CATEGORIES = {
  VISUAL_ENGINEERING: 'visual-engineering',
  ULTRABRAIN: 'ultrabrain',
  DEEP: 'deep',
  ARTISTRY: 'artistry',
  QUICK: 'quick',
  UNSPECIFIED_LOW: 'unspecified-low',
  UNSPECIFIED_HIGH: 'unspecified-high',
  WRITING: 'writing'
};

// Agent Display Information
export const AGENT_INFO = {
  [AGENT_TYPES.SISYPHUS]: {
    name: 'Sisyphus',
    title: 'Primary Orchestrator',
    description: 'Main coordinator for user requests',
    color: 0x3b82f6, // Blue
    icon: '🎯',
    cost: 'EXPENSIVE'
  },
  [AGENT_TYPES.ATLAS]: {
    name: 'Atlas',
    title: 'Master Orchestrator',
    description: 'High-level workflow coordination',
    color: 0x8b5cf6, // Purple
    icon: '🗺️',
    cost: 'EXPENSIVE'
  },
  [AGENT_TYPES.PROMETHEUS]: {
    name: 'Prometheus',
    title: 'Plan Builder',
    description: 'Creates detailed work plans',
    color: 0xf59e0b, // Amber
    icon: '📋',
    cost: 'EXPENSIVE'
  },
  [AGENT_TYPES.METIS]: {
    name: 'Metis',
    title: 'Plan Consultant',
    description: 'Pre-planning analysis and risk detection',
    color: 0x10b981, // Emerald
    icon: '🔍',
    cost: 'EXPENSIVE'
  },
  [AGENT_TYPES.MOMUS]: {
    name: 'Momus',
    title: 'Plan Critic',
    description: 'Reviews plans for completeness',
    color: 0xef4444, // Red
    icon: '✓',
    cost: 'EXPENSIVE'
  },
  [AGENT_TYPES.ORACLE]: {
    name: 'Oracle',
    title: 'Strategic Advisor',
    description: 'Architecture and complex debugging',
    color: 0x6366f1, // Indigo
    icon: '🔮',
    cost: 'EXPENSIVE'
  },
  [AGENT_TYPES.LIBRARIAN]: {
    name: 'Librarian',
    title: 'Documentation Research',
    description: 'External docs and API research',
    color: 0x14b8a6, // Teal
    icon: '📚',
    cost: 'CHEAP'
  },
  [AGENT_TYPES.EXPLORE]: {
    name: 'Explore',
    title: 'Contextual Search',
    description: 'Codebase patterns and structure',
    color: 0x22d3ee, // Cyan
    icon: '🔎',
    cost: 'FREE'
  },
  [AGENT_TYPES.HEPHAESTUS]: {
    name: 'Hephaestus',
    title: 'Deep Worker',
    description: 'Autonomous deep execution',
    color: 0xf97316, // Orange
    icon: '⚒️',
    cost: 'EXPENSIVE'
  }
};

// Event Types
export const EVENT_TYPES = {
  // Agent Lifecycle
  AGENT_SPAWN: 'agent_spawn',
  AGENT_START: 'agent_start',
  AGENT_COMPLETE: 'agent_complete',
  AGENT_ERROR: 'agent_error',
  
  // Agent Actions
  AGENT_ACTION: 'agent_action',
  AGENT_THINKING: 'agent_thinking',
  AGENT_DELEGATE: 'agent_delegate',
  
  // Tool Usage
  TOOL_START: 'tool_start',
  TOOL_COMPLETE: 'tool_complete',
  TOOL_ERROR: 'tool_error',
  
  // Session Events
  SESSION_START: 'session_start',
  SESSION_END: 'session_end',
  
  // Background Tasks
  BACKGROUND_START: 'background_start',
  BACKGROUND_COMPLETE: 'background_complete',
  
  // Communication
  MESSAGE: 'message',
  SYSTEM: 'system'
};

// Action Types (for display purposes)
export const ACTION_TYPES = {
  // Research Actions
  SEARCH_CODEBASE: { icon: '🔎', label: '搜索代码库', category: 'research' },
  SEARCH_DOCUMENTATION: { icon: '📚', label: '查询文档', category: 'research' },
  ANALYZE_ARCHITECTURE: { icon: '🏗️', label: '分析架构', category: 'research' },
  
  // Planning Actions
  CREATE_PLAN: { icon: '📝', label: '制定计划', category: 'planning' },
  REVIEW_PLAN: { icon: '👁️', label: '评审计划', category: 'planning' },
  CONSULT_STRATEGY: { icon: '🎯', label: '咨询策略', category: 'planning' },
  
  // Implementation Actions
  WRITE_CODE: { icon: '✏️', label: '编写代码', category: 'implementation' },
  EDIT_FILE: { icon: '📄', label: '编辑文件', category: 'implementation' },
  REFACTOR: { icon: '🔄', label: '重构代码', category: 'implementation' },
  
  // Execution Actions
  RUN_TESTS: { icon: '🧪', label: '运行测试', category: 'execution' },
  BUILD_PROJECT: { icon: '🔨', label: '构建项目', category: 'execution' },
  DEPLOY: { icon: '🚀', label: '部署应用', category: 'execution' },
  
  // Delegation Actions
  DELEGATE_TASK: { icon: '↗️', label: '委托任务', category: 'delegation' },
  SPAWN_AGENT: { icon: '👤', label: '创建Agent', category: 'delegation' },
  
  // Communication Actions
  SEND_MESSAGE: { icon: '💬', label: '发送消息', category: 'communication' }
};

// Default export for compatibility
export default {
  AGENT_TYPES,
  AGENT_CATEGORIES,
  AGENT_INFO,
  EVENT_TYPES,
  ACTION_TYPES
};
