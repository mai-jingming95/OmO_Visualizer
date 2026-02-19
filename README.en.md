# OMO Visualizer

🎯 **Demonstration Tool for Oh My Opencode Agent Team Collaboration**

> ⚠️ **Important Notice**: This is a **demonstration/prototype tool**, not a production real-time monitoring system. The current version uses a built-in simulator to generate preset scenarios, showcasing the multi-Agent collaboration workflow. It aims to help users intuitively understand the Oh My Opencode Agent team architecture and collaboration mechanisms.

Inspired by [vibecraft](https://github.com/Nearcyan/vibecraft), this tool provides an immersive 3D visualization interface that allows you to observe how the Oh My Opencode Agent team collaborates to complete tasks.

![OMO Visualizer](https://img.shields.io/badge/Three.js-3D%20Visualization-blue)
![WebSocket](https://img.shields.io/badge/WebSocket-Real--time-green)
![Tone.js](https://img.shields.io/badge/Tone.js-Audio-orange)

## ✨ Features

### 🎮 Primary Interface - Agent Overview Panel
- **Real-time Agent List**: Displays all active Agents and their current actions
- **Action + Topic Format**: e.g., "Search codebase: auth patterns", "Create plan: API refactoring"
- **Color Coding**: Different Agent types are identified by different colors
- **Status Indicators**: Shows Agent current status (active/working/completed)

### 🔍 Secondary Interface - Agent Detailed Session Popup
- **Click to Trigger**: Click on an Agent icon in the primary interface to open a detailed window
- **Complete Session Logs**: View the Agent's thought process, tool calls, and decision rationale
- **Statistics**: Token usage, files processed, duration, number of sub-Agents
- **File Tracking**: Displays all files operated on by the Agent

### 🎨 3D Visualization
- **Hexagonal Grid**: Hexagonal studio floor inspired by vibecraft style
- **Agent Entities**: Each Agent represented as a glowing 3D sphere with particle orbit animations
- **Spatial Distribution**: Different Agent types have different distribution areas in 3D space
- **Dynamic Labels**: Information labels floating above Agents

### 📊 Activity Stream
- **Real-time Logs**: Chronological log of all system events and Agent actions displayed on the right
- **Category Indicators**: Different event types distinguished by different colors

### 🔊 Audio Feedback
- **Spawn Sound**: Unique tone when Agent is spawned
- **Action Sound**: Audio feedback when Agent performs actions
- **Completion Sound**: Chord prompt when task is completed

## 🎬 Use Cases

Despite being a demonstration tool, it provides real value in the following scenarios:

### 💼 External Presentations
- **Tech Roadshows & Fundraising Demos** — Intuitively showcase the intelligent collaboration capabilities of the AI Agent system to investors
- **Product Launches** — Serve as a visual highlight of the product, letting audiences "see" how AI works
- **Customer POC Demos** — Help potential customers understand the value and working principles of multi-Agent systems
- **Industry Conference Talks** — Dynamic visual aid for technical presentations, more impactful than static PowerPoint slides

### 👥 Internal Value
- **New Member Onboarding** — Help new team members quickly understand the Oh My Opencode Agent architecture and division of labor logic
- **Architecture Design Reviews** — Visually present multi-Agent collaboration designs for team discussion and optimization
- **Tech Sharing Sessions** — Internal knowledge transfer, demonstrating the internal workings of the AI system
- **Debugging Comprehension Aid** — Help developers understand execution flows and decision paths in complex multi-Agent interactions

### 📚 Education & Outreach
- **Technical Blogs & Article Illustrations** — Make abstract Multi-Agent concepts visual and easy to understand
- **Open Source Project Showcases** — Attract more developers and contributors to engage and participate
- **Teaching & Training Materials** — Used for teaching courses on Multi-Agent system design, AI collaboration mechanisms, etc.
- **Academic Research Presentations** — Present the workflow and decision-making process of AI Agent collaboration

### 🏢 Brand & Culture Building
- **Company Lobby Displays** — Loop playback in reception or showroom areas to showcase technical capabilities and engineering culture
- **Social Media Content** — Record demo videos for technical dissemination on platforms like Twitter/X, LinkedIn
- **Recruitment Marketing** — Showcase the company's cutting-edge AI engineering practices to candidates
- **Tech Brand Building** — Establish a "Transparent AI" image, letting users/customers understand how the system works for them

## 🚀 Quick Start

### Download from GitHub

```bash
# Clone the repository
git clone https://github.com/mai-jingming95/OmO_Visualizer.git

# Navigate to project directory
cd OmO_Visualizer
```

### Install Dependencies
```bash
npm install
```

### Start the Server
```bash
npm run dev
```

### Access the Visualization Interface
Open your browser and visit http://localhost:4004

## 🏗️ System Architecture

### Agent Type Mapping

| Agent | Color | Function |
|-------|-------|----------|
| **Sisyphus** | 🔵 Blue | Primary orchestrator, handles user requests |
| **Metis** | 🟢 Emerald | Pre-planning consultant, risk detection |
| **Prometheus** | 🟡 Amber | Plan builder |
| **Oracle** | 🟣 Indigo | Strategic advisor, complex architecture decisions |
| **Explore** | 🔵 Cyan | Codebase search |
| **Librarian** | 🩵 Teal | Documentation research |

### Event System

```javascript
// Agent spawn
{ type: 'agent_spawn', data: { id, agentType, description, parentId } }

// Agent action
{ type: 'agent_action', data: { agentId, action, details } }

// Agent complete
{ type: 'agent_complete', data: { agentId, result, duration } }
```

## 🎮 Interaction Controls

| Operation | Function |
|-----------|----------|
| **Click Agent** | Open detailed session popup |
| **Drag** | Rotate 3D view |
| **Scroll** | Zoom view |
| **M Key** | Toggle audio |
| **ESC** | Close popup |

## 📁 Project Structure

```
├── server/
│   └── index.js          # WebSocket server and simulation data generation
├── public/
│   ├── index.html        # Main page
│   ├── styles.css        # Stylesheet
│   └── app.js            # Frontend application logic
├── shared/
│   └── types.js          # Shared type definitions
└── package.json
```

## 🎭 Simulation Scenarios

The server includes 4 built-in collaboration scenarios:

1. **Feature Implementation**
   - Sisyphus → Metis analysis → Explore search → Librarian research → Prometheus planning → Implementation

2. **Bug Fix**
   - Sisyphus → Oracle consultation → Parallel Explore → Fix → Testing

3. **Code Refactoring**
   - Parallel multiple Explore searches → Batch refactoring → Build verification

4. **Architecture Decision**
   - Oracle deep consultation → Multiple Librarian parallel research → Prometheus implementation planning

## 🔌 WebSocket API

### Connect to Server
```javascript
const ws = new WebSocket('ws://localhost:4004');
```

### Send Events
```javascript
// Get Agent detailed information
ws.send(JSON.stringify({
  type: 'get_agent_details',
  data: { agentId: 'xxx' }
}));
```

### Receive Events
```javascript
ws.onmessage = (event) => {
  const msg = JSON.parse(event.data);
  // Handle: agent_spawn, agent_action, agent_complete, system
};
```

## 🛠️ Custom Integration

To connect with the real Oh My Opencode system, modify `server/index.js`:

```javascript
// Replace the simulator with a real event source
// For example: listen to Oh My Opencode hook outputs
// Or integrate into Agent system callbacks

function onRealAgentSpawn(agentType, description) {
  broadcast({
    type: EVENT_TYPES.AGENT_SPAWN,
    data: { id: generateId(), agentType, description }
  });
}
```

## 📝 License

MIT License - Inspired by [vibecraft](https://github.com/Nearcyan/vibecraft) design

## 🙏 Acknowledgments

- [vibecraft](https://github.com/Nearcyan/vibecraft) - Inspiration and architecture reference
- [Oh My Opencode](https://github.com/code-yeongyu/oh-my-opencode) - Agent system
- [Three.js](https://threejs.org/) - 3D rendering
- [Tone.js](https://tonejs.github.io/) - Audio processing
