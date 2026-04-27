
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Modal,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { fetchBookings } from '../services/CalCalendar';

const DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

const MONTHS = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

export default function CalendarScreen() {
  const today = new Date();

  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState('');
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filtro, setFiltro] = useState('todos');
  const [modalMes, setModalMes] = useState(false);
  const [modoLista, setModoLista] = useState(false);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);

      fetchBookings()
        .then((data) => {
          console.log('EVENTOS RECEBIDOS:', data);
          setEventos(data || []);
        })
        .catch((error) => {
          console.log('ERRO AO BUSCAR BOOKINGS:', error);
          setEventos([]);
        })
        .finally(() => {
          setLoading(false);
        });
    }, [])
  );

  function formatDate(year, month, day) {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(
      day
    ).padStart(2, '0')}`;
  }

  function getDaysInMonth(month, year) {
    return new Date(year, month + 1, 0).getDate();
  }

  function getFirstDayOfMonth(month, year) {
    return new Date(year, month, 1).getDay();
  }

  function formatDateBR(dateStr) {
    if (!dateStr) return '';

    const [y, m, d] = dateStr.split('-');
    return `${d}/${m}/${y}`;
  }

  const todayStr = formatDate(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );

  function eventosFiltrados(lista) {
    if (filtro === 'todos') return lista;
    return lista.filter((e) => e.categoria === filtro);
  }

  function hasEvent(day) {
    const date = formatDate(currentYear, currentMonth, day);

    return eventosFiltrados(eventos).some(
      (e) => e.start?.date === date
    );
  }

  const proximosEventos = eventosFiltrados(eventos)
    .filter((e) => e.start?.date && e.start.date >= todayStr)
    .sort((a, b) =>
      (a.start?.date || '').localeCompare(b.start?.date || '')
    );

  const eventsForDay = eventosFiltrados(eventos).filter(
    (e) => e.start?.date === selectedDate
  );

  function prevMonth() {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  }

  function nextMonth() {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  }

  const daysInMonth = getDaysInMonth(currentMonth, currentYear);
  const firstDay = getFirstDayOfMonth(currentMonth, currentYear);

  const blanks = Array(firstDay).fill(null);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={prevMonth} style={styles.arrow}>
          <Text style={styles.arrowText}>‹</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setModalMes(true)}
          style={styles.monthTitleBtn}
        >
          <Text style={styles.monthTitle}>
            {MONTHS[currentMonth]} {currentYear} ▾
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={nextMonth} style={styles.arrow}>
          <Text style={styles.arrowText}>›</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={modalMes} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Selecione o mês</Text>

            <View style={styles.yearRow}>
              <TouchableOpacity
                onPress={() => setCurrentYear((y) => y - 1)}
                style={styles.yearBtn}
              >
                <Text style={styles.yearBtnText}>‹</Text>
              </TouchableOpacity>

              <Text style={styles.yearText}>{currentYear}</Text>

              <TouchableOpacity
                onPress={() => setCurrentYear((y) => y + 1)}
                style={styles.yearBtn}
              >
                <Text style={styles.yearBtnText}>›</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.monthGrid}>
              {MONTHS.map((m, i) => (
                <TouchableOpacity
                  key={i}
                  style={[
                    styles.monthOption,
                    currentMonth === i && styles.monthOptionSelected,
                  ]}
                  onPress={() => {
                    setCurrentMonth(i);
                    setModalMes(false);
                  }}
                >
                  <Text
                    style={[
                      styles.monthOptionText,
                      currentMonth === i &&
                        styles.monthOptionTextSelected,
                    ]}
                  >
                    {m.slice(0, 3)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={styles.modalCancel}
              onPress={() => setModalMes(false)}
            >
              <Text style={styles.modalCancelText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <View style={styles.modoRow}>
        <TouchableOpacity
          style={[
            styles.modoBtn,
            !modoLista && styles.modoBtnActive,
          ]}
          onPress={() => setModoLista(false)}
        >
          <Text
            style={[
              styles.modoBtnText,
              !modoLista && styles.modoBtnTextActive,
            ]}
          >
            Calendário
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.modoBtn,
            modoLista && styles.modoBtnActive,
          ]}
          onPress={() => setModoLista(true)}
        >
          <Text
            style={[
              styles.modoBtnText,
              modoLista && styles.modoBtnTextActive,
            ]}
          >
            Lista
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.filtroRow}>
        {['todos', 'profissional', 'casual'].map((f) => (
          <TouchableOpacity
            key={f}
            style={[
              styles.filtroBtn,
              filtro === f && styles.filtroBtnActive,
            ]}
            onPress={() => setFiltro(f)}
          >
            <Text
              style={[
                styles.filtroBtnText,
                filtro === f && styles.filtroBtnTextActive,
              ]}
            >
              {f === 'todos'
                ? 'Todos'
                : f === 'profissional'
                ? 'Prof.'
                : 'Casual'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator
          color="#6C63FF"
          style={{ marginTop: 40 }}
        />
      ) : modoLista ? (
        <>
          <Text style={styles.sectionTitle}>
            Próximos agendamentos
          </Text>

          {proximosEventos.length === 0 ? (
            <Text style={styles.empty}>
              Nenhum agendamento futuro.
            </Text>
          ) : (
            proximosEventos.map((item) => (
              <View key={item.id} style={styles.card}>
                <View style={styles.cardDateBadge}>
                  <Text style={styles.cardDateText}>
                    {formatDateBR(item.start?.date)}
                  </Text>

                  {item.time && (
                    <Text style={styles.cardTimeText}>
                      🕐 {item.time}
                    </Text>
                  )}
                </View>

                <Text style={styles.cardTitle}>
                  {item.summary}
                </Text>
              </View>
            ))
          )}
        </>
      ) : (
        <>
          <View style={styles.weekRow}>
            {DAYS.map((d) => (
              <Text key={d} style={styles.weekDay}>
                {d}
              </Text>
            ))}
          </View>

          <View style={styles.grid}>
            {blanks.map((_, i) => (
              <View key={`b${i}`} style={styles.dayCell} />
            ))}

            {days.map((day) => {
              const dateStr = formatDate(
                currentYear,
                currentMonth,
                day
              );

              const isSelected = dateStr === selectedDate;
              const isToday = dateStr === todayStr;
              const hasEv = hasEvent(day);

              return (
                <TouchableOpacity
                  key={day}
                  style={[
                    styles.dayCell,
                    isSelected && styles.selectedDay,
                    isToday &&
                      !isSelected &&
                      styles.todayDay,
                  ]}
                  onPress={() => setSelectedDate(dateStr)}
                >
                  <Text
                    style={[
                      styles.dayText,
                      isSelected &&
                        styles.selectedDayText,
                      isToday &&
                        !isSelected &&
                        styles.todayText,
                    ]}
                  >
                    {day}
                  </Text>

                  {hasEv && (
                    <View
                      style={[
                        styles.dot,
                        isSelected && {
                          backgroundColor: '#fff',
                        },
                      ]}
                    />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={styles.sectionTitle}>
            {selectedDate
              ? `Agendamentos em ${formatDateBR(selectedDate)}`
              : 'Selecione um dia'}
          </Text>

          {eventsForDay.length > 0 ? (
            eventsForDay.map((item) => (
              <View key={item.id} style={styles.card}>
                <Text style={styles.cardTitle}>
                  {item.summary}
                </Text>

                {item.time && (
                  <Text style={styles.cardSub}>
                    {item.time}
                  </Text>
                )}
              </View>
            ))
          ) : selectedDate ? (
            <Text style={styles.empty}>
              Nenhum agendamento nesse dia.
            </Text>
          ) : null}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0EFFF' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#6C63FF',
  },
  monthTitleBtn: { flex: 1, alignItems: 'center' },
  monthTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  arrow: { padding: 8 },
  arrowText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '300',
  },
  modoRow: {
    flexDirection: 'row',
    margin: 12,
    backgroundColor: '#E8E7FF',
    borderRadius: 12,
    padding: 4,
  },
  modoBtn: {
    flex: 1,
    padding: 8,
    borderRadius: 10,
    alignItems: 'center',
  },
  modoBtnActive: { backgroundColor: '#6C63FF' },
  modoBtnText: {
    fontSize: 13,
    color: '#6C63FF',
    fontWeight: '600',
  },
  modoBtnTextActive: { color: '#fff' },
  filtroRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  filtroBtn: {
    flex: 1,
    padding: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  filtroBtnActive: {
    backgroundColor: '#6C63FF',
    borderColor: '#6C63FF',
  },
  filtroBtnText: { fontSize: 12, color: '#666' },
  filtroBtnTextActive: {
    color: '#fff',
    fontWeight: '700',
  },
  weekRow: {
    flexDirection: 'row',
    backgroundColor: '#EEEDff',
    paddingVertical: 8,
  },
  weekDay: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: '#6C63FF',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedDay: {
    backgroundColor: '#6C63FF',
    borderRadius: 50,
  },
  todayDay: {
    borderWidth: 2,
    borderColor: '#6C63FF',
    borderRadius: 50,
  },
  dayText: { fontSize: 14, color: '#333' },
  selectedDayText: {
    color: '#fff',
    fontWeight: '700',
  },
  todayText: {
    color: '#6C63FF',
    fontWeight: '700',
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#6C63FF',
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 10,
    padding: 14,
    borderRadius: 12,
    elevation: 2,
  },
  cardDateBadge: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  cardDateText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6C63FF',
  },
  cardTimeText: {
    fontSize: 13,
    color: '#888',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#333',
  },
  cardSub: {
    fontSize: 13,
    color: '#888',
    marginTop: 4,
  },
  empty: {
    color: '#999',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalBox: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  yearRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  yearBtn: { padding: 12 },
  yearBtnText: {
    fontSize: 28,
    color: '#6C63FF',
    fontWeight: '300',
  },
  yearText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginHorizontal: 20,
  },
  monthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  monthOption: {
    width: '30%',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#eee',
    alignItems: 'center',
  },
  monthOptionSelected: {
    backgroundColor: '#6C63FF',
    borderColor: '#6C63FF',
  },
  monthOptionText: {
    fontSize: 14,
    color: '#444',
  },
  monthOptionTextSelected: {
    color: '#fff',
    fontWeight: '700',
  },
  modalCancel: {
    marginTop: 16,
    alignItems: 'center',
    padding: 12,
  },
  modalCancelText: {
    color: '#FF6B6B',
    fontSize: 15,
    fontWeight: '600',
  },
});