export type Platform = 'android' | 'ios';

export type DeviceStatus = 'connected' | 'busy' | 'offline';

export type SessionState = 'ready' | 'streaming' | 'waiting_human' | 'building';

export type RunnerProvider =
  | 'ws-scrcpy'
  | 'iphone-remote'
  | 'sally-sdk'
  | 'browserless'
  | 'cloudflare-worker';

export type RunnerLocation = 'local' | 'remote' | 'cloud';

export type RunnerStatus = 'online' | 'degraded' | 'offline';

export type SessionMode = 'interactive' | 'verification' | 'autonomous';

export type SessionEntryPoint = 'dashboard' | 'telegram' | 'sdk' | 'agent' | 'local-runner';

export type CapabilityStatus = 'available' | 'degraded' | 'planned';

export type RunnerCapabilityName =
  | 'stream_video'
  | 'stream_canvas'
  | 'tap'
  | 'swipe'
  | 'type_text'
  | 'hardware_buttons'
  | 'prompt_engine'
  | 'record_video'
  | 'fetch_otp'
  | 'build_app'
  | 'launch_app';

export type DeviceChannelKind = 'stream' | 'control' | 'build' | 'dev_server';

export type ChannelStatus = 'connected' | 'ready' | 'disconnected' | 'planned';

export interface RunnerCapability {
  name: RunnerCapabilityName;
  status: CapabilityStatus;
  detail?: string;
}

export interface DeviceChannel {
  kind: DeviceChannelKind;
  provider: RunnerProvider;
  transport: string;
  status: ChannelStatus;
  source: string;
  endpoint?: string;
}

export interface RunnerRecord {
  id: string;
  name: string;
  provider: RunnerProvider;
  location: RunnerLocation;
  status: RunnerStatus;
  host: string;
  platforms: Platform[];
  capabilities: RunnerCapability[];
}

export interface SessionRecord {
  id: string;
  deviceId: string;
  runnerId: string;
  platform: Platform;
  mode: SessionMode;
  entryPoint: SessionEntryPoint;
  state: SessionState;
  currentSurface: string;
  startedAt: string;
  lastEventAt: string;
}

export interface DeviceRecord {
  id: string;
  name: string;
  platform: Platform;
  model: string;
  osVersion: string;
  host: string;
  transport: string;
  streamSource: string;
  controlSource: string;
  status: DeviceStatus;
  sessionState: SessionState;
  currentSurface: string;
  battery: number;
  runnerId: string;
  runnerProvider: RunnerProvider;
  activeSessionId?: string;
  channels: DeviceChannel[];
  capabilities: RunnerCapability[];
}

export interface DevServerConfig {
  kind: 'expo' | 'metro' | 'none';
  command: string;
  host?: string;
  port?: number;
}

export interface BuildSurface {
  platform: Platform | 'shared' | 'cloud';
  label: string;
  path: string;
  command: string;
}

export interface GestureSpec {
  name: string;
  trigger: string;
  expectedResult: string;
}

export interface BehaviorSpec {
  name: string;
  successSignal: string;
  failureSignal: string;
}

export interface AppTarget {
  id: string;
  name: string;
  repoRoot: string;
  framework: string;
  entryMode: string;
  supportedPlatforms: Platform[];
  runnerIds: string[];
  devServer: DevServerConfig;
  buildSurfaces: BuildSurface[];
  gestures: GestureSpec[];
  behaviors: BehaviorSpec[];
}

export interface RunEvent {
  id: string;
  time: string;
  lane: 'control-plane' | 'android-runner' | 'ios-runner' | 'agent';
  title: string;
  detail: string;
}
