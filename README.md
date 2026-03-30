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

Build fails at the linker stage with 3 duplicate ObjC symbols:

```
❌  duplicate symbol '_OBJC_METACLASS_$_WebGPUView' in
┌─ libreact-native-skia.a[28](WebGPUView.o)
└─ libreact-native-wgpu.a[32](WebGPUView.o)

❌  duplicate symbol '_OBJC_CLASS_$_WebGPUView' in
┌─ libreact-native-skia.a[28](WebGPUView.o)
└─ libreact-native-wgpu.a[32](WebGPUView.o)

❌  duplicate symbol 'WebGPUViewCls()' in
┌─ libreact-native-skia.a[28](WebGPUView.o)
└─ libreact-native-wgpu.a[32](WebGPUView.o)

❌  ld: 3 duplicate symbols
❌  clang: error: linker command failed with exit code 1
```

The build also emits ~1200 linker warnings about Skia's prebuilt static libraries targeting a newer iOS-simulator version than the project minimum:

```
⚠️  ld: object file (.../XCFrameworkIntermediates/react-native-skia/libsvg.a[arm64][...])
    was built for newer 'iOS-simulator' version (16.0) than being linked (15.1)
```

## Root cause

Both packages register `WebGPUView` via three independent mechanisms:

1. **`codegenConfig.ios.componentProvider`** in both `package.json` files — React Native codegen generates duplicate entries in `RCTThirdPartyComponentsProvider.mm`
2. **JS specs** — both ship `WebGPUViewNativeComponent.js` calling `codegenNativeComponent("WebGPUView")`
3. **Native ObjC files** — both ship `apple/WebGPUView.mm` and `apple/WebGPUView.h`

All three layers must be deduplicated for the two packages to coexist.
