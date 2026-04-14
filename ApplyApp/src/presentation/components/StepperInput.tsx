import React, { useState } from "react";
import { View, Text, TouchableOpacity, TextInput, StyleSheet } from "react-native";

interface StepperInputProps {
  label: string;
  value: number;
  step?: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
  unit?: string;
}

export function StepperInput({ label, value, step = 1, min = 0, max = 9999, onChange, unit }: StepperInputProps) {
  const [editing, setEditing] = useState(false);
  const [inputText, setInputText] = useState(String(value));

  function decrement() {
    const next = Math.max(min, parseFloat((value - step).toFixed(2)));
    onChange(next);
  }

  function increment() {
    const next = Math.min(max, parseFloat((value + step).toFixed(2)));
    onChange(next);
  }

  function handleEditEnd() {
    const parsed = parseFloat(inputText);
    if (!isNaN(parsed)) {
      onChange(Math.min(max, Math.max(min, parsed)));
    } else {
      setInputText(String(value));
    }
    setEditing(false);
  }

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.row}>
        <TouchableOpacity style={styles.btn} onPress={decrement}>
          <Text style={styles.btnText}>−</Text>
        </TouchableOpacity>

        {editing ? (
          <TextInput
            style={styles.valueInput}
            value={inputText}
            onChangeText={setInputText}
            onBlur={handleEditEnd}
            keyboardType="numeric"
            autoFocus
            selectTextOnFocus
          />
        ) : (
          <TouchableOpacity style={styles.valueBox} onPress={() => { setInputText(String(value)); setEditing(true); }}>
            <Text style={styles.valueText}>{value}{unit ? ` ${unit}` : ""}</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.btn} onPress={increment}>
          <Text style={styles.btnText}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: 20 },
  label: { color: "#666", fontSize: 13, marginBottom: 10 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1E1E1E",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#333",
    overflow: "hidden",
  },
  btn: {
    width: 52,
    height: 56,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#2A2A2A",
  },
  btnText: { color: "#00C853", fontSize: 24, fontWeight: "bold" },
  valueBox: {
    flex: 1,
    height: 56,
    justifyContent: "center",
    alignItems: "center",
  },
  valueText: { color: "#FFF", fontSize: 22, fontWeight: "bold" },
  valueInput: {
    flex: 1,
    height: 56,
    color: "#FFF",
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    backgroundColor: "#1E1E1E",
  },
});
