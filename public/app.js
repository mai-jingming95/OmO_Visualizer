/**
 * OMO Visualizer - Main Application
 * Real-time visualization of Oh My Opencode Agent team collaboration
 */

import { 
  AGENT_TYPES, 
  EVENT_TYPES, 
  ACTION_TYPES,
  AGENT_INFO 
} from '../shared/types.js';

// ===== Configuration =====
const CONFIG = {
  WS_URL: `ws://${window.location.host}`,
  HEX_RADIUS: 30,
  GRID_RINGS: 4,
  COLORS: {
    sisyphus: 0x3b82f6,
    atlas: 0x8b5cf6,
    prometheus: 0xf59e0b,
    metis: 0x10b981,
    momus: 0xef4444,
    oracle: 0x6366f1,
    librarian: 0x14b8a6,
    explore: 0x22d3ee,
    hephaestus: 0xf97316
  }
};

// ===== Global State =====
const state = {
  agents: new Map(),
  activeAgent: null,
  ws: null,
  audioEnabled: true,
  scene: null,
  camera: null,
  renderer: null,
  raycaster: new THREE.Raycaster(),
  mouse: new THREE.Vector2(),
  agentMeshes: new Map(),
  activities: []
};

// ===== Audio System =====
const audio = {
  synth: null,
  polySynth: null,
  
  init() {
    this.synth = new Tone.Synth({
      oscillator: { type: 'sine' },
      envelope: { attack: 0.01, decay: 0.1, sustain: 0.1, release: 1 }
    }).toDestination();
    
    this.polySynth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'triangle' },
      envelope: { attack: 0.02, decay: 0.1, sustain: 0.3, release: 1 }
    }).toDestination();
    
    this.polySynth.volume.value = -10;
  },
  
  playSpawn(agentType) {
    if (!state.audioEnabled) return;
    const note = agentType === 'sisyphus' ? 'C4' : 
                 agentType === 'explore' ? 'E4' :
                 agentType === 'librarian' ? 'G4' : 'A4';
    this.synth.triggerAttackRelease(note, '8n');
  },
  
  playAction() {
    if (!state.audioEnabled) return;
    this.polySynth.triggerAttackRelease(['C5', 'E5'], '16n');
  },
  
  playComplete() {
    if (!state.audioEnabled) return;
    this.polySynth.triggerAttackRelease(['C4', 'E4', 'G4', 'C5'], '8n');
  }
};

