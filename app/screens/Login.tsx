import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import {
  useFonts,
  Poppins_400Regular,
  Poppins_600SemiBold,
} from "@expo-google-fonts/poppins";

import { useNavigation, NavigationProp } from "@react-navigation/native";
import AtualizaPreco from "./AtualizaPreco";
import Colors from "../../constants/Colors";
import api from "../../api/api";

type RootStackParamList = {
  Login: undefined;
  AtualizaPreco: { token: string; id_posto: string };
};

export default function LoginScreen() {
  const [cnpj, setCnpj] = useState<any>("");
  const [senha, setSenha] = useState<any>("");
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_600SemiBold,
  });

  const handleLogin = async () => {
    if (cnpj === "" || senha === "") {
      Alert.alert("Erro", "Por favor, preencha todos os campos");
      return;
    }

    try {
      const response = await api.post("/sessions", {
        cnpj,
        senha,
      });

      const { token } = response.data;
      Alert.alert("Sucesso", "Login realizado com sucesso!");

      console.log(
        "---------------------- pra ver aq " + response.data.user.id_posto
      );
      navigation.navigate("AtualizaPreco", {
        token: token,
        id_posto: response.data.user.id_posto,
      });
    } catch (error) {
      console.error("Erro ao fazer login:", error);
      Alert.alert(
        "Erro",
        "Falha ao autenticar. Verifique suas c#D02220enciais."
      );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.cardcontainer}>
        <Image
          source={require("../../assets/login.png")}
          style={styles.imagem}
        />
        <View style={styles.textContainer}>
          <Text style={styles.title}>Login</Text>
          <Text style={styles.description}>
            Você é um parceiro? Use suas c#D02220enciais para acessar as
            informações do seu posto de gasolina.
          </Text>
        </View>
        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="CNPJ"
            value={cnpj}
            onChangeText={setCnpj}
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Senha"
            value={senha}
            onChangeText={setSenha}
            secureTextEntry
          />
          <TouchableOpacity style={styles.button} onPress={handleLogin}>
            <Text style={styles.buttonText}>Entrar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#D02220",
  },
  cardcontainer: {
    backgroundColor: "white",
    width: "100%",
    height: "100%",
    marginTop: 15,
    borderRadius: 20,
    paddingHorizontal: 30,
  },
  imagem: {
    marginBottom: 40,
  },
  form: {
    width: "100%",
  },
  textContainer: {
    display: "flex",
    gap: 6,
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontFamily: "Poppins_600SemiBold",
  },
  description: {
    fontSize: 10,
    fontFamily: "Poppins_400Regular",
    width: "100%",
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderColor: "#c3c3c3",
    borderRadius: 15,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  button: {
    backgroundColor: "#D02220",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    width: "100%",
    marginVertical: 16,
  },
  buttonText: {
    color: "#fff",
    fontFamily: "Poppins_600SemiBold",
    fontWeight: "bold",
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: "80%",
  },
});
