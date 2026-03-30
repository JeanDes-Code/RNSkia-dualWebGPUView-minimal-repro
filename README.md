# Minimal repro: duplicate `WebGPUView` registration

Demonstrates that `@shopify/react-native-skia` and `react-native-wgpu` cannot coexist — both register a native component called `WebGPUView`, causing a crash on launch.

## Versions

| Package | Version |
|---|---|
| `@shopify/react-native-skia` | 2.5.4 |
| `react-native-wgpu` | 0.5.9 |
| `react-native` | 0.83.4 |
| `expo` | SDK 55 |
| New Architecture | enabled |

## Reproduce

```bash
git clone <this-repo>
cd RNSkia-dualWebGPUView-minimal-repro
npm install --legacy-peer-deps
npx install-skia
npx expo prebuild --clean
npx expo run:ios
```

## Expected

App launches and renders both a Skia Canvas and a react-native-wgpu Canvas.

## Actual

Build produces a compiler warning about duplicate dictionary keys:

```
⚠️  (ios/build/generated/ios/RCTThirdPartyComponentsProvider.mm:25:3)

  24 |          @"WebGPUView": NSClassFromString(@"WebGPUView"), // @shopify/react-native-skia
> 25 |          @"WebGPUView": NSClassFromString(@"WebGPUView"), // react-native-wgpu
     |          ^ duplicate key in dictionary literal [-Wobjc-dictionary-duplicate-keys]
```

Both native `WebGPUView.mm` are compiled from both packages:

```
› Compiling @shopify/react-native-skia Pods/react-native-skia » WebGPUView.mm
› Compiling react-native-wgpu Pods/react-native-wgpu » WebGPUView.mm
```

The app silently fails to open (native-level class collision), or if it does open, crashes with:

```
Invariant Violation: Tried to register two views with the same name WebGPUView
```

## Root cause

Both packages register `WebGPUView` via three independent mechanisms:

1. **`codegenConfig.ios.componentProvider`** in both `package.json` files — React Native codegen generates duplicate entries in `RCTThirdPartyComponentsProvider.mm`
2. **JS specs** — both ship `WebGPUViewNativeComponent.js` calling `codegenNativeComponent("WebGPUView")`
3. **Native ObjC files** — both ship `apple/WebGPUView.mm` and `apple/WebGPUView.h`

All three layers must be deduplicated for the two packages to coexist.
