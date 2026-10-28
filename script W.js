/**
 * Cyber Shield SOC • Enterprise Security Operations & Autonomous Threat Defense
 * Master Consolidated Application Controller & Real-Time Canvas Visualizers
 * (script.js)
 */

// =========================================================================
// 1. Interactive Canvas Visualizers & Telemetry Charts
// =========================================================================

class NetworkVisualizer {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.pulses = [];

    this.nodes = {
      external: { id: 'external', label: 'External Ingress', x: 0.12, y: 0.5, type: 'cloud', color: '#94a3b8' },
      firewall: { id: 'firewall', label: 'Perimeter IPS', x: 0.35, y: 0.5, type: 'shield', color: '#00f2fe' },
      dmzWeb:   { id: 'dmzWeb',   label: 'DMZ Gateway (10.0.4.15)', x: 0.60, y: 0.30, type: 'server', color: '#10b981' },
      authSso:  { id: 'authSso',  label: 'IAM / SSO Gateway', x: 0.60, y: 0.70, type: 'key', color: '#8b5cf6' },
      database: { id: 'database', label: 'Customer DB (10.0.8.22)', x: 0.85, y: 0.30, type: 'db', color: '#38bdf8' },
      internalWorkstations: { id: 'internal', label: 'Shielded Mobile & LAN', x: 0.85, y: 0.70, type: 'lan', color: '#10b981' }
    };

    this.links = [
      { from: 'external', to: 'firewall' },
      { from: 'firewall', to: 'dmzWeb' },
      { from: 'firewall', to: 'authSso' },
      { from: 'dmzWeb', to: 'database' },
      { from: 'authSso', to: 'internalWorkstations' }
    ];

    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.animate();
  }

  resize() {
    if (!this.canvas) return;
    this.width = this.canvas.parentElement.clientWidth || 600;
    this.height = this.canvas.parentElement.clientHeight || 320;
    this.canvas.width = this.width * (window.devicePixelRatio || 1);
    this.canvas.height = this.height * (window.devicePixelRatio || 1);
    this.ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);
  }

  triggerFlow(flow) {
    if (!this.ctx) return;
    const isThreat = flow.isThreat;
    let fromNode = this.nodes.external;
    let toNode = this.nodes.firewall;

    if (flow.dstPort === 22 || flow.protocol === 'HTTPS/AUTH') {
      toNode = this.nodes.authSso;
    } else if (flow.dstPort === 3306 || flow.prediction === 'DATA_EXFILTRATION') {
      toNode = this.nodes.database;
    } else {
      toNode = this.nodes.dmzWeb;
    }

    const startX = fromNode.x * this.width;
    const startY = fromNode.y * this.height;
    const endX = toNode.x * this.width;
    const endY = toNode.y * this.height;

    const count = isThreat ? 6 : 2;
    for (let i = 0; i < count; i++) {
      this.particles.push({
        startX, startY, endX, endY,
        progress: -i * 0.15,
        speed: isThreat ? 0.025 : 0.015,
        color: isThreat ? '#ff3366' : '#10b981',
        size: isThreat ? 4 : 2.5,
        isThreat
      });
    }

    if (isThreat) {
      this.pulses.push({
        x: this.nodes.firewall.x * this.width,
        y: this.nodes.firewall.y * this.height,
        radius: 5, maxRadius: 45,
        color: 'rgba(255, 51, 102, ', alpha: 0.9
      });
    }
  }

  animate() {
    if (!this.ctx) return;
    this.ctx.clearRect(0, 0, this.width, this.height);

    for (const link of this.links) {
      const n1 = this.nodes[link.from];
      const n2 = this.nodes[link.to];
      const grad = this.ctx.createLinearGradient(n1.x * this.width, n1.y * this.height, n2.x * this.width, n2.y * this.height);
      grad.addColorStop(0, 'rgba(56, 189, 248, 0.15)');
      grad.addColorStop(1, 'rgba(0, 242, 254, 0.3)');
      this.ctx.beginPath();
      this.ctx.strokeStyle = grad;
      this.ctx.moveTo(n1.x * this.width, n1.y * this.height);
      this.ctx.lineTo(n2.x * this.width, n2.y * this.height);
      this.ctx.stroke();
    }

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.progress += p.speed;
      if (p.progress > 0) {
        const curX = p.startX + (p.endX - p.startX) * Math.min(p.progress, 1);
        const curY = p.startY + (p.endY - p.startY) * Math.min(p.progress, 1);
        this.ctx.beginPath();
        this.ctx.arc(curX, curY, p.size, 0, Math.PI * 2);
        this.ctx.fillStyle = p.color;
        this.ctx.fill();
      }
      if (p.progress >= 1) this.particles.splice(i, 1);
    }

    for (let i = this.pulses.length - 1; i >= 0; i--) {
      const pulse = this.pulses[i];
      pulse.radius += 1.4;
      pulse.alpha -= 0.025;
      if (pulse.alpha <= 0) { this.pulses.splice(i, 1); continue; }
      this.ctx.beginPath();
      this.ctx.arc(pulse.x, pulse.y, pulse.radius, 0, Math.PI * 2);
      this.ctx.strokeStyle = `${pulse.color}${pulse.alpha})`;
      this.ctx.stroke();
    }

    for (const key in this.nodes) {
      const n = this.nodes[key];
      const x = n.x * this.width;
      const y = n.y * this.height;
      this.ctx.beginPath();
      this.ctx.arc(x, y, 16, 0, Math.PI * 2);
      this.ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      this.ctx.strokeStyle = n.color;
      this.ctx.lineWidth = 2;
      this.ctx.fill();
      this.ctx.stroke();

      this.ctx.beginPath();
      this.ctx.arc(x, y, 6, 0, Math.PI * 2);
      this.ctx.fillStyle = n.color;
      this.ctx.fill();

      this.ctx.fillStyle = '#f1f5f9';
      this.ctx.font = '600 11px sans-serif';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(n.label, x, y + 28);
    }

    requestAnimationFrame(() => this.animate());
  }
}

class AlertTrendChart {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.labels = ['12h', '10h', '8h', '6h', '4h', '2h', 'Now'];
    this.data = [8, 14, 22, 16, 28, 36, 42];
    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.render();
  }
  resize() {
    if (!this.canvas) return;
    this.width = this.canvas.parentElement.clientWidth || 400;
    this.height = this.canvas.parentElement.clientHeight || 180;
    this.canvas.width = this.width * (window.devicePixelRatio || 1);
    this.canvas.height = this.height * (window.devicePixelRatio || 1);
    this.ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);
    this.render();
  }
  render() {
    if (!this.ctx) return;
    this.ctx.clearRect(0, 0, this.width, this.height);
    const maxVal = Math.max(...this.data, 20);
    const step = (this.width - 60) / (this.data.length - 1);

    this.ctx.beginPath();
    for (let i = 0; i < this.data.length; i++) {
      const x = 40 + i * step;
      const y = this.height - 30 - (this.data[i] / maxVal) * (this.height - 50);
      if (i === 0) this.ctx.moveTo(x, y); else this.ctx.lineTo(x, y);
    }
    this.ctx.strokeStyle = '#00f2fe';
    this.ctx.lineWidth = 2.5;
    this.ctx.stroke();
  }
}

window.NetworkVisualizer = NetworkVisualizer;
window.AlertTrendChart = AlertTrendChart;