// ===== 3D Scene Setup =====
function initScene() {
  const container = document.getElementById('scene-container');
  
  // Scene
  state.scene = new THREE.Scene();
  state.scene.background = new THREE.Color(0x0a0a0f);
  state.scene.fog = new THREE.Fog(0x0a0a0f, 100, 400);
  
  // Camera
  state.camera = new THREE.PerspectiveCamera(
    60, 
    window.innerWidth / window.innerHeight, 
    0.1, 
    1000
  );
  state.camera.position.set(0, 80, 120);
  state.camera.lookAt(0, 0, 0);
  
  // Renderer
  state.renderer = new THREE.WebGLRenderer({ antialias: true });
  state.renderer.setSize(window.innerWidth, window.innerHeight);
  state.renderer.shadowMap.enabled = true;
  state.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  container.appendChild(state.renderer.domElement);
  
  // Controls
  const controls = new THREE.OrbitControls(state.camera, state.renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.maxPolarAngle = Math.PI / 2.2;
  controls.minDistance = 50;
  controls.maxDistance = 200;
  
  // Lighting
  const ambientLight = new THREE.AmbientLight(0x404060, 0.5);
  state.scene.add(ambientLight);
  
  const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
  dirLight.position.set(50, 100, 50);
  dirLight.castShadow = true;
  dirLight.shadow.mapSize.width = 2048;
  dirLight.shadow.mapSize.height = 2048;
  state.scene.add(dirLight);
  
  const pointLight = new THREE.PointLight(0x6366f1, 0.5, 200);
  pointLight.position.set(0, 50, 0);
  state.scene.add(pointLight);
  
  // Create hex grid
  createHexGrid();
  
  // Animation loop
  animate();
  
  // Event listeners
  window.addEventListener('resize', onWindowResize);
  state.renderer.domElement.addEventListener('click', onSceneClick);
  state.renderer.domElement.addEventListener('mousemove', onMouseMove);
}

// ===== Hex Grid System =====
function createHexGrid() {
  const radius = CONFIG.HEX_RADIUS;
  const rings = CONFIG.GRID_RINGS;
  
  const hexGeometry = new THREE.CylinderGeometry(radius * 0.9, radius * 0.9, 2, 6);
  const hexMaterial = new THREE.MeshStandardMaterial({
    color: 0x1a1a2e,
    roughness: 0.7,
    metalness: 0.3,
    transparent: true,
    opacity: 0.8
  });
  
  const edgesGeometry = new THREE.EdgesGeometry(hexGeometry);
  const edgesMaterial = new THREE.LineBasicMaterial({ 
    color: 0x6366f1, 
    transparent: true, 
    opacity: 0.3 
  });
  
  // Generate hex positions using axial coordinates
  for (let q = -rings; q <= rings; q++) {
    for (let r = Math.max(-rings, -q - rings); r <= Math.min(rings, -q + rings); r++) {
      const x = radius * 1.5 * q;
      const z = radius * Math.sqrt(3) * (r + q / 2);
      
      const hex = new THREE.Mesh(hexGeometry, hexMaterial.clone());
      hex.position.set(x, -1, z);
      hex.receiveShadow = true;
      hex.userData = { q, r, isHex: true };
      
      // Distance-based color variation
      const dist = Math.sqrt(q * q + r * r + q * r);
      const alpha = 1 - (dist / rings) * 0.5;
      hex.material.opacity = alpha * 0.6;
      
      const edges = new THREE.LineSegments(edgesGeometry, edgesMaterial.clone());
      edges.material.opacity = alpha * 0.3;
      hex.add(edges);
      
      state.scene.add(hex);
    }
  }
}

// ===== Agent Entity System =====
class AgentEntity {
  constructor(id, type, description, parentId = null) {
    this.id = id;
    this.type = type;
    this.description = description;
    this.parentId = parentId;
    this.spawnTime = Date.now();
    this.position = this.calculatePosition();
    this.mesh = this.createMesh();
    this.label = this.createLabel();
    this.status = 'active';
    this.currentAction = null;
    
    state.scene.add(this.mesh);
    state.scene.add(this.label);
    state.agentMeshes.set(id, this);
  }
  
  calculatePosition() {
    // Spawn position based on agent type
    const positions = {
      [AGENT_TYPES.SISYPHUS]: { x: 0, z: 0 },
      [AGENT_TYPES.METIS]: { x: -40, z: -30 },
      [AGENT_TYPES.PROMETHEUS]: { x: 40, z: -30 },
      [AGENT_TYPES.ORACLE]: { x: 0, z: -50 },
      [AGENT_TYPES.EXPLORE]: { x: -60, z: 20 },
      [AGENT_TYPES.LIBRARIAN]: { x: 60, z: 20 }
    };
    
    const basePos = positions[this.type] || { 
      x: (Math.random() - 0.5) * 80, 
      z: (Math.random() - 0.5) * 60 
    };
    
    // Add some randomness for multiple agents of same type
    return {
      x: basePos.x + (Math.random() - 0.5) * 20,
      y: 10,
      z: basePos.z + (Math.random() - 0.5) * 20
    };
  }
  
  createMesh() {
    const color = CONFIG.COLORS[this.type] || 0x888888;
    
    // Main body (sphere)
    const geometry = new THREE.SphereGeometry(6, 32, 32);
    const material = new THREE.MeshStandardMaterial({
      color: color,
      roughness: 0.3,
      metalness: 0.7,
      emissive: color,
      emissiveIntensity: 0.2
    });
    
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(this.position.x, this.position.y, this.position.z);
    mesh.castShadow = true;
    mesh.userData = { agentId: this.id, isAgent: true };
    
    // Glow effect
    const glowGeometry = new THREE.SphereGeometry(8, 32, 32);
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: 0.2
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    mesh.add(glow);
    
    // Orbiting particles
    const particleCount = 6;
    for (let i = 0; i < particleCount; i++) {
      const particle = new THREE.Mesh(
        new THREE.SphereGeometry(1, 8, 8),
        new THREE.MeshBasicMaterial({ color: color })
      );
      const angle = (i / particleCount) * Math.PI * 2;
      particle.position.set(
        Math.cos(angle) * 10,
        Math.sin(angle * 2) * 3,
        Math.sin(angle) * 10
      );
      mesh.add(particle);
    }
    
    return mesh;
  }
  
  createLabel() {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 256;
    canvas.height = 64;
    
    context.fillStyle = 'rgba(26, 26, 46, 0.9)';
    context.roundRect(0, 0, 256, 64, 8);
    context.fill();
    
    context.font = 'bold 16px Arial';
    context.fillStyle = '#ffffff';
    context.textAlign = 'center';
    
    const agentInfo = AGENT_INFO[this.type] || { name: this.type, title: 'Agent' };
    context.fillText(agentInfo.name, 128, 28);
    
    context.font = '12px Arial';
    context.fillStyle = '#94a3b8';
    context.fillText(this.truncateText(this.description, 25), 128, 48);
    
    const texture = new THREE.CanvasTexture(canvas);
    const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.position.set(this.position.x, this.position.y + 12, this.position.z);
    sprite.scale.set(20, 5, 1);
    
    return sprite;
  }
  
  truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }
  
  setAction(actionType, details = {}) {
    this.currentAction = { type: actionType, details, time: Date.now() };
    this.status = 'working';
    
    // Update label
    const actionInfo = ACTION_TYPES[actionType] || { icon: '⚡', label: 'Working' };
    this.updateLabel(`${actionInfo.icon} ${actionInfo.label}`);
    
    // Visual feedback
    this.pulse();
  }
  
  updateLabel(text) {
    const canvas = this.label.material.map.image;
    const context = canvas.getContext('2d');
    
    context.fillStyle = 'rgba(26, 26, 46, 0.95)';
    context.roundRect(0, 0, 256, 64, 8);
    context.fill();
    
    context.font = 'bold 14px Arial';
    context.fillStyle = '#ffffff';
    context.textAlign = 'center';
    
    const agentInfo = AGENT_INFO[this.type] || { name: this.type };
    context.fillText(agentInfo.name, 128, 26);
    
    context.font = '11px Arial';
    context.fillStyle = '#22d3ee';
    context.fillText(text, 128, 46);
    
    this.label.material.map.needsUpdate = true;
  }
  
  pulse() {
    const originalScale = this.mesh.scale.x;
    const tl = { t: 0 };
    
    const animate = () => {
      tl.t += 0.1;
      const scale = originalScale * (1 + Math.sin(tl.t) * 0.1);
      this.mesh.scale.set(scale, scale, scale);
      
      if (tl.t < Math.PI) {
        requestAnimationFrame(animate);
      } else {
        this.mesh.scale.set(originalScale, originalScale, originalScale);
      }
    };
    animate();
  }
  
  complete(result) {
    this.status = 'completed';
    this.updateLabel('✓ Completed');
    
    // Fade out animation
    const fade = () => {
      this.mesh.material.opacity -= 0.02;
      if (this.mesh.material.opacity > 0) {
        requestAnimationFrame(fade);
      } else {
        this.destroy();
      }
    };
    
    // Keep completed agents visible for a while
    setTimeout(fade, 5000);
  }
  
  destroy() {
    state.scene.remove(this.mesh);
    state.scene.remove(this.label);
    state.agentMeshes.delete(this.id);
    state.agents.delete(this.id);
  }
  
  update(time) {
    // Floating animation
    this.mesh.position.y = this.position.y + Math.sin(time * 2 + this.id.charCodeAt(0)) * 1.5;
    this.label.position.y = this.mesh.position.y + 12;
    
    // Rotate particles
    this.mesh.children.forEach((child, i) => {
      if (i > 0) { // Skip glow mesh
        const angle = (time * 0.5) + (i * Math.PI / 3);
        child.position.x = Math.cos(angle) * 10;
        child.position.z = Math.sin(angle) * 10;
      }
    });
    
    // Working animation
    if (this.status === 'working') {
      this.mesh.rotation.y += 0.02;
    }
  }
}

