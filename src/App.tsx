import { useEffect, useMemo, useState } from 'react';
import './styles.css';
import S10PrismWhiteFramePNG from './assets/Samsung Galaxy S10+ Prism White.png';
import S10PrismBlackFramePNG from './assets/Samsung Galaxy S10+ Prism Black.png';
import IPhone11ProSilverPNG from './assets/Apple iPhone 11 Pro Silver.png';
import IPhone11ProMidnightGreenPNG from './assets/Apple iPhone 11 Pro Midnight Green.png';

type ThemeMode = 'light' | 'dark';
type PanelName = 'home' | 'console' | 'testing' | 'terminals' | 'integrations' | 'settings';
type DeviceShellKey = 'android' | 'ios';

type ShellGeometry = {
  width: string;
  ratio: string;
  top: string;
  right: string;
  bottom: string;
  left: string;
  radius: string;
};

type DeviceMetaItem = {
  key: string;
  label: string;
  value: string;
  active?: boolean;
};

type ShellConfig = {
  label: string;
  overlay: Record<ThemeMode, string>;
  geometry: Record<ThemeMode, ShellGeometry>;
  deviceName: string;
  deviceSerial: string;
  statusLabel: string;
  meta: DeviceMetaItem[];
};

const SHELL_CONFIGS: Record<DeviceShellKey, ShellConfig> = {
  android: {
    label: 'Android',
    overlay: {
      light: S10PrismWhiteFramePNG,
      dark: S10PrismBlackFramePNG,
    },
    geometry: {
      light: {
        width: '280px',
        ratio: '1640 / 3340',
        top: '4.30%',
        right: '5.90%',
        bottom: '4.10%',
        left: '5.90%',
        radius: '18px',
      },
      dark: {
        width: '280px',
        ratio: '1640 / 3340',
        top: '4.49%',
        right: '6.10%',
        bottom: '4.49%',
        left: '6.10%',
        radius: '20px',
      },
    },
    deviceName: 'Samsung S10+',
    deviceSerial: 'R58M20GVCWZ',
    statusLabel: 'ADB Connected',
    meta: [
      { key: 'MODEL', label: 'MODEL', value: 'SM-G975F' },
      { key: 'SALLY', label: 'SALLY', value: 'running', active: true },
      { key: 'BATTERY', label: 'BATTERY', value: '87%' },
      { key: 'ADB', label: 'ADB', value: 'connected', active: true },
      { key: 'STREAM', label: 'STREAM', value: 'ws-scrcpy', active: true },
      { key: 'ANDROID', label: 'ANDROID', value: '12' },
    ],
  },
  ios: {
    label: 'iOS',
    overlay: {
      light: IPhone11ProSilverPNG,
      dark: IPhone11ProMidnightGreenPNG,
    },
    geometry: {
      light: {
        width: '280px',
        ratio: '1385 / 2696',
        top: '2.55%',
        right: '6.85%',
        bottom: '2.95%',
        left: '6.85%',
        radius: '38px',
      },
      dark: {
        width: '280px',
        ratio: '1385 / 2696',
        top: '2.70%',
        right: '6.90%',
        bottom: '3.00%',
        left: '6.90%',
        radius: '38px',
      },
    },
    deviceName: 'iPhone 11 Pro',
    deviceSerial: '00008030-000259E936BB802E',
    statusLabel: 'WDA Connected',
    meta: [
      { key: 'MODEL', label: 'MODEL', value: 'iPhone 11 Pro' },
      { key: 'SALLY', label: 'SALLY', value: 'running', active: true },
      { key: 'BATTERY', label: 'BATTERY', value: '83%' },
      { key: 'WDA', label: 'WDA', value: 'connected', active: true },
      { key: 'STREAM', label: 'STREAM', value: 'dvt + wda', active: true },
      { key: 'IOS', label: 'IOS', value: '18.7.1' },
    ],
  },
};


const STREAM_URLS: Record<DeviceShellKey, string> = {
  ios: "https://iphone-stream.heysalad.app",
  android: "",
};

