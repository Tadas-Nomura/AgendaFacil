

import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'agenda_eventos';

export async function getEventos() {
  try {
    const json = await AsyncStorage.getItem(KEY);
    return json ? JSON.parse(json) : [];
  } catch {
    return [];
  }
}

export async function salvarEvento(evento) {
  try {
    const eventos = await getEventos();
    const novo = { ...evento, id: Date.now().toString() };
    await AsyncStorage.setItem(KEY, JSON.stringify([...eventos, novo]));
    return novo;
  } catch (e) {
    throw new Error('Erro ao salvar evento');
  }
}

export async function deletarEvento(id) {
  try {
    const eventos = await getEventos();
    const filtrados = eventos.filter(e => e.id !== id);
    await AsyncStorage.setItem(KEY, JSON.stringify(filtrados));
  } catch (e) {
    throw new Error('Erro ao deletar evento');
  }
}