// ===== Event Handlers =====
function handleAgentSpawn(data) {
  const { id, agentType, description, parentId } = data;
  
  if (!state.agents.has(id)) {
    const agent = new AgentEntity(id, agentType, description, parentId);
    state.agents.set(id, agent);
    
    // Update UI
    addAgentToOverview(id, agentType, description);
    addActivity('spawn', `Spawned ${AGENT_INFO[agentType]?.name || agentType}: ${description}`);
    
    // Audio
    audio.playSpawn(agentType);
    
    // Update count
    updateAgentCount();
  }
}

function handleAgentAction(data) {
  const { agentId, action, details } = data;
  const agent = state.agentMeshes.get(agentId);
  
  if (agent) {
    agent.setAction(action, details);
    
    const actionInfo = ACTION_TYPES[action] || { label: action };
    addActivity('action', `${AGENT_INFO[agent.type]?.name || agent.type}: ${actionInfo.label}`);
    
    audio.playAction();
  }
}

function handleAgentComplete(data) {
  const { agentId, result } = data;
  const agent = state.agentMeshes.get(agentId);
  
  if (agent) {
    agent.complete(result);
    addActivity('complete', `${AGENT_INFO[agent.type]?.name || agent.type} completed`);
    audio.playComplete();
    updateAgentCount();
  }
}