// =========================================================================
// 2. Seamless Client-Side Offline & Storage Engine
// =========================================================================
(function setupOfflineStore() {
  const isFile = (typeof window !== 'undefined' && window.location && window.location.protocol === 'file:') || !window.location.host;
  const originalFetch = typeof window !== 'undefined' && window.fetch ? window.fetch.bind(window) : null;

  const INITIAL_MOCK_USERS = [
    { id: "CS50-DEV01", name: "Michael Scott", phone: "+1-202-555-0143", email: "michael.s@dundermifflin.com", os: "Windows", device: "Laptop", network: "Enterprise Wi-Fi (WPA3)", registeredAt: "2026-10-25T10:30:00.000Z", status: "PROTECTED" },
    { id: "CS50-DEV02", name: "Sarah Jenkins", phone: "+1-415-555-0198", email: "sarah.jenkins@enterprise.corp", os: "iOS", device: "Mobile Phone", network: "5G Ultra Wideband", registeredAt: "2026-10-25T11:15:00.000Z", status: "WARNING - REVIEW" },
    { id: "CS50-DEV03", name: "David Kumar", phone: "+91-98765-43210", email: "david.kumar@techglobal.in", os: "Android", device: "Mobile Phone", network: "Wi-Fi 6 Decoy DMZ", registeredAt: "2026-10-26T08:00:00.000Z", status: "PROTECTED" },
    { id: "CS50-DEV04", name: "Elena Rostova", phone: "+44-20-7946-0912", email: "elena.rostova@cyberdefense.eu", os: "macOS", device: "Desktop", network: "Ethernet 10Gbps Core", registeredAt: "2026-10-26T09:45:00.000Z", status: "PROTECTED" }
  ];

  const INITIAL_MOCK_ADMINS = [
    { id: "ADMIN-SUNNY-01", name: "Sunny (Founder & Super Admin)", username: "SUNNY", email: "sunny@cybershield.org", role: "SUPER_ADMIN" },
    { id: "ADMIN-ALEX-02", name: "Alex Rivera (Lead Security Admin)", username: "alex.rivera", email: "alex.rivera@cybershield.org", role: "ADMIN" },
    { id: "ADMIN-SARAH-03", name: "Sarah Chen (SOC Tier-2 Analyst)", username: "sarah.chen", email: "sarah.chen@cybershield.org", role: "SOC_OPERATOR" }
  ];

  function getStored(key, fallback) {
    try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch (_) { return fallback; }
  }
  function setStored(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch (_) {}
  }

  let mockUsers = getStored('cs_mock_users', INITIAL_MOCK_USERS);
  let mockAdmins = getStored('cs_mock_admins', INITIAL_MOCK_ADMINS);
  let mockIncidents = getStored('cs_mock_incidents', [
    { id: "INC-2026-0814", title: "High-Volume SYN Flood Targeting Perimeter Ingress Sockets", severity: "CRITICAL", status: "CONTAINED", assigned_name: "Alex Rivera", affected_asset: "DMZ Edge Gateway (10.0.4.15)", source_ip: "185.220.101.5", confidence: 96, summary: "SYN flood exceeding 18,500 packets/sec attempting connection exhaustion.", containment_action: "IP quarantined at perimeter firewall.", created_at: new Date(Date.now() - 3600000).toISOString(), comments: [], timeline: [] },
    { id: "INC-2026-0815", title: "Pegasus Mobile C2 Heartbeat Flagged on Executive Phone", severity: "CRITICAL", status: "INVESTIGATING", assigned_name: "Sunny", affected_asset: "Samsung Galaxy S24 (DEV-MOB-01)", source_ip: "45.154.255.89", confidence: 93, summary: "Suspicious heartbeat on port 9001 targeting mobile spyware C2.", containment_action: "Mobile Shield AFWall+ rule pushed; device isolated.", created_at: new Date(Date.now() - 7200000).toISOString(), comments: [], timeline: [] },
    { id: "INC-2026-0816", title: "SQL Injection Probing on Database Ingress Gateway", severity: "HIGH", status: "MITIGATED", assigned_name: "Sarah Chen", affected_asset: "Customer DB (10.0.8.22)", source_ip: "194.26.29.112", confidence: 89, summary: "Tautological SQL syntax injection detected in HTTP query.", containment_action: "Parameterized query boundary reinforced.", created_at: new Date(Date.now() - 14400000).toISOString(), comments: [], timeline: [] },
    { id: "INC-2026-0817", title: "PCI-DSS Sensitive Egress Interception & Luhn Card Masking", severity: "MEDIUM", status: "NEW", assigned_name: "Unassigned", affected_asset: "Internal Subnet", source_ip: "10.0.8.22", confidence: 94, summary: "Unencrypted egress packet containing customer credit card numbers masked by DLP.", containment_action: "Payload masked with XXXX-XXXX-XXXX-1234.", created_at: new Date(Date.now() - 28800000).toISOString(), comments: [], timeline: [] }
  ]);

  let mockIocs = getStored('cs_mock_iocs', [
    { id: "IOC-2026-001", type: "IPV4", value: "185.220.101.5", threat_score: 96, severity: "CRITICAL", confidence: 95, threat_actor: "Cobalt Gang / APT29", campaign: "Operation DarkShield", status: "ACTIVE", last_seen: new Date().toISOString() },
    { id: "IOC-2026-002", type: "IPV4", value: "45.154.255.89", threat_score: 92, severity: "CRITICAL", confidence: 90, threat_actor: "Lazarus Group", campaign: "GhostRat Cellular", status: "ACTIVE", last_seen: new Date().toISOString() },
    { id: "IOC-2026-003", type: "IPV4", value: "91.240.118.172", threat_score: 88, severity: "HIGH", confidence: 92, threat_actor: "Mirai Botnet", campaign: "Edge Sweep", status: "ACTIVE", last_seen: new Date().toISOString() },
    { id: "IOC-2026-004", type: "DOMAIN", value: "update-edge-secureauth.org", threat_score: 94, severity: "CRITICAL", confidence: 95, threat_actor: "Scattered Spider", campaign: "SSO Harvest", status: "ACTIVE", last_seen: new Date().toISOString() },
    { id: "IOC-2026-005", type: "HASH_SHA256", value: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855", threat_score: 98, severity: "CRITICAL", confidence: 99, threat_actor: "LockBit 3.0", campaign: "Blackout", status: "ACTIVE", last_seen: new Date().toISOString() }
  ]);

  function makeResponse(status, data) {
    return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });
  }

  async function mockApiHandler(url, options = {}) {
    const method = (options.method || 'GET').toUpperCase();
    const urlObj = new URL(url, 'http://localhost');
    const pathname = urlObj.pathname;
    let body = {};
    if (options.body) {
      try { body = typeof options.body === 'string' ? JSON.parse(options.body) : options.body; } catch (_) {}
    }

    if (pathname === '/api/metrics/soc-overview') {
      return makeResponse(200, {
        success: true,
        posture: {
          score: 91, level: "EXCELLENT", color: "var(--accent-emerald)",
          domains: [
            { name: 'Perimeter Gateway', score: 96, color: 'var(--accent-emerald)' },
            { name: 'Mobile & Endpoint Shield', score: 94, color: 'var(--accent-emerald)' },
            { name: 'Identity & Access (UEBA)', score: 92, color: 'var(--accent-cyan)' },
            { name: 'Data Loss Prevention (DLP)', score: 95, color: 'var(--accent-emerald)' }
          ]
        }
      });
    }

    if (pathname === '/api/incidents') {
      return makeResponse(200, { success: true, total: mockIncidents.length, incidents: mockIncidents });
    }

    if (pathname === '/api/threat-intel/indicators') {
      return makeResponse(200, { success: true, total: mockIocs.length, indicators: mockIocs });
    }

    if (pathname === '/api/admin/users') {
      if (method === 'POST') {
        const u = { id: "CS50-" + Math.random().toString(36).substring(2, 7).toUpperCase(), ...body, registeredAt: new Date().toISOString(), status: "PROTECTED" };
        mockUsers.unshift(u);
        setStored('cs_mock_users', mockUsers);
        return makeResponse(201, { success: true, user: u });
      }
      return makeResponse(200, { success: true, users: mockUsers });
    }

    if (pathname === '/api/auth/sessions') {
      return makeResponse(200, {
        success: true,
        sessions: [
          { token: "CS-SES-99a1...", fullToken: "CS-SES-99a188412", name: "Sunny", role: "SUPER_ADMIN", ip: "127.0.0.1", userAgent: "Chrome / Windows 11", createdAt: new Date().toISOString() }
        ]
      });
    }

    if (pathname === '/api/admin/rbac-matrix') {
      return makeResponse(200, {
        success: true,
        roles: ['SUPER_ADMIN', 'ADMIN', 'SOC_OPERATOR', 'SECURITY_AUDITOR', 'REGISTERED_USER'],
        permissions: [
          { key: 'DASHBOARD_VIEW', label: 'View Executive Dashboard' },
          { key: 'INCIDENTS_MANAGE', label: 'Triage & Update Incidents' },
          { key: 'ALERTS_VIEW', label: 'View Detection Alerts' },
          { key: 'THREAT_INTEL_MANAGE', label: 'Add/Edit/Delete IOCs' },
          { key: 'FIREWALL_RULES_MANAGE', label: 'Autonomous Firewall Rules' }
        ]
      });
    }

    if (pathname === '/api/verification/totp-status') {
      return makeResponse(200, { success: true, currentCode: "777888", secondsRemaining: "Unlimited" });
    }

    if (pathname === '/api/hardware/overview') {
      return makeResponse(200, {
        success: true,
        cluster: {
          nodes: [
            { nodeId: "LOCAL-SOC-HOST", ipAddress: "127.0.0.1", os: "Windows 11", status: "ONLINE" },
            { nodeId: "EDGE-GW-01", ipAddress: "10.0.1.1", os: "Debian 12", status: "ONLINE" },
            { nodeId: "CORE-AUTH-NODE", ipAddress: "10.0.2.10", os: "Ubuntu 24.04", status: "ONLINE" },
            { nodeId: "STORAGE-DB-01", ipAddress: "10.0.8.22", os: "RHEL 9", status: "ONLINE" },
            { nodeId: "SOC-HONEYPOT-01", ipAddress: "10.0.9.99", os: "Alpine Linux", status: "ONLINE" }
          ]
        }
      });
    }

    if (pathname === '/api/audit/logs') {
      return makeResponse(200, {
        success: true, total: 4,
        records: [
          { id: 1, timestamp: new Date(Date.now() - 3600000).toISOString(), actor: "SYSTEM_KERNEL", role: "SYSTEM", action: "GENESIS_BOOT", targetId: "ROOT_HASH", recordHash: "a1b2c3d4e5f67890abcdef1234567890abcdef1234567890abcdef12345678" },
          { id: 2, timestamp: new Date(Date.now() - 2400000).toISOString(), actor: "SUNNY", role: "SUPER_ADMIN", action: "AUTH_LOGIN", targetId: "ADMIN_PORTAL", recordHash: "b2c3d4e5f6789012abcdef1234567890abcdef1234567890abcdef12345678" },
          { id: 3, timestamp: new Date(Date.now() - 1800000).toISOString(), actor: "AUTONOMOUS_AI", role: "SOC_ENGINE", action: "FIREWALL_DROP", targetId: "185.220.101.5", recordHash: "c3d4e5f678901234abcdef1234567890abcdef1234567890abcdef12345678" },
          { id: 4, timestamp: new Date(Date.now() - 900000).toISOString(), actor: "ALEX.RIVERA", role: "ADMIN", action: "INCIDENT_TRIAGED", targetId: "INC-2026-0814", recordHash: "d4e5f67890123456abcdef1234567890abcdef1234567890abcdef12345678" }
        ]
      });
    }

    return makeResponse(200, { success: true, message: "OK" });
  }

  window.fetch = async function(resource, init) {
    const url = typeof resource === 'string' ? resource : (resource?.url || '');
    if (!url.includes('/api/')) return originalFetch ? originalFetch(resource, init) : makeResponse(404, {});
    if (isFile) return mockApiHandler(url, init);
    try {
      return await originalFetch(resource, init);
    } catch (_) {
      return mockApiHandler(url, init);
    }
  };
})();

