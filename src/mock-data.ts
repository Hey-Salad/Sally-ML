import type { AppTarget, DeviceRecord, RunEvent } from './types';

export const devices: DeviceRecord[] = [
  {
    id: 'R58M20GVCWZ',
    name: 'Samsung S10+',
    platform: 'android',
    model: 'SM-G975F',
    osVersion: 'Android 12',
    host: 'hs-chilu@heysalad-ai-01',
    transport: 'ADB + scrcpy',
    streamSource: 'ws-scrcpy',
    controlSource: 'ADB / scrcpy control',
    status: 'connected',
    sessionState: 'streaming',
    currentSurface: 'Console + Stream SM-G975F',
    battery: 74,
  },
  {
    id: '00008030-000259E936BB802E',
    name: 'iPhone 11 Pro',
    platform: 'ios',
    model: 'iPhone12,3',
    osVersion: 'iOS 18.7.1',
    host: 'macbook-pro.local',
    transport: 'USB + tunneld',
    streamSource: 'DVT screenshots',
    controlSource: 'WebDriverAgent',
    status: 'connected',
    sessionState: 'ready',
    currentSurface: 'Remote canvas control',
    battery: 61,
  },
];

export const appTarget: AppTarget = {
  id: 'sally-mobile-dev-engine',
  name: 'Sally Mobile Dev Engine',
  repoRoot: '/home/hs-chilu/android-lab/ws-scrcpy',
  framework: 'React Native / Expo-compatible mobile workspace',
  entryMode: 'Cloud control plane + local device runners',
  devServer: {
    kind: 'metro',
    command: 'npm run dist && systemctl --user restart ws-scrcpy',
  },
  buildSurfaces: [
    {
      label: 'Android build surface',
      path: '/home/hs-chilu/android-lab/ws-scrcpy',
      command: 'npm run dist',
    },
    {
      label: 'iOS runner surface',
      path: '~/iphone-remote',
      command: 'bash start.sh',
    },
    {
      label: 'Cloud control plane',
      path: '/home/hs-chilu/android-lab/ws-scrcpy/cloudflare/browserless-sessions',
      command: 'npm run deploy',
    },
  ],
  gestures: [
    {
      name: 'Open Android stream',
      trigger: 'Click H264 Converter or same-tab stream action',
      expectedResult: 'Stream screen loads and composer/runtime row is visible',
    },
    {
      name: 'Open iPhone live control',
      trigger: 'Select iPhone device and open canvas session',
      expectedResult: 'Canvas stream appears and tap/swipe are accepted',
    },
    {
      name: 'Prompt mobile dev engine',
      trigger: 'Submit prompt in Console / stream composer',
      expectedResult: 'Agent reasons over repo, screenshot, and runner state',
    },
  ],
  behaviors: [
    {
      name: 'Platform-aware runner routing',
      successSignal: 'Android jobs route to ws-scrcpy and iOS jobs route to iphone-remote/WDA',
      failureSignal: 'Agent issues Android-only actions to iOS or vice versa',
    },
    {
      name: 'Code/build awareness',
      successSignal: 'Agent knows repo root, build command, and expected dev server per target',
      failureSignal: 'Agent guesses build paths or asks the operator to locate the project manually',
    },
    {
      name: 'Gesture expectation registry',
      successSignal: 'Each flow has named gestures and clear on-screen success signals',
      failureSignal: 'Verification depends on ad hoc manual interpretation only',
    },
  ],
};

export const runEvents: RunEvent[] = [
  {
    id: 'evt-1',
    time: '17:14 UTC',
    lane: 'control-plane',
    title: 'Telegram computer task queued',
    detail: 'Cloudflare worker accepted a recorded browser/computer-use job.',
  },
  {
    id: 'evt-2',
    time: '17:16 UTC',
    lane: 'android-runner',
    title: 'Android runner authenticated',
    detail: 'Cloudflare Access OTP was fetched from Microsoft 365 and injected successfully.',
  },
  {
    id: 'evt-3',
    time: '17:18 UTC',
    lane: 'agent',
    title: 'Prompting surface reached',
    detail: 'The stream page showed the GPT-5.4 composer with repo and branch metadata.',
  },
  {
    id: 'evt-4',
    time: '17:20 UTC',
    lane: 'ios-runner',
    title: 'iPhone runner ready',
    detail: 'DVT screenshot stream and WebDriverAgent touch channel were available on the Mac path.',
  },
];
