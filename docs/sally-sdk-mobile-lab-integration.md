# Sally-SDK + Mobile Lab Integration Plan

This document explains the recommended way to integrate:

- `Hey-Salad/Sally-SDK`
- the current Android backend in `ws-scrcpy`
- the current iOS backend in `iphone-remote`
- the new shared UI in `Sally-ML`

The goal is to converge on one product surface called `mobile-lab`, without breaking the already-working Android and iOS systems.

## Ground Truth

### 1. Sally-SDK

Live repo:

- `https://github.com/Hey-Salad/Sally-SDK`

Confirmed monorepo structure:

- `packages/cli` → `@heysalad/sally`
- `packages/sdk` → `@heysalad/sally-sdk`
- `packages/agent` → host daemon for attached devices
- `apps/worker` → Cloudflare Worker control plane
- `apps/dashboard` → Cloudflare Pages dashboard
- `python/sally_stream`
- `sally_stream`

Confirmed from the live repo README:

- Sally already positions itself as the shared CLI / SDK / host-agent / Cloudflare control plane
- iOS discovery, streaming, tunnel handoff, Worker registration, and dashboard visibility are already working there
- Android discovery works there, but Android stream startup is still marked as not implemented

Important implication:

- `Sally-SDK` should remain the control-plane repo
- `Sally-ML` should be the shared UI and workflow layer
- Android and iOS runners should plug into `Sally-SDK`, not bypass it

### 2. Android backend

Current Android runner:

- [/home/hs-chilu/android-lab/ws-scrcpy](/home/hs-chilu/android-lab/ws-scrcpy)

Relevant facts:

- `ws-scrcpy` already supports both Android and iOS codepaths, but the current Sally Lab UX work is centered on Android
- Android stream UI and Sally Lab shell are in:
  - [/home/hs-chilu/android-lab/ws-scrcpy/src/app/googDevice/client/StreamClientScrcpy.ts](/home/hs-chilu/android-lab/ws-scrcpy/src/app/googDevice/client/StreamClientScrcpy.ts)
- the current design contract is locked in:
  - [/home/hs-chilu/android-lab/ws-scrcpy/DESIGN_LOCK.md](/home/hs-chilu/android-lab/ws-scrcpy/DESIGN_LOCK.md)
- Android server bootstrap and platform wiring are in:
  - [/home/hs-chilu/android-lab/ws-scrcpy/src/server/index.ts](/home/hs-chilu/android-lab/ws-scrcpy/src/server/index.ts)
- Sally Lab backend routes already exist for:
  - AI chat
  - mailbox status
  - latest OTP fetch
  - engineering workflows
  - file: [/home/hs-chilu/android-lab/ws-scrcpy/src/server/services/HttpServer.ts](/home/hs-chilu/android-lab/ws-scrcpy/src/server/services/HttpServer.ts)

Current Android strengths:

- live stream
- touch / remote control
- terminal and AI workflow integration
- real browser verification and recording around the lab UI

### 3. iOS backend

Current iOS runner:

- [/home/hs-chilu/iphone-remote](/home/hs-chilu/iphone-remote)

Relevant files:

- [/home/hs-chilu/iphone-remote/server.py](/home/hs-chilu/iphone-remote/server.py)
- [/home/hs-chilu/iphone-remote/capture.py](/home/hs-chilu/iphone-remote/capture.py)
- [/home/hs-chilu/iphone-remote/wda_client.py](/home/hs-chilu/iphone-remote/wda_client.py)
- [/home/hs-chilu/iphone-remote/start.sh](/home/hs-chilu/iphone-remote/start.sh)

Current iOS strengths:

- DVT screenshot streaming over FastAPI WebSocket
- WDA touch injection
- button presses
- key input
- Cloudflare tunnel handoff from local runner to public URL

Current iOS gap:

- it is not yet modeled as a Sally-SDK runner contract the same way Android should be

### 4. Shared UI

Current shared UI repo:

- [/home/hs-chilu/mobile-labs](/home/hs-chilu/mobile-labs)
- GitHub: `https://github.com/Hey-Salad/Sally-ML`

Purpose:

