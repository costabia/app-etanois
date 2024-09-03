import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
} from "react-native";
import { useRoute } from "@react-navigation/native";
import api from "../../api/api";
import {
  useFonts,
  Poppins_400Regular,
  Poppins_600SemiBold,
} from "@expo-google-fonts/poppins";

export default function AtualizaPreco() {
  const route = useRoute<any>();
  const { token, id_posto } = route.params;
  const [detailedPosto, setDetailedPosto] = useState<any>(null);
  const [endereco, setEndereco] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState<boolean>(false);

  const [gasolinaComum, setGasolinaComum] = useState<any>();
  const [gasolinaAditivada, setGasolinaAditivada] = useState<any>();
  const [etanol, setEtanol] = useState<any>();
  const [diesel, setDiesel] = useState<any>();

  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_600SemiBold,
  });

  useEffect(() => {
    fetchTrazPostos(id_posto);
  }, []);

  const fetchTrazPostos = async (id: any) => {
    console.log("fetchTrazPostos foi chamada com id:", id);
    try {
      const response = await api.get(`/precos/${id}`);
      console.log("Resposta recebida:", response.data);
      if (response.data) {
        setDetailedPosto(response.data);
        setEndereco(response.data.endereco);
        setGasolinaComum(response.data.precos.gasolina_comum.toString());
        setGasolinaAditivada(
          response.data.precos.gasolina_aditivada.toString()
        );
        setEtanol(response.data.precos.etanol);
        setDiesel(response.data.precos.diesel.toString());
      }
    } catch (error) {
      console.error("Erro ao buscar detalhes do posto:", error);
    }
  };

  const handleUpdatePreco = async () => {
    if (!detailedPosto) return;

    const idPosto = detailedPosto.posto_id;
    const precosAtualizados = [];

    if (parseFloat(gasolinaComum) !== detailedPosto.precos.gasolina_comum) {
      precosAtualizados.push({
        preco: parseFloat(gasolinaComum),
        fk_id_posto: idPosto,
        fk_id_combustivel: 1,
      });
    }

    if (
      parseFloat(gasolinaAditivada) !== detailedPosto.precos.gasolina_aditivada
    ) {
      precosAtualizados.push({
        preco: parseFloat(gasolinaAditivada),
        fk_id_posto: idPosto,
        fk_id_combustivel: 2,
      });
    }

    if (parseFloat(etanol) !== detailedPosto.precos.etanol) {
      precosAtualizados.push({
        preco: parseFloat(etanol),
        fk_id_posto: idPosto,
        fk_id_combustivel: 4,
      });
    }

    if (parseFloat(diesel) !== detailedPosto.precos.diesel) {
      precosAtualizados.push({
        preco: parseFloat(diesel),
        fk_id_posto: idPosto,
        fk_id_combustivel: 3,
      });
    }

    if (precosAtualizados.length === 0) {
      console.log("Nenhuma alteração de preço detectada.");
      return;
    }

    try {
      for (const precoData of precosAtualizados) {
        await api.put("/precos", precoData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
      }

      fetchTrazPostos(idPosto);
    } catch (error) {
      console.error("Erro ao atualizar os preços:", error);
    }
  };

  const toggleModal = () => {
    setModalVisible(!modalVisible);
  };

  if (!detailedPosto) {
    return <Text>Carregando dados...</Text>;
  }

  return (
    <View style={styles.container}>
      <View style={styles.modalContent}>
        <View style={styles.containerImage}>
          {detailedPosto && (
            <View style={styles.containerText}>
              <Text style={styles.modalTitle}>
                Bem vindo, {detailedPosto.nome}
              </Text>
              <Text style={styles.modalText}>
                Atualize os valores do combustíveis a seguir:
              </Text>
            </View>
          )}
        </View>

        <View
          style={{
            display: "flex",
            flexDirection: "row",
            marginVertical: 10,
            gap: 4,
          }}
        >
          {detailedPosto && detailedPosto.precos && (
            <>
              <View style={styles.containerPrecoWrapper}>
                <Text style={styles.textPreco}>Gasolina</Text>
                <View style={styles.containerPrecos}>
                  <TextInput
                    style={styles.input}
                    value={gasolinaComum}
                    onChangeText={setGasolinaComum}
                    keyboardType="numeric"
                  />
                </View>
              </View>
              <View style={styles.containerPrecoWrapper}>
                <Text style={styles.textPreco}>Aditivada</Text>
                <View style={styles.containerPrecos}>
                  <TextInput
                    style={styles.input}
                    value={gasolinaAditivada}
                    onChangeText={setGasolinaAditivada}
                    keyboardType="numeric"
                  />
                </View>
              </View>
            </>
          )}
        </View>
        <View style={{ display: "flex", flexDirection: "row", gap: 4 }}>
          {detailedPosto && detailedPosto.precos && (
            <>
              <View style={styles.containerPrecoWrapper}>
                <Text style={styles.textPreco}>Etanol</Text>
                <View style={styles.containerPrecos}>
                  <TextInput
                    style={styles.input}
                    value={etanol}
                    onChangeText={setEtanol}
                    keyboardType="numeric"
                  />
                </View>
              </View>
              <View style={styles.containerPrecoWrapper}>
                <Text style={styles.textPreco}>Diesel</Text>
                <View style={styles.containerPrecos}>
                  <TextInput
                    style={styles.input}
                    value={diesel}
                    onChangeText={setDiesel}
                    keyboardType="numeric"
                  />
                </View>
              </View>
            </>
          )}
        </View>

        <TouchableOpacity
          style={styles.atualizarButton}
          onPress={handleUpdatePreco}
        >
          <Text style={styles.atualizarButtonText}>Atualizar</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.cardPlano} onPress={toggleModal}>
          <Text style={styles.cardPlanoTitle}>
            Você já conhece nossos planos?
          </Text>
          <Text style={styles.cardPlanoText}>
            Plano atual: {detailedPosto.plano}
          </Text>
          <Text style={styles.cardPlanoText}>
            Destaque seu posto e ganhe mais visibilidade no app! Conheça nossos
            planos e garanta seu lugar no topo da lista.
          </Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={toggleModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Nossos Planos</Text>

            <View
              style={{
                display: "flex",
                flexDirection: "row",
                gap: 10,
                borderColor: "gray",
                borderWidth: 1,
                borderRadius: 10,
                padding: 18,
                marginBottom: 10,
              }}
            >
              <View style={{ marginRight: 10 }}>
                <Text style={styles.planTitle}>Grátis</Text>
                <Text style={styles.modalText}>R$ 0.00</Text>
              </View>
              <Text style={styles.modalText}>
                É apresentado junto com os demais postos sem uma posição
                privilegiada. Uma boa opção para novos usuários que desejam
                testar a aplicação antes de decidir por um plano pago.
              </Text>
            </View>
            <View
              style={{
                display: "flex",
                flexDirection: "row",
                gap: 10,
                borderColor: "gray",
                borderWidth: 1,
                borderRadius: 10,
                padding: 18,
              }}
            >
              <View style={{ marginRight: 10 }}>
                <Text style={styles.planTitle}>Premium</Text>
                <Text style={styles.modalText}>R$ 30.00</Text>
              </View>
              <Text style={styles.modalText}>
                Acesso a todos os recursos da aplicação, com suporte básico.
                Adequado para usuários que desejam alavancar suas vendas, tendo
                seu posto exibido em uma melhor posição.
              </Text>
            </View>

            <TouchableOpacity
              style={styles.atualizarButton}
              onPress={toggleModal}
            >
              <Text style={styles.atualizarButtonText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  body: {
    padding: 20,
  },
  tituloPosto: {
    fontSize: 14,
    fontWeight: "bold",
    fontFamily: "Poppins_600SemiBold",
    marginBottom: 10,
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 8,
    fontFamily: "Poppins_400Regular",
    width: "100%",
  },
  loginButton: {
    backgroundColor: "#000",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  loginButtonText: {
    color: "#fff",
    fontFamily: "Poppins_600SemiBold",
  },
  title: {
    fontSize: 14,
    fontWeight: "bold",
    fontFamily: "Poppins_600SemiBold",
  },
  separator: {
    height: 1,
    backgroundColor: "#ccc",
    marginVertical: 10,
  },
  imageContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  containerText: {
    flexDirection: "column",
  },
  postoContainer: {
    paddingVertical: 15,
    borderRadius: 5,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  precoContainer: {
    flexDirection: "column",
    alignItems: "flex-end",
    justifyContent: "flex-start",
  },
  precoText: {
    fontFamily: "Poppins_600SemiBold",
  },
  tipoText: {
    fontFamily: "Poppins_400Regular",
    fontSize: 12,
  },
  endereco: {
    fontFamily: "Poppins_400Regular",
    fontSize: 10,
    width: "60%",
  },
  infoContainer: {
    flexDirection: "column",
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 10,
  },
  containerImage: {
    display: "flex",
    alignItems: "center",
    flexDirection: "row",
    width: "50%",
  },
  containerPrecoWrapper: {
    width: "50%",
    paddingHorizontal: 5,
  },
  containerPrecos: {
    borderWidth: 1,
    borderColor: "gray",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 10,
    width: "100%",
  },
  textPreco: {
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
    marginBottom: 5,
    textAlign: "left",
  },
  header: {
    backgroundColor: "#D02220",
    width: "100%",
    paddingVertical: 30,
    alignItems: "center",
    marginBottom: 20,
  },
  idText: {
    color: "gray",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    width: "100%",
    backgroundColor: "white",
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    padding: 35,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "bold",
    fontFamily: "Poppins_600SemiBold",
    marginBottom: 10,
  },
  modalText: {
    fontSize: 10,
    marginBottom: 20,
    fontFamily: "Poppins_400Regular",
  },
  planTitle: {
    fontSize: 15,
    fontWeight: "bold",
    fontFamily: "Poppins_600SemiBold",
    marginBottom: 5,
  },
  modalButton: {
    backgroundColor: "#D02220",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    width: "100%",
    marginVertical: 16,
  },
  modalButtonText: {
    color: "white",
    fontSize: 12,
    fontFamily: "Poppins_600SemiBold",
  },
  atualizarButton: {
    backgroundColor: "#D02220",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    width: "100%",
    marginVertical: 16,
  },
  atualizarButtonText: {
    color: "white",
    fontFamily: "Poppins_600SemiBold",
    fontSize: 12,
  },
  cardPlano: {
    backgroundColor: "#f9f9f9",
    padding: 20,
    borderRadius: 8,
    marginTop: 20,
    alignItems: "flex-start",
  },
  cardPlanoTitle: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 14,
    marginBottom: 10,
  },
  cardPlanoText: {
    fontFamily: "Poppins_400Regular",
    fontSize: 10,
    textAlign: "left",
    marginBottom: 5,
  },
});