function App() {
  const [theme, setTheme] = useState<ThemeMode>('light');
  const [activePanel, setActivePanel] = useState<PanelName>('console');
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [deviceShell, setDeviceShell] = useState<DeviceShellKey>('android');
  const [prompt, setPrompt] = useState('');

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.body.classList.add('shell', 'lab-mode');
    return () => {
      document.body.classList.remove('shell', 'lab-mode');
    };
  }, [theme]);

  const shell = useMemo(() => SHELL_CONFIGS[deviceShell], [deviceShell]);
  const shellGeometry = shell.geometry[theme];

  const frameStyle = {
    '--shell-frame-width': shellGeometry.width,
    '--shell-frame-ratio': shellGeometry.ratio,
    '--shell-screen-top': shellGeometry.top,
    '--shell-screen-right': shellGeometry.right,
    '--shell-screen-bottom': shellGeometry.bottom,
    '--shell-screen-left': shellGeometry.left,
    '--shell-screen-radius': shellGeometry.radius,
  } as React.CSSProperties;

  return (
    <div id="lab-shell-root" className="lab-shell-root">
      <input
        id="lab-sidebar-toggle"
        className="sidebar-toggle-input"
        type="checkbox"
        checked={sidebarExpanded}
        onChange={(event) => setSidebarExpanded(event.target.checked)}
      />
      <header id="app-header" className="topbar app-header">
        <div className="topbar-logo header-brand header-left">
          <div className="sal-icon" aria-hidden="true">S</div>
          <span className="topbar-title">Sally Lab</span>
        </div>
        <div className="header-right header-actions">
          <div className="topbar-actions">
            <button className="btn-icon" type="button" title="Refresh" aria-label="Refresh">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M23 4v6h-6" /><path d="M1 20v-6h6" /><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10" /><path d="M1 14l4.64 4.36A9 9 0 0 0 20.49 15" /></svg>
            </button>
            <button
              id="lab-theme-toggle"
              className="btn-icon"
              type="button"
              title="Toggle theme"
              aria-label="Toggle theme"
              onClick={() => setTheme((current) => (current === 'light' ? 'dark' : 'light'))}
            >
              <svg className="icon-moon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 1 0 9 9 9 9 0 1 1-9-9Z" /></svg>
              <svg className="icon-sun" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4" /><path d="M12 2v2" /><path d="M12 20v2" /><path d="m4.93 4.93 1.41 1.41" /><path d="m17.66 17.66 1.41 1.41" /><path d="M2 12h2" /><path d="M20 12h2" /><path d="m6.34 17.66-1.41 1.41" /><path d="m19.07 4.93-1.41 1.41" /></svg>
            </button>
          </div>
        </div>
      </header>

      <div
        id="lab-shell"
        className={`app-shell app-body lab-shell${sidebarExpanded ? ' sidebar-expanded expanded' : ''}`}
      >
        <nav id="sidebar" className="lab-sidebar sidebar">
          <div className="sidebar-brand-block sidebar-toggle-block">
            <label htmlFor="lab-sidebar-toggle" className="sidebar-brand-toggle" aria-label="Toggle sidebar">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
            </label>
          </div>
          <nav className="sidebar-nav">
            <SidebarButton label="Home" active={activePanel === 'home'} onClick={() => setActivePanel('home')}>
              <path d="M3 10.5 12 3l9 7.5" />
              <path d="M5 9.5V21h14V9.5" />
            </SidebarButton>
            <SidebarButton label="Console" active={activePanel === 'console'} onClick={() => setActivePanel('console')}>
              <path d="M4 17 10 11 4 5" />
              <path d="M12 19h8" />
            </SidebarButton>
            <SidebarButton label="Testing" active={activePanel === 'testing'} onClick={() => setActivePanel('testing')}>
              <path d="M10 2v7.31" />
              <path d="M14 9.3V2" />
              <path d="M8.5 2h7" />
              <path d="M14 9.3a6.5 6.5 0 1 1-4 0" />
            </SidebarButton>
            <SidebarButton label="Terminals" active={activePanel === 'terminals'} onClick={() => setActivePanel('terminals')}>
              <rect x="3" y="4" width="18" height="14" rx="2" />
              <path d="m7 8 3 3-3 3" />
              <path d="M12 14h5" />
            </SidebarButton>
            <SidebarButton label="Integrations" active={activePanel === 'integrations'} onClick={() => setActivePanel('integrations')}>
              <path d="M8 12h8" />
              <path d="M12 8v8" />
              <path d="M3 8a2 2 0 0 1 2-2h3v4H5a2 2 0 0 1-2-2Z" />
              <path d="M16 6h3a2 2 0 1 1 0 4h-3V6Z" />
              <path d="M3 16a2 2 0 0 0 2 2h3v-4H5a2 2 0 0 0-2 2Z" />
              <path d="M16 14h3a2 2 0 1 1 0 4h-3v-4Z" />
            </SidebarButton>
            <SidebarButton label="Settings" active={activePanel === 'settings'} onClick={() => setActivePanel('settings')}>
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82L4.21 7.2a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33h.01A1.65 1.65 0 0 0 10 3.25V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h.01a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v.01A1.65 1.65 0 0 0 20.75 10H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
            </SidebarButton>
          </nav>
          <div className="sidebar-spacer"></div>
          <div className="sidebar-bottom">
            <a className="sidebar-bottom-link" href="https://github.com/Hey-Salad/OpenCTO" target="_blank" rel="noreferrer" aria-label="GitHub">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 19 4.77 5.07 5.07 0 0 0 18.91 1S17.73.65 15 2.48a13.38 13.38 0 0 0-6 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77 5.44 5.44 0 0 0 3.56 8c0 5.42 3.3 6.61 6.44 7a4.8 4.8 0 0 0-1 3v4" /><path d="M9 18c-4.51 2-5-2-7-2" /></svg>
            </a>
            <button className="sidebar-bottom-link" type="button" aria-label="Settings" onClick={() => setActivePanel('settings')}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82L4.21 7.2a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33h.01A1.65 1.65 0 0 0 10 3.25V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h.01a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v.01A1.65 1.65 0 0 0 20.75 10H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" /></svg>
            </button>
          </div>
        </nav>

        <main id="chat-panel" className="chat-panel center-panel">
          <section className="panel-view aux-panel-view" data-panel-view="home" hidden={activePanel !== 'home'}>
            <div className="panel-placeholder-card">
              <span className="panel-placeholder-kicker">Workspace</span>
              <h2>Home</h2>
              <p>Project overview, pinned runs, and GitHub-linked workspaces will live here.</p>
            </div>
          </section>

          <section className="panel-view console-panel-view" data-panel-view="console" hidden={activePanel !== 'console'}>
            <div id="message-list" className="message-list workspace-log-wrap">
              <div className="empty-hint empty-state workspace-empty-state" aria-hidden="true"></div>
              <div id="lab-chat-thread" className="workspace-log"></div>
              <button id="lab-chat-jump-latest" className="lab-chat-jump-latest" type="button" hidden>
                Jump to latest
              </button>
            </div>
            <div id="composer-wrap" className="composer-wrapper prompt-bar">
              <div id="lab-operator-status" className="lab-operator-status"></div>
              <div id="composer" className="composer-card prompt-inner">
                <textarea
                  id="lab-prompt"
                  className="composer-input prompt-input composer-textarea"
                  rows={1}
                  placeholder=""
                  value={prompt}
                  onChange={(event) => setPrompt(event.target.value)}
                />
                <div id="composer-controls" className="composer-controls-row composer-controls">
                  <div id="composer-left" className="composer-left-controls composer-left">
                    <div className="model-btn model-selector model-selector-wrap prompt-model-wrap">
                      <svg className="icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5a3 3 0 1 0-5.997.176A4 4 0 0 0 6 13h12a4 4 0 0 0-.003-7.824A3 3 0 1 0 12 5" /><path d="M8 13v3" /><path d="M12 13v5" /><path d="M16 13v3" /></svg>
                      <select id="lab-model-select" className="prompt-model-selector model-name" defaultValue="gpt-5.4">
                        <option value="gpt-5.4">GPT-5.4</option>
                        <option value="gpt-5-codex">OpenAI Codex</option>
                        <option value="claude-sonnet-4-6">claude-sonnet-4-6</option>
                        <option value="gpt-4.5">GPT-4.5</option>
                        <option value="gpt-4o">GPT-4o</option>
                        <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
                        <option value="gemini-2.5-pro">Gemini 2.5 Pro</option>
                      </select>
                      <svg className="model-selector-chevron prompt-model-chevron chevron" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                    </div>
                    <div className="composer-divider"></div>
                    <div id="lab-runtime-meta" className="lab-runtime-meta">
                      Repo ws-scrcpy • Branch main • Estimated input tokens 0
                    </div>
                    <div className="composer-divider"></div>
                    <button className="composer-icon-btn prompt-icon-button prompt-clip" type="button" aria-label="Attach file">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.48l9.2-9.2a4 4 0 0 1 5.65 5.66l-9.2 9.19a2 2 0 1 1-2.82-2.82l8.48-8.48" /></svg>
                    </button>
                    <button className="composer-icon-btn prompt-icon-button prompt-mic" type="button" aria-label="Voice input">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a3 3 0 0 1 3 3v6a3 3 0 0 1-6 0V6a3 3 0 0 1 3-3z" /><path d="M19 11a7 7 0 0 1-14 0" /><path d="M12 18v3" /><path d="M8 21h8" /></svg>
                    </button>
                  </div>
                  <button className="send-btn prompt-send" type="button" aria-label="Send prompt">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5" /><path d="m5 12 7-7 7 7" /></svg>
                  </button>
                </div>
              </div>
            </div>
          </section>

          <section className="panel-view aux-panel-view" data-panel-view="testing" hidden={activePanel !== 'testing'}>
            <div className="panel-placeholder-card">
              <span className="panel-placeholder-kicker">Validation</span>
              <h2>Testing</h2>
              <p>Testing flows and scripted validation will live here.</p>
            </div>
          </section>

          <section className="panel-view terminal-panel-view" data-panel-view="terminals" hidden={activePanel !== 'terminals'}>
            <div className="terminal-panel-header">
              <div>
                <span className="panel-placeholder-kicker">Sally Lab CLI</span>
                <h2 className="terminal-panel-title">Terminals</h2>
                <p className="terminal-panel-copy">Recoverable tmux-backed terminal sessions for project work. Single pane now, split views next.</p>
              </div>
              <button className="terminal-create-btn" type="button">Create terminal</button>
            </div>
            <div className="terminal-session-pill">
              tmux session <code>sally-lab-default</code> · cwd <code>/home/hs-chilu/android-lab/ws-scrcpy</code>
            </div>
            <div className="terminal-stage-shell">
              <div id="lab-terminal-empty" className="terminal-empty-state">
                <strong>Open a terminal</strong>
                <p>Create a recoverable tmux session. The session survives reconnects; the browser is only the client.</p>
              </div>
              <div id="lab-terminal-mount" className="lab-terminal-mount" hidden></div>
            </div>
          </section>

          <section className="panel-view aux-panel-view" data-panel-view="integrations" hidden={activePanel !== 'integrations'}>
            <div className="panel-stack">
              <div className="panel-placeholder-card">
                <span className="panel-placeholder-kicker">Connected stack</span>
                <h2>Integrations</h2>
                <p>Manage linked services and the tools Sally Lab can use across projects and terminal workflows.</p>
              </div>
              <div className="integration-grid">
                <a className="integration-card" href="https://github.com/Hey-Salad/OpenCTO" target="_blank" rel="noreferrer">
                  <div className="integration-card-head">
                    <strong>GitHub</strong>
                    <span className="integration-status connected">Live</span>
                  </div>
                  <p>OpenCTO repo linked from the sidebar and available for project workflows.</p>
                </a>
                <div className="integration-card">
                  <div className="integration-card-head">
                    <strong>OpenAI</strong>
                    <span className="integration-status connected">Active</span>
                  </div>
                  <p>Current coding and operator models. Keep provider settings and model policies here.</p>
                </div>
                <div className="integration-card">
                  <div className="integration-card-head">
                    <strong>Microsoft 365</strong>
                    <span className="integration-status planned">Checking</span>
                  </div>
                  <p className="integration-fact-line">Config: <span>Checking</span></p>
                  <p className="integration-fact-line">Test: <span>Checking</span></p>
                  <p className="integration-fact-line">Latest OTP: <code>No OTP found</code></p>
                  <p>Mailbox status is loading.</p>
                  <div className="integration-actions">
                    <button className="integration-action-btn" type="button">Refresh</button>
                  </div>
                </div>
                <div className="integration-card">
                  <div className="integration-card-head">
                    <strong>OpenClaw</strong>
                    <span className="integration-status planned">Planned</span>
                  </div>
                  <p>Reserved for autonomous browser and desktop control experiments.</p>
                </div>
                <div className="integration-card">
                  <div className="integration-card-head">
                    <strong>Notion</strong>
                    <span className="integration-status planned">Planned</span>
                  </div>
                  <p>Reserved for docs, specs, and workspace sync once the project model is added.</p>
                </div>
                <div className="integration-card">
                  <div className="integration-card-head">
                    <strong>Greptile</strong>
                    <span className="integration-status planned">Planned</span>
                  </div>
                  <p>Reserved for repo indexing and codebase-aware search inside project threads.</p>
                </div>
              </div>
            </div>
          </section>

          <section className="panel-view aux-panel-view" data-panel-view="settings" hidden={activePanel !== 'settings'}>
            <div className="panel-stack">
              <div className="panel-placeholder-card">
                <span className="panel-placeholder-kicker">Workspace</span>
                <h2>Settings</h2>
                <p>App preferences, provider defaults, terminal behavior, and future thread or project controls will live here.</p>
              </div>
              <div className="settings-card-list">
                <div className="settings-card">
                  <strong>Theme and layout</strong>
                  <p>Persist light or dark mode, sidebar state, and panel defaults here.</p>
                </div>
                <div className="settings-card">
                  <strong>Agent defaults</strong>
                  <p>Choose default model, provider, and execution policy for console and terminal runs.</p>
                </div>
                <div className="settings-card">
                  <strong>Terminal policy</strong>
                  <p>Manage tmux session naming, shell startup command, and future pane or recovery limits.</p>
                </div>
              </div>
            </div>
          </section>
        </main>

        <aside id="device-panel" className="device-panel right-panel">
          <div className="device-meta-hidden" aria-hidden="true">
            <span id="lab-device-name">{shell.deviceName}</span>
            <span id="lab-device-serial">{shell.deviceSerial}</span>
          </div>
          <div className="device-panel-head">
            <div className="device-shell-control">
              <label htmlFor="lab-device-shell-select" className="device-shell-control__label">Device</label>
              <select
                id="lab-device-shell-select"
                className="device-shell-select"
                value={deviceShell}
                onChange={(event) => setDeviceShell(event.target.value as DeviceShellKey)}
              >
                <option value="android">Android</option>
                <option value="ios">iOS</option>
              </select>
            </div>
          </div>
          <div className="device-mirror-panel">
            <div id="lab-device-stage" className="device-body lab-device-stage">
              <div className="phone-frame-wrap device-frame-wrap">
                <div
                  id="phone-frame"
                  className={`phone-frame s10-frame shell-${deviceShell}`}
                  style={frameStyle}
                >
                  <div id="phone-screen" className="phone-screen phone-screen-area device-mirror-screen">
                    {STREAM_URLS[deviceShell] ? (
                      <iframe
                        src={STREAM_URLS[deviceShell]}
                        className="device-stream-iframe"
                        title="Device stream"
                        allow="pointer-lock"
                        style={{width:"100%",height:"100%",border:"none",borderRadius:"inherit",display:"block"}}
                      />
                    ) : (
                      <div className="device-stream-placeholder" aria-hidden="true" />
                    )}
                  </div>
                  <img className="phone-frame-overlay" src={shell.overlay[theme]} alt="" draggable={false} aria-hidden="true" />
                </div>
              </div>
            </div>
          </div>
          <div className="device-panel-meta">
            <div className="status-row device-panel-badge device-status"><span className="dot"></span><span>{shell.statusLabel}</span></div>
          </div>
          <div className="metadata-grid device-info-strip device-meta">
            {shell.meta.map((item) => (
              <div key={item.key} className="info-cell meta-item">
                <span className="info-cell-label meta-label">{item.label}</span>
                <span
                  className={`info-cell-value meta-value${item.active ? ' active' : ''}`}
                  data-info-key={item.key}
                >
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}

function SidebarButton({
  label,
  active,
  onClick,
  children,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button className={`sidebar-nav-item${active ? ' active' : ''}`} type="button" aria-label={label} onClick={onClick}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        {children}
      </svg>
      <span className="sidebar-nav-label">{label}</span>
    </button>
  );
}

export default App;
