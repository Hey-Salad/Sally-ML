export type Platform = 'android' | 'ios';

export type DeviceStatus = 'connected' | 'busy' | 'offline';

export type SessionState = 'ready' | 'streaming' | 'waiting_human' | 'building';

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
}

export interface DevServerConfig {
  kind: 'expo' | 'metro' | 'none';
  command: string;
  port?: number;
}

export interface BuildSurface {
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