- one shared product shell for Android and iOS
- one shared device panel and session surface
- eventually one AI-driven mobile engineering console

## Recommended Architecture

### Control plane

Use `Sally-SDK` as the source of truth for:

- users
- teams
- devices
- sessions
- permissions
- runner registration
- tunnel metadata
- audit trail

That belongs in:

- `apps/worker`
- `packages/sdk`
- `packages/agent`

### Runner plane

Treat Android and iOS as adapters behind one common runner contract.

Android adapter:

- wraps `ws-scrcpy`
- owns ADB-backed discovery, stream bootstrap, and device actions

iOS adapter:

- wraps `iphone-remote`
- owns DVT capture, WDA actions, and tunnel exposure

### UI plane

Use `Sally-ML` as the shared operator UI:

- device selection
- stream stage
- metadata panel
- prompt / AI workflow surface
- future testing / terminal / integrations surfaces

This UI should talk to Sally-SDK APIs, not directly to Android/iOS internals where possible.

## Shared Contract To Standardize

This is the most important step.

Both Android and iOS runners should expose the same logical operations.

### Device record

Recommended shared fields:

- `id`
- `platform` → `android | ios`
- `name`
- `model`
- `osVersion`
- `status`
- `runnerId`
- `teamId`
- `capabilities`
- `stream`
- `control`
- `lastSeenAt`

### Session record

Recommended shared fields:

- `sessionId`
- `deviceId`
- `platform`
- `runnerId`
- `viewerUrl`
- `wsUrl`
- `startedAt`
- `endedAt`
- `status`
- `artifacts`

### Shared actions

Both runners should support a common action surface:

- `listDevices`
- `getDevice`
- `startSession`
- `stopSession`
- `tap`
- `swipe`
- `typeText`
- `pressButton`
- `captureScreenshot`
- `getStatus`

Platform-specific actions can still exist, but they should sit under a namespaced extension area.

Examples:

- Android-only:
  - `adbShell`
  - `installApk`
  - `launchActivity`
- iOS-only:
  - `wdaCommand`
  - `pressHome`
  - `pressLock`

## Best Implementation Order

### Phase 1. Lock the shared device/session schema in Sally-SDK

Do this first in `Sally-SDK`.

Why:

- if this is unstable, both `ws-scrcpy` and `iphone-remote` integrations will drift

Deliverables:

- shared TypeScript types in `packages/sdk`
- Worker endpoints in `apps/worker`
- runner registration model in `packages/agent`

### Phase 2. Build the Android adapter

Do this second.

Why:

- Android already has the richer Sally Lab UX and AI surface
- it is the fastest place to validate the shared runner contract

Recommended adapter shape:

- a thin integration layer that maps `ws-scrcpy` into Sally-SDK device/session APIs
- do not rewrite `ws-scrcpy`
- do not move the Android UX into Sally-SDK directly

### Phase 3. Build the iOS adapter

Do this third.

Why:

- `iphone-remote` is already clean and focused
- it needs contract alignment more than new transport logic

Recommended adapter shape:

- `packages/agent` or a local runner bridge calls into `iphone-remote`
- expose Sally-SDK-compatible device, session, and action responses

### Phase 4. Point Sally-ML at the Sally-SDK control plane

Do this only after the shared contract exists.

Why:

- `Sally-ML` should not need special Android logic and separate special iOS logic in the UI
- the UI should consume one normalized API

### Phase 5. Add AI workflow routing

After the normalized APIs exist:

- use Android Sally Lab routes for Android engineering workflows
- add equivalent iOS workflow routes over time
- let the AI reason over one `mobile-lab` device model and dispatch to the correct runner

## Concrete Repo Responsibilities

### Sally-SDK

Own:

- device registry
- team auth
- session lifecycle
- runner registration
- tunnel metadata
- shared SDK types
- public API contract

Should not own:

- low-level `adb shell` details
- low-level WDA transport details
- the full Android Sally Lab UI

### ws-scrcpy

Own:

- Android stream runtime
- Android control runtime
- Android lab console / AI engineering surface
- Android device-specific actions

Should not own:

