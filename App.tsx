import { Canvas, Circle } from "@shopify/react-native-skia";
import { Canvas as WGPUCanvas } from "react-native-wgpu";
import { StyleSheet, Text, View } from "react-native";

export default function App() {
  return (
    <View style={styles.container}>
      <Text>Skia + react-native-wgpu minimal repro</Text>

      {/* Skia Canvas */}
      <Canvas style={{ width: 100, height: 100 }}>
        <Circle cx={50} cy={50} r={40} color="cyan" />
      </Canvas>

      {/* react-native-wgpu Canvas */}
      <WGPUCanvas style={{ width: 100, height: 100 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    gap: 20,
  },
});
