
const API_KEY = 'cal_live_392e58e6ea037d6df6912aedcd2ed756';
const BASE_URL = 'https://api.cal.com/v2';

const headers = {
  'Content-Type': 'application/json',
  Authorization: `Bearer ${API_KEY}`,
  'cal-api-version': '2024-06-14',
};

export async function fetchBookings() {
  try {
    const response = await fetch(
      `${BASE_URL}/bookings`,
      {
        method: 'GET',
        headers,
      }
    );

    const data = await response.json();

    console.log(
      "FETCH BOOKINGS:",
      JSON.stringify(data, null, 2)
    );

    const bookings = data?.data?.bookings || [];

    const eventosAdaptados = bookings.map((item) => {
      const dateObj = new Date(item.startTime);

  
      const localDate = new Date(
        dateObj.getTime() - dateObj.getTimezoneOffset() * 60000
      );

      const date = localDate.toISOString().split('T')[0];
      const time = localDate.toTimeString().slice(0, 5);

      return {
        id: item.id,
        summary: item.eventType?.title || item.title || 'Sem título',
        start: {
          date,
        },
        time,
        categoria: 'profissional',
        tipo: item.eventType?.title || 'Consulta',
        descricao: item.description || '',
      };
    });

    console.log(
      "EVENTOS ADAPTADOS:",
      JSON.stringify(eventosAdaptados, null, 2)
    );

    return eventosAdaptados;
  } catch (error) {
    console.log("ERRO FETCH BOOKINGS:", error);
    return [];
  }
}

export async function fetchEventTypes() {
  try {
    const response = await fetch(
      `${BASE_URL}/event-types`,
      {
        method: 'GET',
        headers,
      }
    );

    const data = await response.json();

    console.log(
      "FETCH EVENT TYPES:",
      JSON.stringify(data, null, 2)
    );

    return data.data || [];
  } catch (error) {
    console.log("ERRO FETCH EVENT TYPES:", error);
    return [];
  }
}

export async function createBooking(
  eventTypeId,
  name,
  email,
  date,
  time
) {
  try {
    const startTime = `${date}T${time}:00.000Z`;

    const response = await fetch(
      `${BASE_URL}/bookings`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify({
          eventTypeId: Number(eventTypeId),
          start: startTime,
          responses: {
            name,
            email,
          },
          timeZone: 'America/Sao_Paulo',
          language: 'pt-BR',
          metadata: {},
        }),
      }
    );

    const data = await response.json();

    console.log(
      "CREATE BOOKING:",
      JSON.stringify(data, null, 2)
    );

    return data;
  } catch (error) {
    console.log("ERRO CREATE BOOKING:", error);
    return null;
  }
}

export async function cancelBooking(bookingId) {
  try {
    const response = await fetch(
      `${BASE_URL}/bookings/${bookingId}/cancel`,
      {
        method: 'DELETE',
        headers,
      }
    );

    const data = await response.json();

    console.log(
      "CANCEL BOOKING:",
      JSON.stringify(data, null, 2)
    );

    return data;
  } catch (error) {
    console.log("ERRO CANCEL BOOKING:", error);
    return null;
  }
}