- cross-platform source of truth for teams/devices/sessions

### iphone-remote

Own:

- iOS screen capture runtime
- WDA transport
- iOS device action execution

Should not own:

- team/session control plane logic

### Sally-ML

Own:

- unified mobile-lab UI
- platform-neutral operator experience
- device shell switching
- future shared prompt/workflow surface

Should not own:

- device discovery truth
- runner-specific transport logic
- direct ADB or WDA orchestration

## Verified Sally-SDK Monorepo Ownership

This integration plan assumes the current live `Sally-SDK` repo remains the backbone.

Verified packages and apps:

- `packages/cli`
  - ships `@heysalad/sally`
  - operator-facing CLI for device and session actions
- `packages/sdk`
  - ships `@heysalad/sally-sdk`
  - should hold shared types, client helpers, and normalized API contracts
- `packages/agent`
  - local host daemon layer
  - best place for runner registration, heartbeat, and adapter wiring
- `apps/worker`
  - Cloudflare Worker control plane
  - best place for device registry, session lifecycle, and public API
- `apps/dashboard`
  - current Cloudflare-hosted dashboard
  - should eventually share normalized data with `Sally-ML`, not compete with it

Practical implication:

- if a type or API must be trusted by all clients, it belongs in `packages/sdk`
- if a thing is the canonical public contract, it belongs in `apps/worker`
- if a thing needs to run on a machine attached to real devices, it belongs in `packages/agent` or a runner bridge behind it

## Concrete Sally-SDK Insertion Points

These are the most important code-level integration points confirmed from the live `Sally-SDK` repo structure and the current Android/iOS runners.

### `packages/agent`

Primary insertion points:

- `packages/agent/src/StreamProcess.ts`
  - make this the platform router for stream/session startup
  - current iOS handling can stay here
  - Android adapter startup should be added here, not bolted into the UI
- `packages/agent/src/SallyAgentDaemon.ts`
  - keep this as the main runner lifecycle and registration entrypoint
- `packages/agent/src/DeviceWatcher.ts`
  - extend device discovery/heartbeat so Android and iOS register under one normalized contract
- `packages/agent/src/WorkerClient.ts`
  - use this for typed calls back into the Worker control plane
- `packages/agent/src/Heartbeat.ts`
  - keep runner liveness and capability reporting here
- `packages/agent/src/TunnelManager.ts`
  - keep named/public tunnel metadata here instead of leaking tunnel logic into the UI
- `packages/agent/src/WDALauncher.ts`
  - keep iOS-specific bootstrap here

### `packages/sdk`

Primary insertion points:

- `packages/sdk/src/device/AndroidBridge.ts`
  - this should become a real Android bridge rather than a placeholder
  - it should wrap `ws-scrcpy` stream/control/session operations behind normalized Sally-SDK methods
- shared normalized device/session/action types
  - these should live in `packages/sdk`, not be redefined per client

### `apps/worker`

Primary insertion points:

- `apps/worker/src/types.ts`
  - expand current `DeviceRecord` and `SessionRecord` into capability-aware runner/device/session models
- D1 schema
  - add normalized runner/capability/channel/session metadata instead of keeping only basic device rows
- public routes
  - keep the first-class cross-platform contract here

Current Worker route surface already covers:

- `GET /devices`
- `POST /devices`
- `PATCH /devices/:id`
- `GET /sessions`
- `POST /sessions/start`
- `POST /sessions/stop`
- `GET /teams`
- `POST /teams`
- `GET /users`
- `POST /users`

Current D1 model already covers:

- `teams`
- `users`
- `devices`
- `sessions`
- `permissions`

## Recommended Integration Boundary

The clean split is:

- `Sally-SDK`
  - system of record
  - API contract
  - runner registration
  - session registry
- `ws-scrcpy`
  - Android execution engine
  - Android AI lab surface
- `iphone-remote`
  - iOS execution engine
  - iOS gesture/control runtime
- `Sally-ML`
  - unified operator UI
  - prompt/workflow entrypoint
  - stream host surface

This avoids the two common failure modes:

- putting platform logic into the UI
- forcing the worker/control plane to own device-specific transport

