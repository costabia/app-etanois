import React from "react";
import { Text, View, StyleSheet, Image, TouchableOpacity } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import TelaHome from "./app/screens/TelaHome";
import LoginScreen from "./app/screens/Login";
import AtualizaPreco from "./app/screens/AtualizaPreco";
import {
  useFonts,
  Poppins_400Regular,
  Poppins_600SemiBold,
} from "@expo-google-fonts/poppins";
import Toast from "react-native-toast-message";

const Stack = createStackNavigator();

export default function App() {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_600SemiBold,
  });

  if (!fontsLoaded) {
    return <Text>Carregando fontes...</Text>;
  }

  return (
    <>
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={({ navigation }) => ({
          headerTitleAlign: "center",
          headerStyle: {
            backgroundColor: "#D02220",
          },
          headerTitle: () => (
            <Image
              source={require("./assets/logo-etanois.png")}
              style={{ width: 80, height: 45 }}
              resizeMode="contain"
            />
          ),
          headerRight: () =>
            navigation.getState().routeNames.includes("Home") && (
              <TouchableOpacity
                style={styles.headerButton}
                onPress={() => navigation.navigate("Login")}
              >
                <Text style={styles.headerButtonText}>Sou um posto</Text>
              </TouchableOpacity>
            ),
        })}
      >
        <Stack.Screen name="Home" component={TelaHome} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="AtualizaPreco" component={AtualizaPreco} />
      </Stack.Navigator>
    </NavigationContainer>
     <Toast />
     </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontFamily: "Poppins_400Regular",
  },
  headerButton: {
    backgroundColor: "white",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 10,
    marginRight: 10,
  },
  headerButtonText: {
    color: "#D02220",
    fontSize: 8,
    fontFamily: "Poppins_600SemiBold",
    top: 1,
  },
});