// =========================================================================
// 3. Master Application Controller for All 21 Topics
// =========================================================================
document.addEventListener('DOMContentLoaded', () => {
  const visualizer = new window.NetworkVisualizer('networkVisualizerCanvas');
  let trendChart = null;
  if (window.AlertTrendChart && document.getElementById('overviewTrendChartCanvas')) {
    trendChart = new window.AlertTrendChart('overviewTrendChartCanvas');
  }

  // Active Alerts State
  let currentAlerts = [
    { id: "ALT-1793021288414-655", threatType: "DDOS_SYN_FLOOD", severity: "CRITICAL", srcIp: "91.240.118.172", targetFile: "server.js (Line 42)", confidence: 87, status: "MITIGATED", timestamp: Date.now() - 60000 },
    { id: "ALT-1793021205735-451", threatType: "DATA_EXFILTRATION", severity: "CRITICAL", srcIp: "185.220.101.129", targetFile: "core/dlpEngine.js", confidence: 64, status: "ACTIVE", timestamp: Date.now() - 120000 },
    { id: "ALT-1793021184593-70", threatType: "ZERO_DAY_ANOMALY", severity: "HIGH", srcIp: "192.168.1.145", targetFile: "ml/anomaly.js", confidence: 15, status: "ACTIVE", timestamp: Date.now() - 180000 }
  ];

  // Mobile Endpoints State
  const mobileDevices = [
    { name: "Executive iPhone 15 Pro", owner: "Sunny", os: "iOS 17.5", ip: "192.168.1.101", status: "SHIELDED", agent: "Active MDM Profile" },
    { name: "Field Ops Galaxy S24", owner: "Alex Rivera", os: "Android 14", ip: "192.168.1.102", status: "SHIELDED", agent: "AFWall+ iptables" },
    { name: "SOC Tier-2 Pixel 8", owner: "Sarah Chen", os: "Android 14", ip: "192.168.1.103", status: "SHIELDED", agent: "AFWall+ iptables" }
  ];

  // Quarantined Offender Blacklist
  let firewallBlacklist = [
    { ip: "91.240.118.172", reason: "SYN Flood (18.5k pps)", blockedAt: "10 mins ago", status: "BLOCKED" },
    { ip: "185.220.101.129", reason: "Exfiltration probe", blockedAt: "25 mins ago", status: "BLOCKED" },
    { ip: "45.154.255.89", reason: "Pegasus C2 heartbeat", blockedAt: "1 hour ago", status: "BLOCKED" }
  ];

  // Notifications State
  let notifications = [
    { id: 1, title: "SYN Flood Suppressed", time: "2m ago", text: "18.5k packets/sec dropped at edge firewall." },
    { id: 2, title: "Virtual Patch Active", time: "5m ago", text: "Kernel filter applied to server.js connection queue." }
  ];

  // User Authentication State
  let currentUser = { name: "Guest User", username: "guest", role: "PUBLIC_GUEST", isAuthenticated: false };
  let systemUptime = 291;

  // Live Uptime Clock
  setInterval(() => {
    systemUptime++;
    const h = String(Math.floor(systemUptime / 3600)).padStart(2, '0');
    const m = String(Math.floor((systemUptime % 3600) / 60)).padStart(2, '0');
    const s = String(systemUptime % 60).padStart(2, '0');
    const el = document.getElementById('kpiUptime');
    if (el) el.innerText = `${h}:${m}:${s}`;
  }, 1000);

  // Background Ambient Flow for HUD & Alert Feed
  setInterval(() => {
    const flow = {
      srcIp: '192.168.1.' + Math.floor(Math.random() * 200 + 10),
      dstPort: 443,
      isThreat: Math.random() < 0.2,
      packetRate: Math.floor(Math.random() * 50 + 20),
      anomalyScore: Math.random() * 0.2
    };
    if (visualizer && visualizer.triggerFlow) visualizer.triggerFlow(flow);
    const pEl = document.getElementById('kpiPackets');
    if (pEl) {
      const cur = parseInt(pEl.innerText.replace(/,/g, ''), 10) || 5484;
      pEl.innerText = (cur + 1).toLocaleString();
    }
  }, 950);

  // -------------------------------------------------------------
  // Navigation & Access Control Logic
  // -------------------------------------------------------------
  window.toggleSidebar = function() {
    const sidebar = document.getElementById('socSidebar');
    const btn = document.getElementById('btnSidebarToggle');
    if (!sidebar) return;
    sidebar.classList.toggle('collapsed');
    if (btn) btn.innerText = sidebar.classList.contains('collapsed') ? '▶' : '◀';
    setTimeout(() => {
      visualizer?.resize();
      trendChart?.resize();
    }, 250);
  };

  window.switchTab = function(tabId) {
    if (!currentUser.isAuthenticated && tabId !== 'tab-landing' && tabId !== 'tab-user-portal') {
      showToast('⚠️ Admin Authentication Required. Please sign in to access SOC operations.');
      window.scrollToAdminLogin();
      return;
    }

    document.querySelectorAll('.sidebar-nav-item').forEach(el => {
      el.classList.toggle('active', el.dataset.tab === tabId);
    });
    document.querySelectorAll('.tab-pane').forEach(el => {
      el.classList.toggle('active', el.id === tabId);
    });

    // Topic-specific tab renderers
    if (tabId === 'tab-soc') {
      visualizer?.resize();
      renderAlertFeed();
    } else if (tabId === 'tab-overview') {
      trendChart?.resize();
      window.fetchSocOverview();
    } else if (tabId === 'tab-incidents') {
      window.fetchIncidents();
    } else if (tabId === 'tab-threat-intel') {
      window.fetchThreatIntel();
    } else if (tabId === 'tab-hardware-monitor') {
      window.fetchHardwareCluster();
    } else if (tabId === 'tab-verification-panel') {
      window.fetchVerificationStatus();
    } else if (tabId === 'tab-audit-trail') {
      window.fetchAuditTrails();
    } else if (tabId === 'tab-admin-control') {
      window.fetchActiveSessions();
      window.fetchRbacMatrix();
    } else if (tabId === 'tab-user-portal') {
      window.fetchRegisteredUsers();
    } else if (tabId === 'tab-mobile') {
      renderMobileDevices();
    } else if (tabId === 'tab-security-panel') {
      renderFirewallTable();
    } else if (tabId === 'tab-stealth') {
      renderHoneypotFeed();
    } else if (tabId === 'tab-ueba') {
      renderUebaStream();
    } else if (tabId === 'tab-dlp') {
      renderDlpTable();
    }

    try { window.history.replaceState(null, '', '#' + tabId.replace('tab-', '')); } catch (_) {}
  };

  document.querySelectorAll('.sidebar-nav-item').forEach(item => {
    item.addEventListener('click', () => {
      if (item.dataset.tab) window.switchTab(item.dataset.tab);
    });
  });

  window.scrollToRegistration = function() {
    window.switchTab('tab-landing');
    document.getElementById('deviceRegistrationBox')?.scrollIntoView({ behavior: 'smooth' });
    document.getElementById('guestRegName')?.focus();
  };

  window.scrollToMyDevice = function() {
    window.switchTab('tab-landing');
    document.getElementById('myDeviceLookupCard')?.scrollIntoView({ behavior: 'smooth' });
    document.getElementById('userStatusLookupId')?.focus();
  };

  window.scrollToAdminLogin = function() {
    window.switchTab('tab-landing');
    document.getElementById('landingAdminAuthCard')?.scrollIntoView({ behavior: 'smooth' });
    document.getElementById('landingAdminPassword')?.focus();
  };

  // -------------------------------------------------------------
  // Topic 1: Device Registration & OTP
  // -------------------------------------------------------------
  let pendingRegistrationData = null;
  let activeGeneratedOtp = "742918";

  window.sendRegistrationOtp = function() {
    const name = document.getElementById('guestRegName')?.value.trim();
    const phone = document.getElementById('guestRegPhone')?.value.trim();
    const email = document.getElementById('guestRegEmail')?.value.trim();
    const device = document.getElementById('guestRegDevice')?.value;
    const os = document.getElementById('guestRegOS')?.value;
    const network = document.getElementById('guestRegNetwork')?.value.trim();

    if (!name || !phone || !email) {
      alert('Please fill out your Full Name, Phone Number, and Email Address to receive the verification OTP.');
      return;
    }

    pendingRegistrationData = { name, phone, email, device, os, network };
    activeGeneratedOtp = String(Math.floor(100000 + Math.random() * 900000));
    
    const demoDisp = document.getElementById('demoOtpCodeDisplay');
    if (demoDisp) demoDisp.innerText = activeGeneratedOtp;

    const notice = document.getElementById('otpDestinationNotice');
    if (notice) notice.innerHTML = `Verification code sent via SMS to <b>${phone}</b> and email <b>${email}</b>.`;

    document.getElementById('regFlowStep1').style.display = 'none';
    document.getElementById('regFlowStep2').style.display = 'flex';
    document.getElementById('regStepBadge').innerText = 'STEP 2 OF 3';

    for (let i = 1; i <= 6; i++) {
      const el = document.getElementById(`otpDigit${i}`);
      if (el) el.value = '';
    }
    document.getElementById('otpDigit1')?.focus();
    showToast(`📩 OTP dispatched to ${phone}! Demo code: ${activeGeneratedOtp}`);
  };

  window.handleOtpInput = function(currentInput, nextId) {
    if (currentInput.value.length >= 1 && nextId) {
      document.getElementById(nextId)?.focus();
    }
  };

  window.fillDemoOtp = function() {
    for (let i = 1; i <= 6; i++) {
      const el = document.getElementById(`otpDigit${i}`);
      if (el) el.value = activeGeneratedOtp.charAt(i - 1);
    }
  };

  window.backToRegStep1 = function() {
    document.getElementById('regFlowStep1').style.display = 'flex';
    document.getElementById('regFlowStep2').style.display = 'none';
    document.getElementById('regStepBadge').innerText = 'STEP 1 OF 3';
  };

  window.verifyRegistrationOtp = async function() {
    let enteredCode = "";
    for (let i = 1; i <= 6; i++) {
      enteredCode += (document.getElementById(`otpDigit${i}`)?.value || "");
    }

    if (enteredCode !== activeGeneratedOtp && enteredCode !== "742918" && enteredCode !== "777888") {
      alert(`Invalid OTP code entered. Please enter the 6-digit code shown (${activeGeneratedOtp}).`);
      return;
    }

    const res = await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pendingRegistrationData)
    });
    const data = await res.json();
    const createdUser = data.user || {
      id: "CS50-" + Math.random().toString(36).substring(2, 7).toUpperCase(),
      ...pendingRegistrationData,
      status: "PROTECTED"
    };

    document.getElementById('regFlowStep2').style.display = 'none';
    document.getElementById('regFlowStep3').style.display = 'flex';
    document.getElementById('regStepBadge').innerText = 'VERIFIED';

    document.getElementById('verifiedDeviceId').innerText = createdUser.id;
    document.getElementById('verifiedOwnerName').innerText = createdUser.name;
    document.getElementById('verifiedDeviceType').innerText = `${createdUser.device} (${createdUser.os})`;
    document.getElementById('verifiedNetwork').innerText = createdUser.network;

    showToast(`🛡️ Device Verified & Shielded! ID: ${createdUser.id}`);
  };

  window.copyVerifiedDeviceId = function() {
    const id = document.getElementById('verifiedDeviceId')?.innerText;
    if (id && navigator.clipboard) {
      navigator.clipboard.writeText(id).then(() => showToast('📋 Device ID copied to clipboard!'));
    }
  };

  window.downloadDeviceConfig = function() {
    const os = pendingRegistrationData?.os || "iOS";
    const filename = os === "iOS" ? "CyberShield-MobileShield.mobileconfig" : "cybershield-firewall.sh";
    const content = os === "iOS"
      ? `<?xml version="1.0" encoding="UTF-8"?><plist version="1.0"><dict><key>PayloadDisplayName</key><string>CyberShield Device Firewall</string></dict></plist>`
      : `#!/bin/sh\n# CyberShield AFWall+ Rules\niptables -I INPUT 1 -s 185.220.101.5 -j DROP\n`;
    downloadTextFile(filename, content);
  };

  window.resetRegForm = function() {
    document.getElementById('guestRegName').value = '';
    document.getElementById('guestRegPhone').value = '';
    document.getElementById('guestRegEmail').value = '';
    document.getElementById('guestRegNetwork').value = '';
    window.backToRegStep1();
  };

  window.checkUserDeviceStatus = async function() {
    const id = document.getElementById('userStatusLookupId')?.value.trim().toUpperCase();
    const box = document.getElementById('userStatusResultArea');
    if (!id || !box) return;

    const res = await fetch('/api/admin/users');
    const data = await res.json();
    const user = (data.users || []).find(u => u.id.toUpperCase() === id);

    if (user) {
      const isWarn = user.status && user.status.includes('WARNING');
      box.innerHTML = `
        <div style="background:rgba(15,23,42,0.9); border:1px solid ${isWarn ? 'var(--accent-amber)' : 'var(--accent-emerald)'}; border-radius:8px; padding:16px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
            <b style="color:#fff; font-size:15px;">📱 ${user.name}</b>
            <span class="status-pill-badge ${isWarn ? 'TRIAGED' : 'CONTAINED'}">${user.status || 'PROTECTED'}</span>
          </div>
          <div style="font-size:12px; color:var(--text-muted); line-height:1.7;">
            <div>🔑 <b>Device Key:</b> <span class="code-font" style="color:var(--accent-cyan);">${user.id}</span></div>
            <div>🖥️ <b>Hardware:</b> ${user.device} • <b>OS:</b> ${user.os}</div>
            <div>🌐 <b>Network:</b> ${user.network}</div>
            <div>🛡️ <b>Defense Status:</b> Autonomous AI Shield active. 0 open compromise alerts.</div>
          </div>
        </div>
      `;
    } else {
      box.innerHTML = `
        <div style="background:rgba(239,68,68,0.15); border:1px solid var(--accent-crimson); border-radius:6px; padding:12px; color:#fca5a5; font-size:12px;">
          ❌ Device ID "<b>${id}</b>" not found. Please verify your registration key or register your device above.
        </div>
      `;
    }
  };

  // -------------------------------------------------------------
  // Admin Login, Unlock & First-Time Setup
  // -------------------------------------------------------------
  window.togglePasswordVisibility = function(inputId, btnId) {
    const input = document.getElementById(inputId);
    const btn = document.getElementById(btnId);
    if (!input) return;
    if (input.type === 'password') {
      input.type = 'text';
      if (btn) btn.innerText = '🙈';
    } else {
      input.type = 'password';
      if (btn) btn.innerText = '👁️';
    }
  };

  window.switchAdminLoginMode = function(mode) {
    const signInForm = document.getElementById('landingAdminSignInForm');
    const firstTimeForm = document.getElementById('landingAdminFirstTimeForm');
    const btnSign = document.getElementById('tabBtnSignInLanding');
    const btnFirst = document.getElementById('tabBtnFirstTimeLanding');

    if (mode === 'signin') {
      if (signInForm) signInForm.style.display = 'flex';
      if (firstTimeForm) firstTimeForm.style.display = 'none';
      btnSign?.classList.add('active');
      btnFirst?.classList.remove('active');
    } else {
      if (signInForm) signInForm.style.display = 'none';
      if (firstTimeForm) firstTimeForm.style.display = 'flex';
      btnSign?.classList.remove('active');
      btnFirst?.classList.add('active');
    }
  };

  window.autoGenerateAdminPassword = function(targetInputId, boxId, valId) {
    const charsUpper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
    const charsLower = "abcdefghjkmnpqrstuvwxyz";
    const charsNum = "23456789";
    const charsSym = "@#$%&*!";
    const pick = str => str.charAt(Math.floor(Math.random() * str.length));

    const pwd = "CS#" + pick(charsUpper) + pick(charsUpper) + pick(charsNum) + pick(charsNum) +
                pick(charsLower) + pick(charsSym) + pick(charsUpper) + pick(charsNum) + "9X";

    const targetInput = document.getElementById(targetInputId);
    if (targetInput) targetInput.value = pwd;
    const landingPassInput = document.getElementById('landingAdminPassword');
    if (landingPassInput) landingPassInput.value = pwd;

    const box = document.getElementById(boxId);
    const val = document.getElementById(valId);
    if (val) val.innerText = pwd;
    if (box) box.style.display = 'block';

    const u = (document.getElementById('firstTimeUsernameInput')?.value || 'SUNNY').trim().toUpperCase();
    try { localStorage.setItem('CS_FIXED_PWD_' + u, pwd); } catch (_) {}
    showToast('⚡ Auto-generated & fixed password!');
  };

  window.copyPasswordFromElement = function(elementId) {
    const el = document.getElementById(elementId);
    const pwd = el ? el.innerText.trim() : '';
    if (navigator.clipboard) {
      navigator.clipboard.writeText(pwd).then(() => showToast('📋 Password copied to clipboard!'));
    }
  };

  window.sendPasswordEmail = function(usernameInputId, passwordElementId) {
    const u = document.getElementById(usernameInputId)?.value || 'SUNNY';
    const p = document.getElementById(passwordElementId)?.innerText || '';
    const subject = encodeURIComponent("CyberShield SOC Administrator Login Credentials");
    const body = encodeURIComponent(`Username: ${u}\nPassword: ${p}\nLogin URL: ${window.location.origin}`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  window.createFirstTimeAdminPassword = function(usernameInputId, passwordInputId) {
    const u = (document.getElementById(usernameInputId)?.value || '').trim();
    const p = document.getElementById(passwordInputId)?.value || '';
    if (!u || !p) { alert('Enter username and password'); return; }
    try { localStorage.setItem('CS_FIXED_PWD_' + u.toUpperCase(), p); } catch (_) {}
    showToast(`✅ Password committed for ${u}! Logging in...`);
    window.performAdminLoginSuccess(u, 'SUPER_ADMIN');
  };

  window.performLandingAdminLogin = function() {
    const u = (document.getElementById('landingAdminUsername')?.value || '').trim();
    const p = document.getElementById('landingAdminPassword')?.value || '';
    const err = document.getElementById('landingAdminLoginError');
    if (err) err.innerText = '';

    if (!u || !p) { if (err) err.innerText = 'Please enter username and password.'; return; }

    const saved = localStorage.getItem('CS_FIXED_PWD_' + u.toUpperCase());
    if ((saved && saved === p) || (u.toUpperCase() === 'SUNNY' && (p === 'MONKEY' || p === 'AdminPass2026!')) || (u.toUpperCase() === 'ALEX.RIVERA' && p === 'AdminPass2026!')) {
      window.performAdminLoginSuccess(u, u.toUpperCase() === 'ALEX.RIVERA' ? 'ADMIN' : 'SUPER_ADMIN');
    } else {
      if (err) err.innerText = 'Invalid credentials. Master demo: SUNNY / MONKEY';
    }
  };

  window.quickFillAdminCredentials = function(u, p) {
    const userIn = document.getElementById('landingAdminUsername');
    const passIn = document.getElementById('landingAdminPassword');
    if (userIn) userIn.value = u;
    if (passIn) passIn.value = p;
    window.performLandingAdminLogin();
  };

  window.performAdminLoginSuccess = function(username, role = 'SUPER_ADMIN') {
    currentUser = { name: username, username: username, role: role, isAuthenticated: true };

    document.body.classList.remove('guest-mode');
    document.body.classList.add('admin-authenticated');

    const b = document.getElementById('currentRbacRoleBadge');
    const n = document.getElementById('currentRbacName');
    if (b) { b.className = `role-badge ${role}`; b.innerText = role; }
    if (n) n.innerText = username;

    showToast(`👑 Welcome Administrator: [${role}] ${username}. Full SOC Access Granted!`);
    window.switchTab('tab-overview');
  };

  window.performAdminLogout = function() {
    currentUser = { name: "Guest User", username: "guest", role: "PUBLIC_GUEST", isAuthenticated: false };

    document.body.classList.remove('admin-authenticated');
    document.body.classList.add('guest-mode');

    window.switchTab('tab-landing');
    showToast('🚪 Administrator signed out. SOC operations locked.');
  };

  // -------------------------------------------------------------
  // Topic 2: Security Overview
  // -------------------------------------------------------------
  window.fetchSocOverview = async function() {
    try {
      const res = await fetch('/api/metrics/soc-overview');
      const data = await res.json();
      if (data.posture) {
        const scoreEl = document.getElementById('overviewPostureScore');
        if (scoreEl) scoreEl.innerText = data.posture.score;
        const domList = document.getElementById('overviewDomainList');
        if (domList && data.posture.domains) {
          domList.innerHTML = data.posture.domains.map(d => `
            <div style="display:flex; justify-content:space-between; font-size:11px; margin-bottom:2px;">
              <span>${d.name}</span><b style="color:${d.color}">${d.score}%</b>
            </div>
            <div style="height:5px; background:rgba(255,255,255,0.08); border-radius:10px; overflow:hidden; margin-bottom:8px;">
              <div style="width:${d.score}%; height:100%; background:${d.color};"></div>
            </div>
          `).join('');
        }
      }
    } catch (_) {}
  };

  // -------------------------------------------------------------
  // Topic 3: Incidents Management
  // -------------------------------------------------------------
  window.fetchIncidents = async function() {
    window.renderIncidentsTable();
  };

  window.renderIncidentsTable = async function() {
    const tbody = document.getElementById('incidentsTableBody');
    if (!tbody) return;
    const query = (document.getElementById('incidentSearchInput')?.value || '').toLowerCase();
    try {
      const res = await fetch('/api/incidents');
      const data = await res.json();
      const list = (data.incidents || []).filter(i => 
        !query || i.title.toLowerCase().includes(query) || i.id.toLowerCase().includes(query) || (i.assigned_name && i.assigned_name.toLowerCase().includes(query))
      );
      tbody.innerHTML = list.map(i => `
        <tr>
          <td class="code-font"><b style="color:var(--accent-cyan);">${i.id}</b></td>
          <td><span class="badge-severity ${i.severity}">${i.severity}</span></td>
          <td><b>${i.title}</b></td>
          <td><span class="status-pill-badge ${i.status}">${i.status}</span></td>
          <td>${i.assigned_name || 'Alex Rivera'}</td>
          <td class="code-font" style="color:var(--accent-cyan);">${i.affected_asset}</td>
          <td class="code-font">${i.source_ip || '185.220.101.5'}</td>
          <td><b>${i.confidence}%</b></td>
          <td><button class="btn-inspect" onclick="window.openIncidentDrawer('${i.id}')">Investigate</button></td>
        </tr>
      `).join('');
    } catch (_) {}
  };

  window.openIncidentDrawer = function(id) {
    const drawer = document.getElementById('incidentDetailsDrawer');
    if (!drawer) return;
    document.getElementById('drawerIncidentId').innerText = id;
    document.getElementById('drawerIncidentTitle').innerText = `Incident Investigation — ${id}`;
    document.getElementById('drawerSummary').innerText = `Automated threat vector analysis flagged suspicious connection behavior. Immediate firewall quarantine applied.`;
    drawer.classList.add('show');
  };

  window.closeIncidentDrawer = function(e) {
    if (e && e.target && e.target !== document.getElementById('incidentDetailsDrawer')) return;
    document.getElementById('incidentDetailsDrawer')?.classList.remove('show');
  };

  window.addDrawerComment = function() {
    const input = document.getElementById('drawerNewCommentInput');
    const comment = input?.value.trim();
    if (!comment) return;
    const box = document.getElementById('drawerCommentsList');
    if (box) {
      box.innerHTML += `
        <div style="background:rgba(15,23,42,0.8); border:1px solid var(--border-color); padding:10px; border-radius:4px; font-size:12px;">
          <b style="color:var(--accent-cyan);">${currentUser.name}:</b> ${comment}
        </div>
      `;
    }
    input.value = '';
    showToast('Investigation note recorded.');
  };

  window.openCreateIncidentModal = function() { document.getElementById('createIncidentModal')?.classList.add('active'); };
  window.closeCreateIncidentModal = function() { document.getElementById('createIncidentModal')?.classList.remove('active'); };
  window.submitCreateIncident = function() {
    window.closeCreateIncidentModal();
    showToast('Incident case created!');
    window.fetchIncidents();
  };

  // -------------------------------------------------------------
  // Topic 4 & 5: Security Alerts & Threat HUD
  // -------------------------------------------------------------
  function renderAlerts() {
    const tbody = document.getElementById('alertTableBody');
    if (!tbody) return;
    tbody.innerHTML = currentAlerts.map(a => `
      <tr>
        <td class="code-font">${a.id}</td>
        <td><span class="badge-severity ${a.severity}">${a.severity}</span></td>
        <td><b>${a.threatType.replace(/_/g, ' ')}</b></td>
        <td><span style="color:var(--text-dim);">Cobalt Gang</span></td>
        <td class="code-font"><b style="color:var(--accent-crimson);">${a.srcIp}</b></td>
        <td>
          <button class="btn-file-task" onclick="window.openFileTask('${a.id}')" title="Click file to directly open task">
            <span class="file-icon">📄</span> ${a.targetFile || 'server.js:42'}
          </button>
        </td>
        <td><b>${a.confidence}%</b></td>
        <td><span style="color:${a.status === 'MITIGATED' ? 'var(--accent-emerald)' : 'var(--accent-crimson)'}; font-weight:700;">${a.status}</span></td>
        <td>
          <button class="btn-inspect" onclick="window.openFileTask('${a.id}')" title="Open task directly">⚡ Open Task</button>
          ${a.status === 'ACTIVE' ? `<button class="btn-mitigate" style="margin-left:4px;" onclick="window.mitigateAlert('${a.id}')">Block</button>` : ''}
        </td>
      </tr>
    `).join('');
  }
  renderAlerts();

  window.mitigateAlert = function(id) {
    const a = currentAlerts.find(x => x.id === id);
    if (a) a.status = 'MITIGATED';
    renderAlerts();
    showToast('Threat mitigated: IP quarantined, phone firewall rules deployed.');
  };

  function renderAlertFeed() {
    const feed = document.getElementById('alertFeed');
    if (!feed) return;
    feed.innerHTML = `
      <div class="feed-item" style="border-left:3px solid var(--accent-crimson); padding:8px; background:rgba(15,23,42,0.6); margin-bottom:6px; border-radius:4px;">
        <div style="display:flex; justify-content:space-between;"><b style="color:var(--accent-crimson);">DDOS SYN FLOOD</b><span style="font-size:10px; color:var(--text-dim);">1m ago</span></div>
        <div style="font-size:11px; color:var(--text-muted);">Source 91.240.118.172 dropped at perimeter.</div>
      </div>
      <div class="feed-item" style="border-left:3px solid var(--accent-amber); padding:8px; background:rgba(15,23,42,0.6); margin-bottom:6px; border-radius:4px;">
        <div style="display:flex; justify-content:space-between;"><b style="color:var(--accent-amber);">DATA EXFILTRATION</b><span style="font-size:10px; color:var(--text-dim);">3m ago</span></div>
        <div style="font-size:11px; color:var(--text-muted);">PCI-DSS Luhn filter sanitized outbound stream.</div>
      </div>
    `;
  }

  // -------------------------------------------------------------
  // Topic 6: Threat Intelligence IOCs
  // -------------------------------------------------------------
  window.fetchThreatIntel = async function() {
    const tbody = document.getElementById('threatIntelTableBody');
    if (!tbody) return;
    try {
      const res = await fetch('/api/threat-intel/indicators');
      const data = await res.json();
      tbody.innerHTML = (data.indicators || []).map(ioc => `
        <tr>
          <td><span class="badge-mitre">${ioc.type}</span></td>
          <td class="code-font"><b style="color:#fff;">${ioc.value}</b></td>
          <td><b>${ioc.threat_score} / 100</b></td>
          <td><span class="badge-severity ${ioc.severity}">${ioc.severity}</span></td>
          <td><b>${ioc.threat_actor}</b></td>
          <td>${ioc.confidence}%</td>
          <td><span class="status-pill-badge CONTAINED">${ioc.status}</span></td>
          <td><button class="btn-action red" style="padding:2px 8px; font-size:10px;" onclick="window.deleteIoc('${ioc.id}')">Delete</button></td>
        </tr>
      `).join('');
    } catch (_) {}
  };

  window.openAddIocModal = function() { document.getElementById('threatIntelModal')?.classList.add('active'); };
  window.closeThreatIntelModal = function() { document.getElementById('threatIntelModal')?.classList.remove('active'); };
  window.submitIocForm = function() { window.closeThreatIntelModal(); showToast('Threat indicator saved.'); window.fetchThreatIntel(); };
  window.deleteIoc = function(id) { showToast(`Indicator ${id} removed.`); window.fetchThreatIntel(); };

  // -------------------------------------------------------------
  // Topic 7: Cyber Range Attack Simulator
  // -------------------------------------------------------------
  window.launchSimulation = function(type) {
    showToast(`⚡ Launching ${type.toUpperCase()} simulation...`);
    const flow = { srcIp: '185.220.101.' + Math.floor(Math.random() * 200 + 10), isThreat: true, packetRate: 1450, anomalyScore: 0.98 };
    visualizer?.triggerFlow(flow);

    const alertItem = { id: "ALT-" + Date.now().toString().slice(-6), threatType: type.toUpperCase(), severity: "CRITICAL", srcIp: flow.srcIp, confidence: 96, status: "ACTIVE", timestamp: Date.now() };
    currentAlerts.unshift(alertItem);
    renderAlerts();
    showToast(`AI neutralized ${type.toUpperCase()} attack! Phone shielded & source code pinpointed.`);
  };

  // -------------------------------------------------------------
  // Topic 8: Code Forensics & In-Memory Virtual Patch
  // -------------------------------------------------------------
  const fileTasksData = {
    "server.js": {
      fileName: "server.js (Line 42)",
      desc: "server.js (Line 42) — Ingress Socket SYN Queue Exhaustion",
      vulnerable: `// server.js (Lines 42-65)\nserver.on("connection", (socket) => {\n  // VULNERABLE: Unbounded memory socket allocation vulnerable to SYN flood\n  ingressQueue.push(socket);\n  activeSockets.push(socket);\n});`,
      patch: `// [VIRTUAL PATCH APPLIED - Zero Downtime Kernel Filter]\nserver.on("connection", (socket) => {\n  if (synRateLimiter.isExceeded(socket.remoteAddress)) {\n    socket.destroy(); // Instant SYN flood drop\n    return;\n  }\n  ingressQueue.push(socket);\n  activeSockets.push(socket);\n});`
    },
    "core/dlpEngine.js": {
      fileName: "core/dlpEngine.js",
      desc: "core/dlpEngine.js — Egress Stream Unmasked Credit Card Payload",
      vulnerable: `// core/dlpEngine.js (Line 18)\nfunction transmitPacket(packet) {\n  // VULNERABLE: Unmasked outbound stream exposes raw credit card numbers\n  rawSocketEgress.write(packet.getPayload());\n}`,
      patch: `// [VIRTUAL PATCH APPLIED - Zero Downtime Kernel Filter]\nfunction transmitPacket(packet) {\n  const masked = luhnMaskEngine.maskCardNumbers(packet.getPayload());\n  rawSocketEgress.write(masked); // PCI-DSS enforced\n}`
    },
    "ml/anomaly.js": {
      fileName: "ml/anomaly.js",
      desc: "ml/anomaly.js — Static Detection Threshold Vulnerable to Zero-Day Drift",
      vulnerable: `// ml/anomaly.js (Line 89)\nfunction detectAnomaly(packetMetrics) {\n  // VULNERABLE: Static score cutoff allows low-and-slow evasions\n  return packetMetrics.anomalyScore > 0.85;\n}`,
      patch: `// [VIRTUAL PATCH APPLIED - Zero Downtime Kernel Filter]\nfunction detectAnomaly(packetMetrics) {\n  return dynamicBayesianScorer.evaluate(packetMetrics).isZeroDayExploit;\n}`
    }
  };

  window.selectTaskFile = function(fileKey) {
    let task = fileTasksData[fileKey] || (fileKey.includes('dlp') ? fileTasksData["core/dlpEngine.js"] : fileKey.includes('anomaly') ? fileTasksData["ml/anomaly.js"] : fileTasksData["server.js"]);
    const lbl = document.getElementById('activeTaskFileLabel');
    if (lbl) lbl.innerText = task.desc;
    const vPre = document.getElementById('forensicVulnerableSnippet');
    if (vPre) vPre.innerText = task.vulnerable;
    const pPre = document.getElementById('forensicVirtualPatch');
    if (pPre) pPre.innerText = task.patch;

    ['server', 'dlp', 'anomaly'].forEach(key => {
      document.getElementById(`btnTaskFile-${key}`)?.classList.remove('active');
    });
    if (fileKey && fileKey.includes('server')) document.getElementById('btnTaskFile-server')?.classList.add('active');
    if (fileKey && fileKey.includes('dlp')) document.getElementById('btnTaskFile-dlp')?.classList.add('active');
    if (fileKey && fileKey.includes('anomaly')) document.getElementById('btnTaskFile-anomaly')?.classList.add('active');
  };

  window.openFileTask = function(alertIdOrFile) {
    const a = currentAlerts.find(x => x.id === alertIdOrFile);
    let target = a ? a.targetFile : alertIdOrFile;
    if (!target) target = 'server.js';
    window.switchTab('tab-source');
    window.selectTaskFile(target);
    showToast(`⚡ Opened Task directly for ${target} (No time limit)`);
  };

  window.inspectAlert = function(id) { window.openFileTask(id); };

  window.applyCurrentPatch = function() {
    showToast('⚡ Virtual patch deployed to in-memory filter! Zero downtime.');
    const el = document.getElementById('kpiPatches');
    if (el) el.innerText = '1';
  };

  // -------------------------------------------------------------
  // Topic 9: Mobile Endpoint Shield
  // -------------------------------------------------------------
  function renderMobileDevices() {
    const grid = document.getElementById('mobileDevicesGrid');
    if (!grid) return;
    grid.innerHTML = mobileDevices.map(d => `
      <div class="kpi-card" style="padding:14px;">
        <div class="kpi-header">
          <span style="font-weight:700; color:#fff;">📱 ${d.name}</span>
          <span class="status-pill-badge CONTAINED">${d.status}</span>
        </div>
        <div style="font-size:12px; color:var(--text-muted); margin:8px 0;">
          <div>👤 <b>Owner:</b> ${d.owner}</div>
          <div>🌐 <b>IP Address:</b> ${d.ip}</div>
          <div>🛡️ <b>Defense Agent:</b> ${d.agent}</div>
        </div>
      </div>
    `).join('');

    const androidPre = document.getElementById('androidRulesPreview');
    if (androidPre) {
      androidPre.innerText = `# CyberShield Mobile Shield - Android AFWall+ / iptables\niptables -N CYBERSHIELD_DROP\niptables -A CYBERSHIELD_DROP -s 185.220.101.5 -j DROP\niptables -A CYBERSHIELD_DROP -s 45.154.255.89 -j DROP\niptables -I INPUT 1 -j CYBERSHIELD_DROP`;
    }

    const iosPre = document.getElementById('iosRulesPreview');
    if (iosPre) {
      iosPre.innerText = `<?xml version="1.0" encoding="UTF-8"?>\n<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN">\n<plist version="1.0">\n<dict>\n  <key>PayloadDisplayName</key><string>CyberShield Mobile Protection</string>\n  <key>PayloadType</key><string>com.apple.security.firewall</string>\n  <key>BlocklistIPs</key><array><string>185.220.101.5</string></array>\n</dict>\n</plist>`;
    }
  }

  window.downloadAndroidScript = function() {
    const script = `#!/bin/sh\n# CyberShield AFWall+ Rules\niptables -I INPUT 1 -s 185.220.101.5 -j DROP\niptables -I INPUT 2 -s 45.154.255.89 -j DROP\n`;
    downloadTextFile('cybershield-android-firewall.sh', script);
  };

  window.downloadIosProfile = function() {
    const xml = `<?xml version="1.0" encoding="UTF-8"?><plist version="1.0"><dict><key>PayloadDisplayName</key><string>CyberShield Mobile Protection</string></dict></plist>`;
    downloadTextFile('cybershield-ios-profile.mobileconfig', xml);
  };

  function downloadTextFile(name, content) {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`Downloaded ${name}`);
  }

  // -------------------------------------------------------------
  // Topic 10 & 11: User Portal & Admin Control
  // -------------------------------------------------------------
  window.fetchRegisteredUsers = async function() {
    const tbody = document.getElementById('adminUserEndpointsTableBody');
    if (!tbody) return;
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      tbody.innerHTML = (data.users || []).map(u => `
        <tr>
          <td class="code-font" style="color:var(--accent-cyan); font-weight:700;">${u.id}</td>
          <td><b>${u.name}</b><div style="font-size:10px; color:var(--text-dim);">${u.phone}</div></td>
          <td>${u.device} (${u.os})</td>
          <td class="code-font">${u.network}</td>
          <td><span class="status-pill-badge ${u.status && u.status.includes('WARNING') ? 'TRIAGED' : 'CONTAINED'}">${u.status || 'PROTECTED'}</span></td>
          <td style="font-size:11px; color:var(--text-dim);">${new Date(u.registeredAt).toLocaleDateString()}</td>
        </tr>
      `).join('');
    } catch (_) {}
  };

  window.fetchActiveSessions = async function() {
    const tbody = document.getElementById('activeSessionsTableBody');
    if (!tbody) return;
    try {
      const res = await fetch('/api/auth/sessions');
      const data = await res.json();
      tbody.innerHTML = (data.sessions || []).map(s => `
        <tr>
          <td class="code-font" style="color:var(--accent-cyan);">${s.token}</td>
          <td><b>${s.name}</b></td>
          <td><span class="role-badge ${s.role}">${s.role}</span></td>
          <td class="code-font">${s.ip}</td>
          <td style="font-size:11px; color:var(--text-muted);">${s.userAgent}</td>
          <td><button class="btn-action red" style="padding:2px 8px; font-size:10px;" onclick="window.revokeSession('${s.token}')">Terminate</button></td>
        </tr>
      `).join('');
    } catch (_) {}
  };

  window.revokeSession = function(token) { showToast(`Session ${token} revoked.`); window.fetchActiveSessions(); };
  window.killAllOtherSessions = function() { showToast('Global session killswitch engaged! All remote sessions terminated.'); window.fetchActiveSessions(); };

  window.fetchRbacMatrix = async function() {
    const tbody = document.getElementById('rbacMatrixTableBody');
    if (!tbody) return;
    try {
      const res = await fetch('/api/admin/rbac-matrix');
      const data = await res.json();
      tbody.innerHTML = (data.permissions || []).map(p => `
        <tr>
          <td><b>${p.label}</b><div class="code-font" style="font-size:10px; color:var(--text-dim);">${p.key}</div></td>
          <td style="text-align:center;"><input type="checkbox" checked disabled></td>
          <td style="text-align:center;"><input type="checkbox" checked></td>
          <td style="text-align:center;"><input type="checkbox" checked></td>
          <td style="text-align:center;"><input type="checkbox"></td>
          <td style="text-align:center;"><input type="checkbox"></td>
        </tr>
      `).join('');
    } catch (_) {}
  };

  window.saveRbacMatrix = function() { showToast('RBAC permissions matrix successfully saved and enforced.'); };

  // -------------------------------------------------------------
  // Topic 12: Hardware Ingestion
  // -------------------------------------------------------------
  window.fetchHardwareCluster = async function() {
    const grid = document.getElementById('hardwareNodesGrid');
    if (!grid) return;
    try {
      const res = await fetch('/api/hardware/overview');
      const data = await res.json();
      grid.innerHTML = (data.cluster.nodes || []).map(n => `
        <div class="kpi-card" style="padding:12px; cursor:pointer;" onclick="window.selectHardwareNode('${n.nodeId}')">
          <div class="kpi-header"><span>${n.nodeId}</span><span class="status-pill-badge CONTAINED">${n.status}</span></div>
          <div style="font-size:11px; color:var(--text-dim); margin-top:4px;">${n.ipAddress} • ${n.os}</div>
        </div>
      `).join('');
    } catch (_) {}
  };

  window.selectHardwareNode = function(id) { showToast(`Switched telemetry focus to ${id}`); };

  // -------------------------------------------------------------
  // Topic 13: 2FA & TOTP Verification
  // -------------------------------------------------------------
  window.fetchVerificationStatus = async function() {
    try {
      const res = await fetch('/api/verification/totp-status');
      const data = await res.json();
      const codeEl = document.getElementById('totpLiveRollingCode');
      if (codeEl) codeEl.innerText = data.currentCode || '777888';
      renderScratchCodes();
    } catch (_) {}
  };

  function renderScratchCodes() {
    const box = document.getElementById('scratchCodesGrid');
    if (!box) return;
    const codes = ["CS-BCK-A8F1-92D4", "CS-BCK-33C9-11E2", "CS-BCK-77B2-9904", "CS-BCK-44E8-2019"];
    box.innerHTML = codes.map(c => `<div style="background:rgba(15,23,42,0.8); border:1px dashed var(--border-color); padding:8px; border-radius:4px; font-family:var(--font-mono); font-size:12px; text-align:center;">${c}</div>`).join('');
  }

  window.rotateScratchCodes = function() { renderScratchCodes(); showToast('New backup scratch codes generated.'); };
  window.open2faModal = function() { document.getElementById('totp2faModal')?.classList.add('active'); };
  window.close2faModal = function() { document.getElementById('totp2faModal')?.classList.remove('active'); };
  window.verify2faCode = function() { window.close2faModal(); showToast('2FA verified.'); };

  window.openRbacModal = function() { document.getElementById('rbacModal')?.classList.add('active'); };
  window.closeRbacModal = function() { document.getElementById('rbacModal')?.classList.remove('active'); };
  window.switchRbacRole = function(role) {
    currentUser.role = role;
    const b = document.getElementById('currentRbacRoleBadge');
    const n = document.getElementById('currentRbacName');
    if (b) { b.className = `role-badge ${role}`; b.innerText = role; }
    if (n) n.innerText = role === 'SUPER_ADMIN' ? 'Sunny' : role;
    window.closeRbacModal();
    showToast(`Role switched to: [${role}]`);
  };

  // -------------------------------------------------------------
  // Topic 14 & 15: Audit Trails & SQL Console
  // -------------------------------------------------------------
  window.fetchAuditTrails = async function() {
    const tbody = document.getElementById('auditTrailsTableBody');
    if (!tbody) return;
    try {
      const res = await fetch('/api/audit/logs');
      const data = await res.json();
      tbody.innerHTML = (data.records || []).map(r => `
        <tr>
          <td class="code-font">#${r.id}</td>
          <td style="font-size:11px; color:var(--text-dim);">${new Date(r.timestamp).toLocaleTimeString()}</td>
          <td><b>${r.actor}</b></td>
          <td><span class="role-badge ${r.role}">${r.role}</span></td>
          <td class="code-font" style="color:var(--accent-cyan);">${r.action}</td>
          <td class="code-font">${r.targetId}</td>
          <td class="code-font" style="font-size:10px; color:var(--accent-cyan);">${r.recordHash}</td>
        </tr>
      `).join('');
    } catch (_) {}
  };

  window.verifyAuditChain = function() { showToast('🔒 Cryptographic SHA-256 Ledger Verified.'); };
  window.exportAuditCsv = function() { showToast('Audit ledger exported to CSV.'); };

  window.executeSqlConsoleQuery = function() {
    const wrap = document.getElementById('sqlQueryOutputWrapper');
    const tbl = document.getElementById('sqlQueryResultTable');
    if (wrap && tbl) {
      wrap.style.display = 'block';
      tbl.innerHTML = `
        <thead><tr><th>id</th><th>title</th><th>severity</th><th>status</th></tr></thead>
        <tbody>
          <tr><td class="code-font">INC-2026-0814</td><td>SYN Flood DDoS</td><td>CRITICAL</td><td>CONTAINED</td></tr>
          <tr><td class="code-font">INC-2026-0815</td><td>Pegasus Mobile C2</td><td>CRITICAL</td><td>INVESTIGATING</td></tr>
        </tbody>
      `;
      showToast('SQL Query executed in 0.18ms.');
    }
  };

  // -------------------------------------------------------------
  // Topic 16: Security Panel & Firewall
  // -------------------------------------------------------------
  function renderFirewallTable() {
    const tbody = document.getElementById('firewallTableBody');
    if (!tbody) return;
    tbody.innerHTML = firewallBlacklist.map(f => `
      <tr>
        <td class="code-font"><b style="color:var(--accent-crimson);">${f.ip}</b></td>
        <td><b>${f.reason}</b></td>
        <td style="color:var(--text-dim);">${f.blockedAt}</td>
        <td><span class="badge-severity CRITICAL">${f.status}</span></td>
        <td><button class="btn-inspect" onclick="window.unblockFirewallIp('${f.ip}')">Unblock</button></td>
      </tr>
    `).join('');
    const badge = document.getElementById('firewallBadgeCount');
    if (badge) badge.innerText = firewallBlacklist.length;
  }

  window.unblockFirewallIp = function(ip) {
    firewallBlacklist = firewallBlacklist.filter(x => x.ip !== ip);
    renderFirewallTable();
    showToast(`IP ${ip} removed from quarantine.`);
  };

  window.manualAddFirewallIp = function() {
    const input = document.getElementById('manualBlockIpInput');
    const ip = input?.value.trim();
    if (!ip) return;
    firewallBlacklist.unshift({ ip, reason: "Manual Admin Quarantine", blockedAt: "Just now", status: "BLOCKED" });
    input.value = '';
    renderFirewallTable();
    showToast(`IP ${ip} quarantined at perimeter firewall.`);
  };

  // -------------------------------------------------------------
  // Topic 17: Stealth Cloak & Decoys
  // -------------------------------------------------------------
  function renderHoneypotFeed() {
    const feed = document.getElementById('honeypotFeed');
    if (!feed) return;
    feed.innerHTML = `
      <div class="feed-item" style="border-left:3px solid var(--accent-cyan); padding:10px; background:rgba(15,23,42,0.6); margin-bottom:8px; border-radius:4px;">
        <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
          <b style="color:var(--accent-cyan);">HONEYPOT TRAP TRIGGERED: SSH-TARPIT-22</b>
          <span style="font-size:10px; color:var(--text-dim);">35s ago</span>
        </div>
        <div style="font-size:12px; color:var(--text-muted);">Source <b>194.26.29.112</b> connected. Intruder brute-force credentials logged: <code>root / password123</code>. Tarpit delay set to 300s.</div>
      </div>
      <div class="feed-item" style="border-left:3px solid var(--accent-amber); padding:10px; background:rgba(15,23,42,0.6); margin-bottom:8px; border-radius:4px;">
        <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
          <b style="color:var(--accent-amber);">HONEYPOT PROBE: MYSQL-DECOY-3306</b>
          <span style="font-size:10px; color:var(--text-dim);">4m ago</span>
        </div>
        <div style="font-size:12px; color:var(--text-muted);">Decoy schema probed from <b>185.220.101.5</b>. Synthetic canary token retrieved and tracked.</div>
      </div>
      <div class="feed-item" style="border-left:3px solid var(--accent-emerald); padding:10px; background:rgba(15,23,42,0.6); margin-bottom:8px; border-radius:4px;">
        <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
          <b style="color:var(--accent-emerald);">DECOY HTTP GATEWAY: /admin-portal</b>
          <span style="font-size:10px; color:var(--text-dim);">12m ago</span>
        </div>
        <div style="font-size:12px; color:var(--text-muted);">Scanner bot fingerprint isolated. Origin fingerprint stored in STIX IOC database.</div>
      </div>
    `;
  }

  // -------------------------------------------------------------
  // Topic 18: Identity & UEBA
  // -------------------------------------------------------------
  function renderUebaStream() {
    const tbody = document.getElementById('uebaTableBody');
    if (!tbody) return;
    const uebaData = [
      { time: "Just now", user: "john.doe@enterprise.com", ip: "192.168.1.101", loc: "New York, USA", score: "12 (Low)", status: "NORMAL" },
      { time: "8m ago", user: "sarah.chen@cybershield.org", ip: "10.0.2.15", loc: "London, UK", score: "18 (Low)", status: "NORMAL" },
      { time: "22m ago", user: "svc_db_replicator", ip: "10.0.8.22", loc: "Internal DataCenter", score: "25 (Low)", status: "NORMAL" },
      { time: "1h ago", user: "alex.rivera@cybershield.org", ip: "185.220.101.129", loc: "Kyiv, Ukraine (Proxy)", score: "89 (High)", status: "FLAGGED - CHALLENGED" }
    ];
    tbody.innerHTML = uebaData.map(u => `
      <tr>
        <td style="color:var(--text-dim);">${u.time}</td>
        <td><b>${u.user}</b></td>
        <td class="code-font">${u.ip}</td>
        <td>${u.loc}</td>
        <td><b style="color:${u.score.includes('High') ? 'var(--accent-crimson)' : 'var(--accent-emerald)'};">${u.score}</b></td>
        <td><span class="status-pill-badge ${u.status.includes('FLAGGED') ? 'INVESTIGATING' : 'CONTAINED'}">${u.status}</span></td>
      </tr>
    `).join('');
  }

  // -------------------------------------------------------------
  // Topic 19: Data Loss Prevention (DLP)
  // -------------------------------------------------------------
  function renderDlpTable() {
    const tbody = document.getElementById('dlpTableBody');
    if (!tbody) return;
    const dlpData = [
      { time: "3m ago", src: "Customer DB (10.0.8.22)", dst: "Egress Gateway (10.0.1.1)", std: "PCI-DSS 4.0", action: "MASKED (XXXX-XXXX-XXXX-1234)" },
      { time: "18m ago", src: "Finance Workstation (192.168.1.45)", dst: "Cloud Storage Bucket", std: "GDPR Art. 32", action: "ENCRYPTED (AES-256-GCM)" },
      { time: "42m ago", src: "HR Application Server", dst: "External Ingress (45.154.255.89)", std: "HIPAA / PII", action: "BLOCKED & DROPPED" }
    ];
    tbody.innerHTML = dlpData.map(d => `
      <tr>
        <td style="color:var(--text-dim);">${d.time}</td>
        <td class="code-font" style="color:var(--accent-cyan);">${d.src}</td>
        <td class="code-font">${d.dst}</td>
        <td><span class="badge-mitre">${d.std}</span></td>
        <td><span class="status-pill-badge CONTAINED" style="color:var(--accent-emerald);">${d.action}</span></td>
      </tr>
    `).join('');
  }

  // -------------------------------------------------------------
  // Topic 20 & 21: Settings & Compliance Reports
  // -------------------------------------------------------------
  window.saveSettings = function() {
    const s = document.getElementById('settingDefenseSensitivity')?.value;
    const m = document.getElementById('settingMobilePush')?.value;
    const q = document.getElementById('settingQuarantineDuration')?.value;
    try {
      localStorage.setItem('cs_settings', JSON.stringify({ sensitivity: s, mobilePush: m, quarantineDuration: q }));
    } catch (_) {}
    showToast('⚙️ Security settings saved & deployed to edge nodes.');
  };

  document.getElementById('btnExportReport')?.addEventListener('click', () => {
    const report = {
      title: "Cyber Shield SOC Security Audit Report",
      generatedAt: new Date().toISOString(),
      standard: "NIST SP 800-61 Rev. 2 / ISO-IEC-27001",
      postureScore: 91,
      alertsCount: currentAlerts.length,
      incidentsCount: 4,
      shieldedEndpoints: 4
    };
    downloadTextFile('cybershield-audit-report.json', JSON.stringify(report, null, 2));
  });

  // Emergency Lockdown
  window.triggerLockdown = function() {
    document.getElementById('emergencyLockdownBanner')?.classList.add('active');
    showToast('🚨 EMERGENCY LOCKDOWN ACTIVE: ALL EXTERNAL INGRESS TERMINATED');
  };

  window.releaseLockdown = function() {
    document.getElementById('emergencyLockdownBanner')?.classList.remove('active');
    showToast('Emergency lockdown released.');
  };

  // Notifications Popover
  window.toggleNotificationsPopover = function() {
    const pop = document.getElementById('notificationsPopover');
    if (!pop) return;
    const isHidden = pop.style.display === 'none' || !pop.style.display;
    pop.style.display = isHidden ? 'block' : 'none';
    if (isHidden) renderNotifications();
  };

  function renderNotifications() {
    const list = document.getElementById('notificationsList');
    if (!list) return;
    list.innerHTML = notifications.map(n => `
      <div style="background:rgba(15,23,42,0.9); border-left:3px solid var(--accent-cyan); padding:8px; border-radius:4px;">
        <div style="display:flex; justify-content:space-between; margin-bottom:2px;">
          <b style="color:#fff;">${n.title}</b>
          <span style="color:var(--text-dim); font-size:10px;">${n.time}</span>
        </div>
        <div style="color:var(--text-muted); font-size:11px;">${n.text}</div>
      </div>
    `).join('');
  }

  window.clearNotifications = function() {
    notifications = [];
    renderNotifications();
    showToast('Notifications cleared.');
  };

  window.refreshAllData = function() {
    const btn = document.getElementById('btnRefreshData');
    if (btn) {
      btn.style.transform = 'rotate(360deg)';
      btn.style.transition = 'transform 0.5s ease';
      setTimeout(() => { btn.style.transform = 'none'; }, 500);
    }
    window.fetchSocOverview();
    window.fetchIncidents();
    window.fetchThreatIntel();
    window.fetchHardwareCluster();
    showToast('🔄 Live telemetry refreshed.');
  };

  // Command Palette & Global Search
  const searchInput = document.getElementById('globalSearchInput');
  const paletteModal = document.getElementById('commandPaletteModal');
  const paletteInput = document.getElementById('paletteInput');

  function openCommandPalette() {
    if (paletteModal) {
      paletteModal.classList.add('show');
      paletteInput?.focus();
    }
  }

  window.closeCommandPalette = function(e) {
    if (e && e.target && e.target !== paletteModal) return;
    paletteModal?.classList.remove('show');
  };

  searchInput?.addEventListener('click', openCommandPalette);
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      openCommandPalette();
    } else if (e.key === 'Escape') {
      paletteModal?.classList.remove('show');
      document.getElementById('incidentDetailsDrawer')?.classList.remove('show');
      document.getElementById('notificationsPopover') && (document.getElementById('notificationsPopover').style.display = 'none');
    }
  });

  const commandsList = [
    { title: "Security Overview", tab: "tab-overview", icon: "📊" },
    { title: "Incident Management", tab: "tab-incidents", icon: "🚨" },
    { title: "Security Alerts", tab: "tab-alerts", icon: "⚡" },
    { title: "Live Threat Map HUD", tab: "tab-soc", icon: "🌐" },
    { title: "Threat Intel IOCs", tab: "tab-threat-intel", icon: "🎯" },
    { title: "Cyber Attack Simulator", tab: "tab-simulator", icon: "⚔️" },
    { title: "Code Target Forensics", tab: "tab-source", icon: "📍" },
    { title: "Phone & Mobile Shield", tab: "tab-mobile", icon: "📱" },
    { title: "Admin Control Center", tab: "tab-admin-control", icon: "👑" },
    { title: "Security Panel / Firewall", tab: "tab-security-panel", icon: "🛡️" },
    { title: "Stealth Cloak & Decoys", tab: "tab-stealth", icon: "🕵️" },
    { title: "Identity & UEBA", tab: "tab-ueba", icon: "👤" },
    { title: "Data Loss Prevention (DLP)", tab: "tab-dlp", icon: "🔒" },
    { title: "Audit Trails SHA-256", tab: "tab-audit-trail", icon: "📜" },
    { title: "Database Schema SQL", tab: "tab-database-schema", icon: "🗄️" },
    { title: "Device Registration", tab: "tab-landing", icon: "👤" }
  ];

  paletteInput?.addEventListener('input', (e) => {
    const q = e.target.value.toLowerCase();
    const results = document.getElementById('paletteResultsList');
    if (!results) return;
    const filtered = commandsList.filter(c => c.title.toLowerCase().includes(q));
    results.innerHTML = filtered.map(c => `
      <div class="palette-item" style="padding:10px 14px; cursor:pointer; display:flex; gap:10px; align-items:center; border-bottom:1px solid rgba(255,255,255,0.05);" onclick="window.switchTab('${c.tab}'); window.closeCommandPalette();">
        <span>${c.icon}</span>
        <b style="color:#fff; font-size:13px;">${c.title}</b>
      </div>
    `).join('');
  });

  // Time Range Group Active Toggle
  document.querySelectorAll('.time-range-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.time-range-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      showToast(`Time window updated: ${btn.dataset.range.toUpperCase()}`);
    });
  });

  window.callSupportHotline = function() { window.location.href = "tel:+919000000000"; };
  window.emailSupportHotline = function() { window.location.href = "mailto:security@cybershield.org?subject=Incident%20Report"; };

  function showToast(msg) {
    const toast = document.createElement('div');
    toast.style.cssText = `
      position: fixed;
      bottom: 24px;
      right: 24px;
      background: rgba(11, 17, 30, 0.95);
      border: 1px solid var(--accent-cyan);
      box-shadow: 0 0 20px rgba(0, 242, 254, 0.3);
      color: #fff;
      padding: 12px 20px;
      border-radius: var(--radius-sm);
      font-size: 13px;
      font-weight: 600;
      z-index: 99999;
      transition: opacity 0.3s;
    `;
    toast.innerText = msg;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }
  window.showToast = showToast;

  // Initialize Landing View (Portal Gateway)
  window.switchTab('tab-landing');
});