## Current Backend Route Mapping

These are the route surfaces that should be wrapped, not rewritten.

### Android route surface in `ws-scrcpy`

Relevant files:

- [/home/hs-chilu/android-lab/ws-scrcpy/src/server/index.ts](/home/hs-chilu/android-lab/ws-scrcpy/src/server/index.ts)
- [/home/hs-chilu/android-lab/ws-scrcpy/src/server/goog-device/services/ControlCenter.ts](/home/hs-chilu/android-lab/ws-scrcpy/src/server/goog-device/services/ControlCenter.ts)
- [/home/hs-chilu/android-lab/ws-scrcpy/src/server/goog-device/mw/DeviceTracker.ts](/home/hs-chilu/android-lab/ws-scrcpy/src/server/goog-device/mw/DeviceTracker.ts)
- [/home/hs-chilu/android-lab/ws-scrcpy/src/server/services/HttpServer.ts](/home/hs-chilu/android-lab/ws-scrcpy/src/server/services/HttpServer.ts)

Relevant current routes:

- `GET /api/lab/device/:udid/status`
- `POST /api/lab/device/:udid/action`
- `GET /api/lab/device/:udid/mailbox_status`
- `GET /api/lab/device/:udid/mailbox_fetch_latest_otp`
- `GET /api/lab/device/:udid/logs`
- `GET /api/lab/device/:udid/screenshot`
- `POST /api/lab/device/:udid/ai/chat`

Recommended mapping:

- normalized `getDevice` / `getStatus` → `/status`
- normalized `tap` / `swipe` / `typeText` / `pressButton` → `/action`
- Android engineering extensions → `/ai/chat`, `/logs`, mailbox routes

### iOS route surface in `iphone-remote`

Relevant files:

- [/home/hs-chilu/iphone-remote/server.py](/home/hs-chilu/iphone-remote/server.py)
- [/home/hs-chilu/iphone-remote/capture.py](/home/hs-chilu/iphone-remote/capture.py)
- [/home/hs-chilu/iphone-remote/wda_client.py](/home/hs-chilu/iphone-remote/wda_client.py)
- [/home/hs-chilu/iphone-remote/start.sh](/home/hs-chilu/iphone-remote/start.sh)

Relevant current routes:

- `GET /status`
- `GET /`
- `WebSocket /ws`
- `POST /touch`
- `POST /button`
- `POST /keys`

Recommended mapping:

- normalized session/viewer bootstrap → `GET /` + `WebSocket /ws`
- normalized `tap` / `swipe` → `POST /touch`
- normalized `pressButton` → `POST /button`
- normalized `typeText` → `POST /keys`

## Minimal Normalized API To Add First

Before adding more UI, standardize the first thin API layer in `Sally-SDK/apps/worker`.

Recommended first routes:

- `GET /devices`
  - returns normalized Android and iOS device records
- `GET /devices/:id`
  - returns one device plus capabilities and current runner state
- `POST /sessions`
  - starts a viewer/control session for a device
- `GET /sessions/:id`
  - returns session status, stream URLs, and artifact metadata
- `POST /sessions/:id/actions`
  - accepts normalized actions such as `tap`, `swipe`, `typeText`, `pressButton`
- `POST /sessions/:id/screenshot`
  - captures one screenshot and returns artifact metadata

Recommended initial response shape:

```ts
type MobileDevice = {
  id: string;
  platform: "android" | "ios";
  name: string;
  model: string;
  osVersion: string;
  status: "connected" | "busy" | "offline";
  runnerId: string;
  capabilities: string[];
  stream: {
    kind: string;
    viewerUrl?: string;
    wsUrl?: string;
  };
  control: {
    transport: "adb" | "wda";
    supportsTap: boolean;
    supportsSwipe: boolean;
    supportsTypeText: boolean;
  };
  lastSeenAt: string;
};
```

The point is not to hide platform differences entirely. The point is to make the first UI and agent layers stop caring about transport details.

## Adapter Mapping

### Android adapter into Sally-SDK

Map `ws-scrcpy` concepts into the normalized contract:

- device identifier
  - use Android serial or existing `udid`
