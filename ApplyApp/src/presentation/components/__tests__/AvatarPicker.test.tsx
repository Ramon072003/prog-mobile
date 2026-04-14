import React from "react";
import { render, fireEvent, act } from "@testing-library/react-native";
import { Alert } from "react-native";
import { AvatarPicker } from "../../components/AvatarPicker";
import * as ImagePicker from "expo-image-picker";

// expo-camera e expo-image-picker são mockados globalmente em __mocks__/

jest.spyOn(Alert, "alert");

describe("AvatarPicker Component", () => {
  const onImageSelected = jest.fn();
  const onRemove = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renderiza o ícone padrão quando avatarUrl é null", () => {
    const { getByTestId, queryByTestId } = render(
      <AvatarPicker
        avatarUrl={null}
        uploading={false}
        onImageSelected={onImageSelected}
      />
    );
    expect(getByTestId("avatar-default-icon")).toBeTruthy();
    expect(queryByTestId("avatar-image")).toBeNull();
  });

  it("renderiza <Image> quando avatarUrl está presente", () => {
    const { getByTestId, queryByTestId } = render(
      <AvatarPicker
        avatarUrl="https://example.com/avatar.jpg"
        uploading={false}
        onImageSelected={onImageSelected}
      />
    );
    expect(getByTestId("avatar-image")).toBeTruthy();
    expect(queryByTestId("avatar-default-icon")).toBeNull();
  });

  it("exibe Alert com opções ao tocar no avatar", () => {
    const { getByTestId } = render(
      <AvatarPicker
        avatarUrl={null}
        uploading={false}
        onImageSelected={onImageSelected}
      />
    );
    fireEvent.press(getByTestId("avatar-picker"));
    expect(Alert.alert).toHaveBeenCalledWith(
      "Foto de Perfil",
      "Escolha uma opção",
      expect.arrayContaining([
        expect.objectContaining({ text: "Tirar foto" }),
        expect.objectContaining({ text: "Escolher da galeria" }),
        expect.objectContaining({ text: "Cancelar" }),
      ])
    );
  });

  it("exibe opção 'Remover foto' apenas quando avatarUrl está presente", () => {
    const { getByTestId } = render(
      <AvatarPicker
        avatarUrl="https://example.com/avatar.jpg"
        uploading={false}
        onImageSelected={onImageSelected}
        onRemove={onRemove}
      />
    );
    fireEvent.press(getByTestId("avatar-picker"));
    const alertCall = (Alert.alert as jest.Mock).mock.calls[0];
    const options = alertCall[2] as { text: string }[];
    expect(options.some((o) => o.text === "Remover foto")).toBe(true);
  });

  it("NÃO exibe opção 'Remover foto' quando avatarUrl é null", () => {
    const { getByTestId } = render(
      <AvatarPicker
        avatarUrl={null}
        uploading={false}
        onImageSelected={onImageSelected}
      />
    );
    fireEvent.press(getByTestId("avatar-picker"));
    const alertCall = (Alert.alert as jest.Mock).mock.calls[0];
    const options = alertCall[2] as { text: string }[];
    expect(options.some((o) => o.text === "Remover foto")).toBe(false);
  });

  it("chama onImageSelected com a URI da galeria ao selecionar imagem", async () => {
    (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValueOnce({
      canceled: false,
      assets: [{ uri: "file:///gallery/selected.jpg" }],
    });

    const { getByTestId } = render(
      <AvatarPicker
        avatarUrl={null}
        uploading={false}
        onImageSelected={onImageSelected}
      />
    );

    fireEvent.press(getByTestId("avatar-picker"));

    // Simula clique em "Escolher da galeria"
    const alertCall = (Alert.alert as jest.Mock).mock.calls[0];
    const options = alertCall[2] as { text: string; onPress?: () => void }[];
    const galleryOption = options.find((o) => o.text === "Escolher da galeria");

    await act(async () => {
      galleryOption?.onPress?.();
    });

    expect(onImageSelected).toHaveBeenCalledWith("file:///gallery/selected.jpg");
  });

  it("exibe ActivityIndicator enquanto uploading=true", () => {
    const { UNSAFE_queryByType } = render(
      <AvatarPicker
        avatarUrl={null}
        uploading={true}
        onImageSelected={onImageSelected}
      />
    );
    const { ActivityIndicator } = require("react-native");
    expect(UNSAFE_queryByType(ActivityIndicator)).not.toBeNull();
  });

  it("desabilita o botão durante upload", () => {
    const { getByTestId } = render(
      <AvatarPicker
        avatarUrl={null}
        uploading={true}
        onImageSelected={onImageSelected}
      />
    );
    const btn = getByTestId("avatar-picker");
    // TouchableOpacity com disabled=true não chama Alert
    fireEvent.press(btn);
    expect(Alert.alert).not.toHaveBeenCalled();
  });

  it("mostra Alert amigável quando permissão da galeria é negada", async () => {
    (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValueOnce({
      status: "denied",
      canAskAgain: false,
    });

    const { getByTestId } = render(
      <AvatarPicker
        avatarUrl={null}
        uploading={false}
        onImageSelected={onImageSelected}
      />
    );

    fireEvent.press(getByTestId("avatar-picker"));
    const alertCall = (Alert.alert as jest.Mock).mock.calls[0];
    const options = alertCall[2] as { text: string; onPress?: () => void }[];
    const galleryOption = options.find((o) => o.text === "Escolher da galeria");

    await act(async () => {
      galleryOption?.onPress?.();
    });

    expect(Alert.alert).toHaveBeenCalledTimes(2);
    const secondAlert = (Alert.alert as jest.Mock).mock.calls[1];
    expect(secondAlert[0]).toBe("Permissão necessária");
    expect(onImageSelected).not.toHaveBeenCalled();
  });
});
