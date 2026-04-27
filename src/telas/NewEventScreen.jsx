
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ScrollView, Modal
} from 'react-native';
import { createBooking, fetchEventTypes } from '../services/CalCalendar';

const TIPOS_PREDEFINIDOS = [
  { id: '1', label: 'Consulta', categoria: 'profissional' },
  { id: '2', label: 'Reunião de Trabalho', categoria: 'profissional' },
  { id: '3', label: 'Visita Técnica', categoria: 'profissional' },
  { id: '4', label: 'Aniversário', categoria: 'casual' },
  { id: '5', label: 'Compromisso Pessoal', categoria: 'casual' },
  { id: '6', label: 'Outro', categoria: 'casual' },
];

const FORM_INICIAL = {
  nome: '', descricao: '', dia: '', mes: '',
  ano: '', hora: '', minuto: '',
  repetirTodoAno: false, tipoSelecionado: null,
};

export default function NewEventScreen({ navigation }) {
  const [form, setForm] = useState(FORM_INICIAL);
  const [modalTipo, setModalTipo] = useState(false);
  const [loading, setLoading] = useState(false);

  function set(campo, valor) {
    setForm(f => ({ ...f, [campo]: valor }));
  }

  async function handleSave() {
  const { nome, dia, mes, ano, hora, minuto, tipoSelecionado } = form;

  if (!nome || !dia || !mes || !ano || !hora || !minuto || !tipoSelecionado) {
    Alert.alert('Atenção', 'Preencha todos os campos obrigatórios.');
    return;
  }

  const diaF = dia.padStart(2, '0');
  const mesF = mes.padStart(2, '0');
  const date = `${ano}-${mesF}-${diaF}`;
  const time = `${hora.padStart(2, '0')}:${minuto.padStart(2, '0')}`;

  const diaNum = parseInt(dia), mesNum = parseInt(mes), anoNum = parseInt(ano);
  const horaNum = parseInt(hora), minNum = parseInt(minuto);

  if (diaNum < 1 || diaNum > 31 || mesNum < 1 || mesNum > 12 || anoNum < 2000) {
    Alert.alert('Atenção', 'Data inválida. Verifique dia, mês e ano.');
    return;
  }
  if (horaNum > 23 || minNum > 59) {
    Alert.alert('Atenção', 'Horário inválido.');
    return;
  }

  setLoading(true);
  try {
    const eventTypes = await fetchEventTypes();

  if (!eventTypes.length) {
  Alert.alert('Erro', 'Nenhum tipo de evento encontrado no Cal.com');
  return;
  }

  const eventTypeId = eventTypes[0].id;

  await createBooking(
   eventTypeId,
    nome,
    'usuario@email.com',
    date,
    time
  );  

    Alert.alert(
      'Agendado!',
      `"${nome}" marcado para ${diaF}/${mesF}/${ano} às ${time}.`,
      [{ text: 'OK', onPress: () => {
        setForm(FORM_INICIAL);
        navigation.navigate('Calendário');
      }}]
    );
  } catch (e) {
    Alert.alert('Erro detalhado', e?.message || JSON.stringify(e));
  }
  setLoading(false);
}

  const { nome, descricao, dia, mes, ano, hora, minuto, repetirTodoAno, tipoSelecionado } = form;

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">

      <Text style={styles.label}>Tipo de agendamento *</Text>
      <TouchableOpacity style={styles.selector} onPress={() => setModalTipo(true)}>
        <Text style={tipoSelecionado ? styles.selectorText : styles.selectorPlaceholder}>
          {tipoSelecionado ? `${tipoSelecionado.label} · ${tipoSelecionado.categoria}` : 'Selecione um tipo...'}
        </Text>
        <Text style={styles.selectorArrow}>▾</Text>
      </TouchableOpacity>

      <Modal visible={modalTipo} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Tipo de agendamento</Text>

            <Text style={styles.modalSection}>Profissional</Text>
            {TIPOS_PREDEFINIDOS.filter(t => t.categoria === 'profissional').map(tipo => (
              <TouchableOpacity
                key={tipo.id}
                style={[styles.modalOption, tipoSelecionado?.id === tipo.id && styles.modalOptionSelected]}
                onPress={() => { set('tipoSelecionado', tipo); setModalTipo(false); }}
              >
                <Text style={[styles.modalOptionText, tipoSelecionado?.id === tipo.id && styles.modalOptionTextSelected]}>
                  {tipo.label}
                </Text>
              </TouchableOpacity>
            ))}

            <Text style={styles.modalSection}>Casual</Text>
            {TIPOS_PREDEFINIDOS.filter(t => t.categoria === 'casual').map(tipo => (
              <TouchableOpacity
                key={tipo.id}
                style={[styles.modalOption, tipoSelecionado?.id === tipo.id && styles.modalOptionSelected]}
                onPress={() => { set('tipoSelecionado', tipo); setModalTipo(false); }}
              >
                <Text style={[styles.modalOptionText, tipoSelecionado?.id === tipo.id && styles.modalOptionTextSelected]}>
                  {tipo.label}
                </Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity style={styles.modalCancel} onPress={() => setModalTipo(false)}>
              <Text style={styles.modalCancelText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Text style={styles.label}>Nome do agendamento *</Text>
      <TextInput
        style={styles.input}
        placeholder="Ex: Consulta com Dr. Silva"
        value={nome}
        onChangeText={v => set('nome', v)}
      />

      <Text style={styles.label}>Data *</Text>
      <View style={styles.dateRow}>
        <TextInput
          style={[styles.input, styles.dateInput]}
          placeholder="DD"
          value={dia}
          onChangeText={v => set('dia', v.replace(/\D/g, '').slice(0, 2))}
          keyboardType="numeric"
          maxLength={2}
        />
        <Text style={styles.dateSep}>/</Text>
        <TextInput
          style={[styles.input, styles.dateInput]}
          placeholder="MM"
          value={mes}
          onChangeText={v => set('mes', v.replace(/\D/g, '').slice(0, 2))}
          keyboardType="numeric"
          maxLength={2}
        />
        <Text style={styles.dateSep}>/</Text>
        <TextInput
          style={[styles.input, styles.dateInputYear]}
          placeholder="AAAA"
          value={ano}
          onChangeText={v => set('ano', v.replace(/\D/g, '').slice(0, 4))}
          keyboardType="numeric"
          maxLength={4}
        />
      </View>

      <TouchableOpacity style={styles.checkRow} onPress={() => set('repetirTodoAno', !repetirTodoAno)}>
        <View style={[styles.checkbox, repetirTodoAno && styles.checkboxChecked]}>
          {repetirTodoAno && <Text style={styles.checkmark}>✓</Text>}
        </View>
        <Text style={styles.checkLabel}>Repetir todo ano</Text>
      </TouchableOpacity>

      <Text style={styles.label}>Horário *</Text>
      <View style={styles.dateRow}>
        <TextInput
          style={[styles.input, styles.dateInput]}
          placeholder="HH"
          value={hora}
          onChangeText={v => set('hora', v.replace(/\D/g, '').slice(0, 2))}
          keyboardType="numeric"
          maxLength={2}
        />
        <Text style={styles.dateSep}>:</Text>
        <TextInput
          style={[styles.input, styles.dateInput]}
          placeholder="MM"
          value={minuto}
          onChangeText={v => set('minuto', v.replace(/\D/g, '').slice(0, 2))}
          keyboardType="numeric"
          maxLength={2}
        />
      </View>

      <Text style={styles.label}>Descrição <Text style={styles.optional}>(opcional)</Text></Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Detalhes adicionais..."
        value={descricao}
        onChangeText={v => set('descricao', v)}
        multiline
        numberOfLines={3}
      />

      <TouchableOpacity
        style={[styles.button, loading && { opacity: 0.6 }]}
        onPress={handleSave}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Agendando...' : 'Confirmar Agendamento'}
        </Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0EFFF', padding: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#444', marginBottom: 6, marginTop: 16 },
  optional: { fontWeight: '400', color: '#999' },
  input: { backgroundColor: '#fff', borderRadius: 10, padding: 12, fontSize: 15, borderColor: '#ddd', borderWidth: 1 },
  textArea: { height: 90, textAlignVertical: 'top' },
  selector: { backgroundColor: '#fff', borderRadius: 10, padding: 12, borderColor: '#ddd', borderWidth: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  selectorText: { fontSize: 15, color: '#333' },
  selectorPlaceholder: { fontSize: 15, color: '#aaa' },
  selectorArrow: { fontSize: 18, color: '#6C63FF' },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dateInput: { flex: 1, textAlign: 'center' },
  dateInputYear: { flex: 2, textAlign: 'center' },
  dateSep: { fontSize: 20, color: '#6C63FF', fontWeight: '700' },
  checkRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12 },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: '#6C63FF', alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  checkboxChecked: { backgroundColor: '#6C63FF' },
  checkmark: { color: '#fff', fontSize: 13, fontWeight: '700' },
  checkLabel: { fontSize: 14, color: '#444' },
  button: { backgroundColor: '#6C63FF', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 24, marginBottom: 40 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalBox: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, paddingBottom: 40 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#333', marginBottom: 16 },
  modalSection: { fontSize: 13, fontWeight: '700', color: '#6C63FF', marginTop: 12, marginBottom: 6 },
  modalOption: { padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#eee', marginBottom: 6 },
  modalOptionSelected: { borderColor: '#6C63FF', backgroundColor: '#EEEDff' },
  modalOptionText: { fontSize: 15, color: '#444' },
  modalOptionTextSelected: { color: '#6C63FF', fontWeight: '700' },
  modalCancel: { marginTop: 16, alignItems: 'center', padding: 12 },
  modalCancelText: { color: '#FF6B6B', fontSize: 15, fontWeight: '600' },
});