// ===== WebSocket Connection =====
function connectWebSocket() {
  state.ws = new WebSocket(CONFIG.WS_URL);
  
  state.ws.onopen = () => {
    console.log('🔌 Connected to OMO Visualizer server');
    updateConnectionStatus(true);
    addActivity('system', 'Connected to server');
  };
  
  state.ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    handleWebSocketMessage(msg);
  };
  
  state.ws.onclose = () => {
    console.log('🔌 Disconnected from server');
    updateConnectionStatus(false);
    addActivity('system', 'Disconnected from server');
    
    // Reconnect after 3 seconds
    setTimeout(connectWebSocket, 3000);
  };
  
  state.ws.onerror = (error) => {
    console.error('WebSocket error:', error);
  };
}

function handleWebSocketMessage(msg) {
  switch (msg.type) {
    case EVENT_TYPES.AGENT_SPAWN:
      handleAgentSpawn(msg.data);
      break;
    case EVENT_TYPES.AGENT_ACTION:
      handleAgentAction(msg.data);
      break;
    case EVENT_TYPES.AGENT_COMPLETE:
      handleAgentComplete(msg.data);
      break;
    case EVENT_TYPES.SYSTEM:
      addActivity('system', msg.data.message);
      break;
    case 'agent_details':
      showAgentDetails(msg.data);
      break;
    default:
      console.log('Unknown event:', msg.type);
  }
}

// ===== UI Updates =====
function addAgentToOverview(id, agentType, description) {
  const agentInfo = AGENT_INFO[agentType] || { name: agentType, icon: '🤖', color: '#888' };
  const agentList = document.getElementById('agent-list');
  
  // Remove empty state if exists
  const emptyState = agentList.querySelector('.empty-state');
  if (emptyState) emptyState.remove();
  
  const item = document.createElement('div');
  item.className = 'agent-item';
  item.dataset.agentId = id;
  item.innerHTML = `
    <div class="agent-avatar" style="background: ${agentInfo.color}20; border: 2px solid ${agentInfo.color}">
      ${agentInfo.icon}
    </div>
    <div class="agent-details">
      <div class="agent-name" style="color: ${agentInfo.color}">${agentInfo.name}</div>
      <div class="agent-action">${description}</div>
    </div>
    <div class="agent-status"></div>
  `;
  
  item.addEventListener('click', () => {
    document.querySelectorAll('.agent-item').forEach(el => el.classList.remove('active'));
    item.classList.add('active');
    requestAgentDetails(id);
  });
  
  agentList.insertBefore(item, agentList.firstChild);
  
  // Limit to 20 items
  while (agentList.children.length > 20) {
    agentList.removeChild(agentList.lastChild);
  }
}

function addActivity(type, message) {
  const activityList = document.getElementById('activity-list');
  const time = new Date().toLocaleTimeString('zh-CN', { hour12: false });
  
  const item = document.createElement('div');
  item.className = `activity-item ${type}`;
  item.innerHTML = `
    <span class="activity-time">${time}</span>
    <span class="activity-content">${message}</span>
  `;
  
  activityList.insertBefore(item, activityList.firstChild);
  
  // Limit to 50 items
  while (activityList.children.length > 50) {
    activityList.removeChild(activityList.lastChild);
  }
}

function updateConnectionStatus(connected) {
  const status = document.getElementById('connection-status');
  status.className = `status-dot ${connected ? '' : 'disconnected'}`;
}

function updateAgentCount() {
  const count = state.agents.size;
  document.getElementById('agent-count').textContent = `${count} Agent${count !== 1 ? 's' : ''}`;
}

// ===== Modal (Secondary View) =====
function requestAgentDetails(agentId) {
  if (state.ws && state.ws.readyState === WebSocket.OPEN) {
    state.ws.send(JSON.stringify({
      type: 'get_agent_details',
      data: { agentId }
    }));
  }
}

