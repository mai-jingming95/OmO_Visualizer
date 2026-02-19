import { WebSocketServer } from 'ws';
import { createServer } from 'http';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import {
  AGENT_TYPES,
  AGENT_CATEGORIES,
  EVENT_TYPES,
  ACTION_TYPES
} from '../shared/types.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 4004;

// HTTP Server for serving static files
const server = createServer((req, res) => {
  const publicPath = join(__dirname, '../public');
  const rootPath = join(__dirname, '..');
  
  // Handle /shared/ paths
  let filePath;
  if (req.url.startsWith('/shared/')) {
    filePath = join(rootPath, req.url);
  } else {
    filePath = join(publicPath, req.url === '/' ? 'index.html' : req.url);
  }
  
  try {
    const content = readFileSync(filePath);
    const ext = filePath.split('.').pop();
    const contentType = {
      'html': 'text/html',
      'js': 'application/javascript',
      'css': 'text/css',
      'json': 'application/json'
    }[ext] || 'text/plain';
    
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content);
  } catch (e) {
    console.error('File not found:', filePath);
    res.writeHead(404);
    res.end('Not found');
  }
});

// WebSocket Server
const wss = new WebSocketServer({ server });

// Store active connections and sessions
const clients = new Set();
const sessions = new Map();
const agents = new Map();

// Generate unique IDs
const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Broadcast event to all clients
function broadcast(event) {
  const message = JSON.stringify(event);
  clients.forEach(client => {
    if (client.readyState === 1) {
      client.send(message);
    }
  });
}

// Simulate realistic Agent collaboration scenarios
class AgentCollaborationSimulator {
  constructor() {
    this.activeAgents = new Map();
    this.scenarios = [
      this.simulateFeatureImplementation.bind(this),
      this.simulateBugFix.bind(this),
      this.simulateRefactoring.bind(this),
      this.simulateArchitectureDecision.bind(this)
    ];
  }