- stream endpoint
  - map current stream/viewer data into `stream.viewerUrl` or `stream.wsUrl`
- controls
  - translate tap/swipe/type/press into the existing Android control paths
- AI lab features
  - keep Android-only lab routes behind a platform extension instead of polluting the base contract

Suggested extension shape:

```ts
type AndroidCapabilities = {
  android?: {
    adbAvailable: boolean;
    shellAvailable: boolean;
    installApkAvailable: boolean;
    aiChatUrl?: string;
  };
};
```

### iOS adapter into Sally-SDK

Map `iphone-remote` concepts into the normalized contract:

- device identifier
  - use the existing iPhone UDID
- stream endpoint
  - map the FastAPI/WebSocket stream into normalized viewer/session data
- controls
  - tap/swipe/button/key flows become normalized `actions`
- public exposure
  - keep tunnel URL metadata in the session record, not hardcoded in the UI

Suggested extension shape:

```ts
type IOSCapabilities = {
  ios?: {
    wdaAvailable: boolean;
    dvtCaptureAvailable: boolean;
    hardwareButtons: ("home" | "lock" | "volumeUp" | "volumeDown")[];
  };
};
```

## Sally-ML Consumption Model

`Sally-ML` should be a thin consumer of normalized session state.

The UI should do only these things:

- list available devices
- choose the active device
- create or resume a session
- mount the returned stream into the device stage
- send normalized actions
- display session metadata
- open platform-specific tools only when the capability exists

The UI should not:

- discover devices directly from `ws-scrcpy`
- talk directly to the iOS FastAPI service
- embed runner-specific branching throughout the component tree

If the UI needs platform-specific rendering, keep it at the edges:

- shell framing
- small capability badges
- device-specific labels

## Repo-By-Repo Integration Checklist

### `Sally-SDK`

1. Add normalized `MobileDevice`, `RunnerRecord`, `SessionRecord`, and action payload types to `packages/sdk`.
2. Expand Worker types and D1 schema to include:
   - `runnerId`
   - `platform`
   - `capabilities`
   - `channels`
   - current session metadata
3. Make `packages/agent/src/StreamProcess.ts` dispatch by platform.
4. Turn `packages/sdk/src/device/AndroidBridge.ts` into a real `ws-scrcpy` adapter.
5. Add a first normalized route layer for:
   - `GET /devices`
   - `GET /devices/:id`
   - `POST /sessions`
   - `GET /sessions/:id`
   - `POST /sessions/:id/actions`
   - `POST /sessions/:id/screenshot`

### `ws-scrcpy`

1. Keep the Android stream runtime and Sally Lab UI where they are.
2. Add a thin adapter boundary for Sally-SDK consumption instead of exposing new UI-specific endpoints.
3. Expose normalized action/session responses on top of the existing device routes.
4. Keep Android-only features under a platform extension surface:
   - AI chat
   - mailbox status / OTP
   - build / restart actions

### `iphone-remote`

1. Keep DVT capture and WDA control where they are.
2. Wrap the FastAPI service in a Sally-SDK adapter instead of moving transport code into the Worker.
3. Normalize:
   - session creation
   - viewer URL / WebSocket metadata
   - tap/swipe/button/key actions
4. Add named tunnel metadata to session records rather than hardcoding public URLs in the UI.

### `Sally-ML`

1. Consume only normalized Sally-SDK device/session APIs.
2. Keep platform-specific UI differences limited to:
   - device shell image
   - small metadata labels
   - optional capability panels
3. Mount returned stream/canvas content into the stage without embedding runner transport logic.
4. Route prompting, testing, and future build workflows through the normalized session contract.
- platform badge text
- optional tool panels

## First PR Sequence

This is the recommended order if multiple people are working in parallel.

### PR 1. Sally-SDK shared contracts

Repo:

- `Hey-Salad/Sally-SDK`

Deliverables:

- shared `MobileDevice`, `MobileSession`, and `MobileAction` types in `packages/sdk`
- Worker route stubs in `apps/worker`
- runner registration and heartbeat shape in `packages/agent`

Exit criteria:

