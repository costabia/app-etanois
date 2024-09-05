import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  FlatList,
  Text,
  View,
  ActivityIndicator,
  Image,
  TextInput,
  Modal,
  TouchableOpacity,
} from "react-native";
import {
  useFonts,
  Poppins_400Regular,
  Poppins_600SemiBold,
} from "@expo-google-fonts/poppins";
import openMap from "react-native-open-maps";
import { useNavigation } from "@react-navigation/native";
import { mostraPostos } from "../../api/requisicoes";
import api from "../../api/api";

export default function TelaHome() {
  const navigation = useNavigation<any>();
  const [postos, setPostos] = useState<any[]>([]);
  const [filteredPostos, setFilteredPostos] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedPosto, setSelectedPosto] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [detailedPosto, setDetailedPosto] = useState<any>(null);
  const [endereco, setEndereco] = useState<string | null>(null);
  const [selectedFuel, setSelectedFuel] = useState<number>(1);

  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_600SemiBold,
  });

  const fetchPostos = async (id_combustivel: number) => {
    try {
      const response = await mostraPostos({ id_combustivel });
      setPostos(response);
      setFilteredPostos(response);
      setLoading(false);
    } catch (error) {
      console.error("Erro ao trazer postos:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPostos(1);
  }, []);

  const handleFilterChange = (id_combustivel: number) => {
    setSelectedFuel(id_combustivel);
    setLoading(true);
    fetchPostos(id_combustivel);
  };

  const getFuelButtonStyle = (id_combustivel: number) => {
    const colors: Record<number, string> = {
      1: "blue",
      2: "green",
      3: "red",
      4: "#ffd700",
    };
    
    return {
      backgroundColor:
        selectedFuel === id_combustivel
          ? colors[id_combustivel]
          : "transparent",
      borderColor: colors[id_combustivel],
    };
  };

  const getFuelTextStyle = (id_combustivel: number) => {
    const colors: Record<number, string> = {
      1: "blue",
      2: "green",
      3: "red",
      4: "#ffd700",
    };
    return {
      color: selectedFuel === id_combustivel ? "white" : colors[id_combustivel],
    };
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const filtered = postos.filter((posto: any) =>
      posto.nome.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredPostos(filtered);
  };

  const handleItemPress = async (posto: any) => {
    if (posto && posto.id_posto !== undefined) {
      setSelectedPosto(posto);
      await fetchPostoDetails(posto.id_posto);
      setModalVisible(true);
    } else {
      console.error(
        "ID do posto é undefined, não foi possível buscar os detalhes."
      );
    }
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedPosto(null);
    setDetailedPosto(null);
    setEndereco(null);
  };

  const fetchPostoDetails = async (id: number) => {
    try {
      const response = await api.get(`/precos/${id}`);
      setDetailedPosto(response.data);
      setEndereco(response.data.endereco);
    } catch (error) {
      console.error("Erro ao buscar detalhes do posto:", error);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  const openGoogleMaps = () => {
    if (endereco) {
      openMap({ query: endereco });
    } else {
      console.error("Endereço não disponível.");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TextInput
          style={styles.input}
          placeholder="Pesquisar postos de gasolina"
          value={searchQuery}
          onChangeText={handleSearch}
        />
      </View>
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterButton, getFuelButtonStyle(1)]}
          onPress={() => handleFilterChange(1)}
        >
          <Text style={[styles.filterText, getFuelTextStyle(1)]}>Gasolina</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterButton, getFuelButtonStyle(2)]}
          onPress={() => handleFilterChange(2)}
        >
          <Text style={[styles.filterText, getFuelTextStyle(2)]}>
            Aditivada
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterButton, getFuelButtonStyle(3)]}
          onPress={() => handleFilterChange(3)}
        >
          <Text style={[styles.filterText, getFuelTextStyle(3)]}>Diesel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterButton, getFuelButtonStyle(4)]}
          onPress={() => handleFilterChange(4)}
        >
          <Text style={[styles.filterText, getFuelTextStyle(4)]}>Etanol</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.body}>
        <Text style={styles.tituloPosto}>Postos de gasolina</Text>
        <FlatList
          data={filteredPostos}
          keyExtractor={(item) =>
            item.id_posto ? item.id_posto.toString() : Math.random().toString()
          }
          ListEmptyComponent={<Text>Sem postos cadastrados até o momento.</Text>}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => handleItemPress(item)}
              style={styles.postoContainer}
            >
              <View style={styles.imageContainer}>
                <Text style={styles.idText}>{item.id_posto || "N/A"}</Text>
                <Image source={{ uri: item.imagem }} style={styles.image} />
                <View style={styles.infoContainer}>
                  <Text>{item.avaliacao || 5}</Text>
                  <Text style={styles.title}>
                    {item.nome || "Nome não disponível"}
                  </Text>
                  <Text style={styles.endereco}>
                    {item.endereco || "Endereço não disponível"}
                  </Text>
                </View>
              </View>
              <View style={styles.precoContainer}>
                <Text style={styles.precoText}>R${item.preco || "N/A"}</Text>
              </View>
            </TouchableOpacity>
          )}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      </View>

      {detailedPosto && (
        <Modal
          visible={modalVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={handleCloseModal}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.containerImage}>
                <Image
                  source={{ uri: detailedPosto.imagem }}
                  style={styles.modalImage}
                />
                <View style={styles.containerText}>
                  <Text style={[styles.modalText, { marginBottom: 0 }]}>5</Text>
                  <Text style={styles.modalTitle}>{detailedPosto.nome}</Text>
                  <Text style={styles.modalText}>{detailedPosto.endereco}</Text>
                </View>
              </View>

              <View
                style={{
                  display: "flex",
                  flexDirection: "row",
                  marginVertical: 20,
                  gap: 4,
                }}
              >
                <View style={styles.containerPrecos}>
                  <Text style={styles.textPreco}>Diesel</Text>
                  <Text style={styles.textPreco}>
                    R${detailedPosto.precos.diesel}
                  </Text>
                </View>
                <View style={styles.containerPrecos}>
                  <Text style={styles.textPreco}>Gasolina</Text>
                  <Text style={styles.textPreco}>
                    R${detailedPosto.precos.gasolina_comum}
                  </Text>
                </View>
                <View style={styles.containerPrecos}>
                  <Text style={styles.textPreco}>Podium</Text>
                  <Text style={styles.textPreco}>
                    R${detailedPosto.precos.gasolina_aditivada}
                  </Text>
                </View>
                <View style={styles.containerPrecos}>
                  <Text style={styles.textPreco}>Etanol</Text>
                  <Text style={styles.textPreco}>
                    R${detailedPosto.precos.etanol}
                  </Text>
                </View>
              </View>

              <View style={{ display: "flex", flexDirection: "row", gap: 4 }}>
                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={handleCloseModal}
                >
                  <Text style={styles.modalButtonText}>Voltar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={openGoogleMaps}
                >
                  <Text style={styles.modalButtonText}>Ver rotas</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  filterContainer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    marginVertical: 20,
  },
  filterButton: {
    borderWidth: 1,
    paddingVertical: 6,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  filterText: {
    fontSize: 10,
    fontFamily: "Poppins_600SemiBold",
    top: 0.8,
  },
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
    padding: 12,
    borderRadius: 18,
    fontFamily: "Poppins_400Regular",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    position: "absolute",
    fontSize: 12,
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
    fontSize: 8,
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
    marginRight: 30,
  },
  containerPrecos: {
    borderWidth: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 10,
    width: "24%",
  },
  textPreco: {
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
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
  },
  modalImage: {
    width: 80,
    height: 80,
    marginRight: 20,
    borderRadius: 10,
    marginBottom: 10,
  },
  modalText: {
    fontSize: 10,
    width: "70%",
    fontFamily: "Poppins_400Regular",
    lineHeight: 16,
  },
  modalButton: {
    backgroundColor: "red",
    borderRadius: 5,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginTop: 10,
    width: "50%",
    display: "flex",
    alignItems: "center",
  },
  modalButtonText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
    fontFamily: "Poppins_600SemiBold",
  },
});