  async start() {
    console.log('🎬 Agent Collaboration Simulator started');
    
    // Run scenarios continuously
    while (true) {
      const scenario = this.scenarios[Math.floor(Math.random() * this.scenarios.length)];
      await scenario();
      await this.delay(5000 + Math.random() * 10000);
    }
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  emitAgentSpawn(agentType, description, parentId = null) {
    const id = generateId();
    const event = {
      type: EVENT_TYPES.AGENT_SPAWN,
      timestamp: Date.now(),
      data: {
        id,
        agentType,
        description,
        parentId,
        info: this.getAgentInfo(agentType)
      }
    };
    broadcast(event);
    this.activeAgents.set(id, { type: agentType, startTime: Date.now() });
    return id;
  }

  emitAgentAction(agentId, actionType, details = {}) {
    const event = {
      type: EVENT_TYPES.AGENT_ACTION,
      timestamp: Date.now(),
      data: {
        agentId,
        action: actionType,
        details
      }
    };
    broadcast(event);
  }

  emitAgentComplete(agentId, result = {}) {
    const event = {
      type: EVENT_TYPES.AGENT_COMPLETE,
      timestamp: Date.now(),
      data: {
        agentId,
        result,
        duration: Date.now() - (this.activeAgents.get(agentId)?.startTime || Date.now())
      }
    };
    broadcast(event);
    this.activeAgents.delete(agentId);
  }

  emitToolUse(agentId, toolName, params = {}) {
    const event = {
      type: EVENT_TYPES.TOOL_START,
      timestamp: Date.now(),
      data: {
        agentId,
        tool: toolName,
        params
      }
    };
    broadcast(event);
  }

  getAgentInfo(agentType) {
    const info = {
      [AGENT_TYPES.SISYPHUS]: {
        name: 'Sisyphus',
        title: 'Primary Orchestrator',
        color: '#3b82f6',
        icon: '🎯'
      },
      [AGENT_TYPES.METIS]: {
        name: 'Metis',
        title: 'Plan Consultant',
        color: '#10b981',
        icon: '🔍'
      },
      [AGENT_TYPES.PROMETHEUS]: {
        name: 'Prometheus',
        title: 'Plan Builder',
        color: '#f59e0b',
        icon: '📋'
      },
      [AGENT_TYPES.ORACLE]: {
        name: 'Oracle',
        title: 'Strategic Advisor',
        color: '#6366f1',
        icon: '🔮'
      },
      [AGENT_TYPES.EXPLORE]: {
        name: 'Explore',
        title: 'Contextual Search',
        color: '#22d3ee',
        icon: '🔎'
      },
      [AGENT_TYPES.LIBRARIAN]: {
        name: 'Librarian',
        title: 'Documentation Research',
        color: '#14b8a6',
        icon: '📚'
      }
    };
    return info[agentType] || { name: agentType, title: 'Agent', color: '#888', icon: '🤖' };
  }

  // Scenario 1: Feature Implementation
  async simulateFeatureImplementation() {
    console.log('🎭 Scenario: Feature Implementation');
    
    // Sisyphus spawns
    const sisyphusId = this.emitAgentSpawn(AGENT_TYPES.SISYPHUS, 'Implement user authentication');
    await this.delay(1000);
    
    // Sisyphus delegates to Metis for planning
    this.emitAgentAction(sisyphusId, 'CONSULT_STRATEGY', { topic: 'auth implementation' });
    const metisId = this.emitAgentSpawn(AGENT_TYPES.METIS, 'Analyze auth requirements', sisyphusId);
    await this.delay(1500);
    
    // Metis spawns explore agents
    this.emitAgentAction(metisId, 'SEARCH_CODEBASE', { query: 'auth patterns' });
    const explore1Id = this.emitAgentSpawn(AGENT_TYPES.EXPLORE, 'Find auth implementations', metisId);
    await this.delay(2000);
    this.emitAgentComplete(explore1Id, { files: ['src/auth.ts', 'src/middleware.ts'] });
    
    this.emitAgentAction(metisId, 'SEARCH_DOCUMENTATION', { topic: 'JWT best practices' });
    const librarianId = this.emitAgentSpawn(AGENT_TYPES.LIBRARIAN, 'Research JWT security', metisId);
    await this.delay(2500);
    this.emitAgentComplete(librarianId, { findings: 'OWASP guidelines' });
    
    await this.delay(1000);
    this.emitAgentComplete(metisId, { recommendation: 'Use httpOnly cookies' });
    
    // Sisyphus delegates to Prometheus for planning
    this.emitAgentAction(sisyphusId, 'CREATE_PLAN', { scope: 'auth feature' });
    const prometheusId = this.emitAgentSpawn(AGENT_TYPES.PROMETHEUS, 'Create auth implementation plan', sisyphusId);
    await this.delay(3000);
    this.emitAgentComplete(prometheusId, { plan: '4-step implementation' });
    
    // Implementation phase
    this.emitAgentAction(sisyphusId, 'WRITE_CODE', { file: 'src/auth.ts' });
    await this.delay(2000);
    
    this.emitAgentAction(sisyphusId, 'EDIT_FILE', { file: 'src/middleware.ts' });
    await this.delay(1500);
    
    this.emitAgentAction(sisyphusId, 'RUN_TESTS', { suite: 'auth' });
    await this.delay(2000);
    
    this.emitAgentComplete(sisyphusId, { status: 'completed', tests: 'passed' });
  }

  // Scenario 2: Bug Fix
  async simulateBugFix() {
    console.log('🎭 Scenario: Bug Fix');
    
    const sisyphusId = this.emitAgentSpawn(AGENT_TYPES.SISYPHUS, 'Fix race condition in data sync');
    await this.delay(800);
    
    // Consult Oracle for complex bug
    this.emitAgentAction(sisyphusId, 'ANALYZE_ARCHITECTURE', { issue: 'race condition' });
    const oracleId = this.emitAgentSpawn(AGENT_TYPES.ORACLE, 'Debug race condition', sisyphusId);
    await this.delay(3000);
    
    // Oracle spawns explores
    const exploreId = this.emitAgentSpawn(AGENT_TYPES.EXPLORE, 'Find async patterns', oracleId);
    await this.delay(2000);
    this.emitAgentComplete(exploreId, { patterns: ['Promise.all', 'async/await'] });
    
    this.emitAgentComplete(oracleId, { diagnosis: 'Missing await in cleanup' });
    
    // Fix implementation
    this.emitAgentAction(sisyphusId, 'EDIT_FILE', { file: 'src/sync.ts', change: 'Add await' });
    await this.delay(1500);
    
    this.emitAgentAction(sisyphusId, 'RUN_TESTS', { suite: 'sync' });
    await this.delay(2000);
    
    this.emitAgentComplete(sisyphusId, { status: 'fixed', tests: 'passed' });
  }

  // Scenario 3: Refactoring
  async simulateRefactoring() {
    console.log('🎭 Scenario: Code Refactoring');
    
    const sisyphusId = this.emitAgentSpawn(AGENT_TYPES.SISYPHUS, 'Refactor API endpoints');
    await this.delay(1000);
    
    // Multiple parallel explores
    this.emitAgentAction(sisyphusId, 'SEARCH_CODEBASE', { query: 'API handlers' });
    const explore1 = this.emitAgentSpawn(AGENT_TYPES.EXPLORE, 'Find REST patterns', sisyphusId);
    const explore2 = this.emitAgentSpawn(AGENT_TYPES.EXPLORE, 'Find error handling', sisyphusId);
    
    await this.delay(2000);
    this.emitAgentComplete(explore1, { patterns: ['Controller pattern'] });
    this.emitAgentComplete(explore2, { patterns: ['Global error middleware'] });
    
    // Refactoring
    this.emitAgentAction(sisyphusId, 'REFACTOR', { scope: 'API layer' });
    await this.delay(2500);
    
    this.emitAgentAction(sisyphusId, 'BUILD_PROJECT', {});
    await this.delay(2000);
    
    this.emitAgentComplete(sisyphusId, { status: 'refactored', files: 12 });
  }

  // Scenario 4: Architecture Decision
  async simulateArchitectureDecision() {
    console.log('🎭 Scenario: Architecture Decision');
    
    const sisyphusId = this.emitAgentSpawn(AGENT_TYPES.SISYPHUS, 'Design caching strategy');
    await this.delay(800);
    
    // Heavy Oracle consultation
    this.emitAgentAction(sisyphusId, 'CONSULT_STRATEGY', { topic: 'caching architecture' });
    const oracleId = this.emitAgentSpawn(AGENT_TYPES.ORACLE, 'Design caching architecture', sisyphusId);
    await this.delay(1500);
    
    // Parallel research
    const lib1 = this.emitAgentSpawn(AGENT_TYPES.LIBRARIAN, 'Research Redis patterns', oracleId);
    const lib2 = this.emitAgentSpawn(AGENT_TYPES.LIBRARIAN, 'Research CDN caching', oracleId);
    const explore = this.emitAgentSpawn(AGENT_TYPES.EXPLORE, 'Find existing cache usage', oracleId);
    
    await this.delay(2500);
    this.emitAgentComplete(lib1, { solution: 'Redis with TTL' });
    this.emitAgentComplete(lib2, { solution: 'CloudFront' });
    this.emitAgentComplete(explore, { current: 'In-memory only' });
    
    this.emitAgentComplete(oracleId, { decision: 'Redis + CDN hybrid' });
    
    // Prometheus creates plan
    const prometheusId = this.emitAgentSpawn(AGENT_TYPES.PROMETHEUS, 'Plan caching implementation', sisyphusId);
    await this.delay(2000);
    this.emitAgentComplete(prometheusId, { phases: 3 });
    
    this.emitAgentComplete(sisyphusId, { status: 'designed', next: 'implementation' });
  }
}

// WebSocket connection handler
wss.on('connection', (ws) => {
  console.log('🔌 Client connected');
  clients.add(ws);
  
  // Send initial state
  ws.send(JSON.stringify({
    type: EVENT_TYPES.SYSTEM,
    timestamp: Date.now(),
    data: { message: 'Connected to OMO Visualizer', activeAgents: agents.size }
  }));
  
  ws.on('message', (data) => {
    try {
      const event = JSON.parse(data);
      console.log('📨 Received:', event.type);
      
      // Handle different message types from clients
      if (event.type === 'get_agent_details') {
        // Return detailed session for an agent
        ws.send(JSON.stringify({
          type: 'agent_details',
          timestamp: Date.now(),
          data: generateMockAgentDetails(event.data.agentId)
        }));
      }
    } catch (e) {
      console.error('Invalid message:', e);
    }
  });
  
  ws.on('close', () => {
    console.log('🔌 Client disconnected');
    clients.delete(ws);
  });
});

// Generate mock agent details for the secondary view
function generateMockAgentDetails(agentId) {
  return {
    id: agentId,
    sessionLog: [
      { time: Date.now() - 5000, type: 'system', content: 'Agent initialized' },
      { time: Date.now() - 4500, type: 'thought', content: 'Analyzing request requirements...' },
      { time: Date.now() - 4000, type: 'action', content: 'Spawning exploration agents' },
      { time: Date.now() - 3500, type: 'delegate', content: 'Delegated to Explore agent #1' },
      { time: Date.now() - 3000, type: 'result', content: 'Received: Found 5 matching files' },
      { time: Date.now() - 2500, type: 'thought', content: 'Based on findings, I should...' },
      { time: Date.now() - 2000, type: 'tool', content: 'Reading file: src/auth.ts' },
      { time: Date.now() - 1500, type: 'action', content: 'Writing implementation' },
      { time: Date.now() - 1000, type: 'verify', content: 'Running tests...' },
      { time: Date.now() - 500, type: 'complete', content: 'Task completed successfully' }
    ],
    filesTouched: ['src/auth.ts', 'src/middleware.ts', 'tests/auth.test.ts'],
    tokensUsed: 15420,
    subagentsSpawned: 3,
    toolsUsed: ['read', 'write', 'task', 'lsp_diagnostics']
  };
}

// Start server
server.listen(PORT, () => {
  console.log(`🚀 OMO Visualizer Server running on http://localhost:${PORT}`);
  console.log(`📡 WebSocket server ready on ws://localhost:${PORT}`);
  
  // Start simulation
  const simulator = new AgentCollaborationSimulator();
  simulator.start().catch(console.error);
});

export { broadcast, sessions, agents };
