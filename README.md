# Sally-ML

Safe staging repo for a unified Android + iOS lab surface.

This repo is intentionally separate from `ws-scrcpy` so the existing Android system can keep running unchanged while the shared UI and shared device contract are designed in isolation.

`Sally-ML` is the UI layer for a larger `mobile-lab` system. It is not meant to become the source of truth for devices, sessions, or runner internals.

## Current goal

Build the first product shell for:

- one device list containing Android and iOS
- one shared session/workspace surface
- one shared target manifest for code location, build surfaces, gestures, and expected behaviors
- one future agent entrypoint that can route work to the correct runner

## Existing systems this is meant to unify

- Android runner and lab UI:
  - `/home/hs-chilu/android-lab/ws-scrcpy`
- iOS runner:
  - `~/iphone-remote`
- Cloud control plane:
  - `/home/hs-chilu/android-lab/ws-scrcpy/cloudflare/browserless-sessions`

## Local development

```bash
cd /home/hs-chilu/mobile-labs
npm install
npm run dev
```

## Build

```bash
npm run build
```

## First-pass product model

The UI is designed around a shared `mobile target` contract:

- repo root
- framework / entry mode
- Android build surface
- iOS build surface
- dev server surface
- named gestures
- expected behaviors

The current app uses mock data only. It is a design and architecture shell, not a live runner yet.

Current UI additions:

- device dropdown in the device panel for selecting the active phone
- first real hardware framing asset for `iPhone 11 Pro`
- iOS stage uses the provided device-frame PNG instead of a generic placeholder

## Integration planning

- [Sally-SDK + Mobile Lab Integration Plan](./docs/sally-sdk-mobile-lab-integration.md)
- Shared contract draft:
  - [src/types.ts](/home/hs-chilu/mobile-labs/src/types.ts)
  - [src/mock-data.ts](/home/hs-chilu/mobile-labs/src/mock-data.ts)

Short version:

- `Sally-SDK` should be the control plane
- `ws-scrcpy` should remain the Android execution engine
- `iphone-remote` should remain the iOS execution engine
- `Sally-ML` should consume normalized mobile-lab APIs and render one shared operator experience