function showAgentDetails(data) {
  const modal = document.getElementById('agent-modal');
  const agent = state.agentMeshes.get(data.id);
  
  if (!agent) return;
  
  const agentInfo = AGENT_INFO[agent.type] || { name: agent.type, title: 'Agent', icon: '🤖' };
  
  // Update header
  document.getElementById('modal-agent-icon').textContent = agentInfo.icon;
  document.getElementById('modal-agent-name').textContent = agentInfo.name;
  document.getElementById('modal-agent-role').textContent = agentInfo.title;
  
  // Update session log
  const logContainer = document.getElementById('session-log');
  logContainer.innerHTML = data.sessionLog.map(log => `
    <div class="log-entry">
      <span class="log-time">${new Date(log.time).toLocaleTimeString()}</span>
      <span class="log-type ${log.type}">${log.type}</span>
      <span class="log-content">${log.content}</span>
    </div>
  `).join('');
  
  // Update stats
  document.getElementById('stat-files').textContent = data.filesTouched?.length || 0;
  document.getElementById('stat-tokens').textContent = (data.tokensUsed || 0).toLocaleString();
  document.getElementById('stat-subagents').textContent = data.subagentsSpawned || 0;
  document.getElementById('stat-duration').textContent = 
    Math.round((Date.now() - agent.spawnTime) / 1000) + 's';
  
  // Update files list
  const filesList = document.getElementById('files-list');
  filesList.innerHTML = (data.filesTouched || []).map(file => 
    `<span class="file-tag">${file}</span>`
  ).join('');
  
  // Show modal
  modal.classList.remove('hidden');
}

function closeModal() {
  document.getElementById('agent-modal').classList.add('hidden');
  document.querySelectorAll('.agent-item').forEach(el => el.classList.remove('active'));
}

// ===== Event Listeners =====
function onWindowResize() {
  state.camera.aspect = window.innerWidth / window.innerHeight;
  state.camera.updateProjectionMatrix();
  state.renderer.setSize(window.innerWidth, window.innerHeight);
}

function onMouseMove(event) {
  state.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  state.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

function onSceneClick(event) {
  state.raycaster.setFromCamera(state.mouse, state.camera);
  
  const intersects = state.raycaster.intersectObjects(state.scene.children);
  
  for (const intersect of intersects) {
    if (intersect.object.userData.isAgent) {
      const agentId = intersect.object.userData.agentId;
      requestAgentDetails(agentId);
      
      // Highlight in overview
      document.querySelectorAll('.agent-item').forEach(el => {
        el.classList.toggle('active', el.dataset.agentId === agentId);
      });
      break;
    }
  }
}

// ===== Animation Loop =====
function animate() {
  requestAnimationFrame(animate);
  
  const time = Date.now() * 0.001;
  
  // Update all agents
  state.agentMeshes.forEach(agent => agent.update(time));
  
  // Render
  state.renderer.render(state.scene, state.camera);
  
  // Update FPS
  updateFPS();
}

let lastTime = performance.now();
let frameCount = 0;

function updateFPS() {
  frameCount++;
  const now = performance.now();
  
  if (now - lastTime >= 1000) {
    document.getElementById('fps-counter').textContent = `${frameCount} FPS`;
    frameCount = 0;
    lastTime = now;
  }
}

// ===== Initialization =====
document.addEventListener('DOMContentLoaded', () => {
  // Initialize Tone.js on first interaction
  document.body.addEventListener('click', async () => {
    if (Tone.context.state !== 'running') {
      await Tone.start();
    }
  }, { once: true });
  
  // Initialize systems
  audio.init();
  initScene();
  connectWebSocket();
  
  // UI event listeners
  document.getElementById('close-modal').addEventListener('click', closeModal);
  document.getElementById('agent-modal').addEventListener('click', (e) => {
    if (e.target.id === 'agent-modal') closeModal();
  });
  
  document.getElementById('clear-feed').addEventListener('click', () => {
    document.getElementById('activity-list').innerHTML = '';
  });
  
  document.getElementById('toggle-overview').addEventListener('click', () => {
    const panel = document.getElementById('agent-list');
    panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
  });
  
  document.getElementById('audio-toggle').addEventListener('click', () => {
    state.audioEnabled = !state.audioEnabled;
    document.getElementById('audio-toggle').classList.toggle('muted', !state.audioEnabled);
  });
  
  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
    if (e.key === 'm' || e.key === 'M') {
      state.audioEnabled = !state.audioEnabled;
      document.getElementById('audio-toggle').classList.toggle('muted', !state.audioEnabled);
    }
  });
  
  console.log('🚀 OMO Visualizer initialized');
});
