import axios from "axios";
import api from "./api";

const mostraPostos = async ({ id_combustivel }: any) => {
  console.log(id_combustivel)
  try {
    const response = await api.get(`/posto/${id_combustivel}`);
    return response.data;
  } catch (error) {
    console.error("Erro ao mostrar postos", error);
    throw error;
  }
};

export { mostraPostos };