- both Android and iOS adapters can target the same TypeScript interfaces

### PR 2. Android adapter bridge

Repo:

- `android-lab/ws-scrcpy`
- possibly a companion bridge in `Sally-SDK/packages/agent`

Deliverables:

- device discovery to normalized worker registration
- session start mapped to Android stream bootstrap
- normalized action dispatch for tap/swipe/type/button

Exit criteria:

- `Sally-SDK/apps/worker` can start and control one Android session without `Sally-ML` knowing about ADB details

### PR 3. iOS adapter bridge

Repo:

- `iphone-remote`
- possibly a companion bridge in `Sally-SDK/packages/agent`

Deliverables:

- iOS device registration
- session start mapped to current FastAPI/WebSocket stream
- normalized action dispatch to WDA and button actions

Exit criteria:

- one iOS session is controllable through the same public API shape as Android

### PR 4. Sally-ML live wiring

Repo:

- `Sally-ML`

Deliverables:

- device list backed by `Sally-SDK`
- session creation backed by `Sally-SDK`
- stage mounts normalized stream session data
- device panel metadata comes from normalized device records

Exit criteria:

- the UI can switch between one Android and one iOS device without local mock branching

### PR 5. AI workflow routing

Repos:

- `Sally-SDK`
- `ws-scrcpy`
- later `iphone-remote`

Deliverables:

- platform-neutral agent entrypoint
- Android AI routes exposed through a typed capability link
- iOS workflow surface added incrementally

Exit criteria:

- the agent can ask "what device am I talking to, what can it do, and where should I send this action"

## Do Not Do Yet

Avoid these early mistakes:

- do not merge `ws-scrcpy` and `iphone-remote` into one codebase just to get "mobile-lab"
- do not move the Android Sally Lab UI into `Sally-SDK`
- do not let `Sally-ML` call runner internals directly when a normalized SDK route can exist
- do not design the first UI around Android-only assumptions like ADB naming or scrcpy-only session fields
- do not block Android progress waiting for perfect iOS parity

## Definition Of Done For The First Integrated System

The first real `mobile-lab` milestone is complete when all of the following are true:

- `Sally-SDK` lists one Android and one iOS device through the same API
- `Sally-ML` can select either device from one device panel
- starting a session returns normalized session data for both platforms
- the stage mounts a real stream for both platforms without changing the page layout
- normalized actions work for both platforms
- platform-specific extras stay behind capability flags

At that point, the product can safely be called one `mobile-lab` system instead of two separate runner demos.
- runner registration truth

## Best First Deliverables

If doing this pragmatically, the best first integration milestones are:

1. Add shared device/session TypeScript types to `Sally-SDK/packages/sdk`.
2. Add Worker endpoints for `devices`, `sessions`, and `runner heartbeats`.
3. Wrap `ws-scrcpy` as an Android runner that registers into Sally-SDK.
4. Wrap `iphone-remote` as an iOS runner that registers into Sally-SDK.
5. Point `Sally-ML` to the Worker API for device listing and session launch.
6. Mount the live stream into `#lab-device-stage` for both platforms using the same UI contract.

## Strong Recommendation

Do not try to merge `ws-scrcpy` and `iphone-remote` into one codebase first.

That would create unnecessary risk.

The better path is:

- keep Android and iOS runners separate
- normalize them behind Sally-SDK
- let `Sally-ML` become the shared face of the system

That gives you one product without forcing one transport implementation.

## Open Questions

These should be answered before Phase 2 is considered stable:

- Will runner registration live in `packages/agent`, or will Android/iOS runners register directly to `apps/worker`?
- Will `Sally-ML` fetch stream URLs from the Worker, or directly from runner instances after session creation?
- Should AI workflows live only in Android first, or should Sally-SDK define a platform-neutral task API immediately?
- Should Cloudflare Tunnel ownership stay local-per-runner, or be standardized through Sally-SDK metadata and auth policy?

## Current Recommendation In One Sentence

Use `Sally-SDK` as the control plane, keep `ws-scrcpy` and `iphone-remote` as platform runners, and let `Sally-ML` be the shared UI that talks to one normalized Sally device/session API.
