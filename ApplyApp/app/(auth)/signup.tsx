import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from "react-native";
import { Link, useRouter } from "expo-router";
import { supabase } from "../../src/infrastructure/api/supabase";
import { UserProfile } from "../../src/domain/entities/UserProfile";
import { SQLiteUserProfileRepository } from "../../src/infrastructure/repositories/SQLiteUserProfileRepository";
import { SupabaseUserProfileRepository } from "../../src/infrastructure/repositories/SupabaseUserProfileRepository";

export default function SignUpScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function signUpWithEmail() {
    if (!name.trim() || name.trim().length < 2) {
      Alert.alert("Erro", "Digite seu nome completo (mínimo 2 caracteres).");
      return;
    }

    setLoading(true);
    try {
      const { data: { session, user }, error } = await supabase.auth.signUp({ email, password });

      if (error) {
        Alert.alert("Erro no Cadastro", error.message);
        return;
      }

      // Criar perfil do usuário
      const userId = session?.user?.id ?? user?.id;
      if (userId) {
        const profile = new UserProfile({ id: userId, name: name.trim() });
        const localRepo = new SQLiteUserProfileRepository();
        const remoteRepo = new SupabaseUserProfileRepository();
        // Salva localmente sempre (offline-first)
        await localRepo.save(profile);
        // Tenta salvar remotamente (pode falhar se ainda não confirmou email)
        try { await remoteRepo.save(profile); } catch { /* ignorar em confirmação pendente */ }
      }

      if (!session) {
        Alert.alert("Sucesso", "Verifique seu e-mail para confirmar a conta!");
      } else {
        router.replace("/(app)");
      }
    } catch (err: any) {
      Alert.alert("Erro", err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>Criar Conta</Text>
      <Text style={styles.subtitle}>REPFORGE TRACKER</Text>

      <TextInput
        style={styles.input}
        onChangeText={setName}
        value={name}
        placeholder="Nome completo"
        placeholderTextColor="#666"
        autoCapitalize="words"
      />
      <TextInput
        style={styles.input}
        onChangeText={setEmail}
        value={email}
        placeholder="E-mail"
        placeholderTextColor="#666"
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        onChangeText={setPassword}
        value={password}
        placeholder="Senha"
        placeholderTextColor="#666"
        secureTextEntry
      />
      <TouchableOpacity
        style={[styles.button, loading && { opacity: 0.7 }]}
        onPress={signUpWithEmail}
        disabled={loading}
      >
        <Text style={styles.buttonText}>{loading ? "Cadastrando..." : "Cadastrar"}</Text>
      </TouchableOpacity>
      <Link href="/(auth)" asChild>
        <TouchableOpacity style={styles.linkButton}>
          <Text style={styles.linkText}>Já tem uma conta? Entrar</Text>
        </TouchableOpacity>
      </Link>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#121212",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#00C853",
    textAlign: "center",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
    letterSpacing: 3,
    marginBottom: 40,
  },
  input: {
    backgroundColor: "#1E1E1E",
    color: "#FFF",
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#333",
  },
  button: {
    backgroundColor: "#00C853",
    padding: 15,
    borderRadius: 8,
    marginTop: 10,
  },
  buttonText: {
    color: "#000",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 16,
  },
  linkButton: {
    marginTop: 20,
  },
  linkText: {
    color: "#00C853",
    textAlign: "center",
  },
});
