import moment from 'moment-timezone';
import axios from 'axios';
import fetch from 'node-fetch';

const apiUrl = 'https://dashboard.elering.ee/api';
const timeZone = 'Europe/Tallinn';
const botToken = '';
const chatId = '';
const money = String.fromCodePoint(0x1F4B0);
const time = String.fromCodePoint(0x23F0);

async function sendTelegramMessage(message) {
  try {
    await axios.post(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        chat_id: chatId,
        text: message,
      }
    );
    console.log('Message sent to Telegram:', message);
  } catch (error) {
    console.error('Error sending message to Telegram:', error.message);
  }
}

async function fetchElectricityPrice() {
  const now = moment.tz(timeZone);
  const start = now.clone().subtract(10, 'hours').toISOString();
  const end = now.clone().add(1, 'days').toISOString();

  const params = new URLSearchParams({
    start,
    end,
  });

  try {
    const response = await fetch(`${apiUrl}/nps/price?${params}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch data. Status: ${response.status}`);
    }

    const apiData = await response.json();

    if (
      !apiData ||
      !apiData.data ||
      !apiData.data.ee ||
      !Array.isArray(apiData.data.ee)
    ) {
      throw new Error('Invalid data received from the API');
    }

    const data = apiData.data.ee;

    console.log('API Response:', data);

    let closestPriceObject = null;
    let closestTimeDifference = Number.POSITIVE_INFINITY;

    data.forEach((priceData) => {
      const timestamp = priceData.timestamp;
      const price = priceData.price;
      const priceTime = moment.unix(timestamp).tz(timeZone);
      const timeDifference = Math.abs(priceTime.diff(now, 'minutes'));

      if (timeDifference < closestTimeDifference && priceTime.isSameOrBefore(now)) {
        closestPriceObject = { priceTime, price };
        closestTimeDifference = timeDifference;
      }
    });

    let message = '';

    if (closestPriceObject) {
      const { priceTime, price } = closestPriceObject;
      console.log(`Closest price for ${priceTime.format('HH:mm')} = ${price}`);
      message += `${time}${priceTime.format('HH:00')} \n${money}${price}€ MW/h\n\n`;
    } else {
      console.log('No data found for the current time.');
    }

    const currentHour = now.format('HH');
    if (currentHour === '09' || currentHour === '21') {
      for (let i = 1; i <= 23; i++) {
        const nextHour = now.clone().add(i, 'hours');
        const nextHourFormatted = nextHour.format('HH:00');
        const nextPrice = data.find(
          (priceData) =>
            moment.unix(priceData.timestamp).tz(timeZone).format('HH') === nextHour.format('HH')
        );

        if (nextPrice) {
          message += `${time}${nextHourFormatted} — ${money}${nextPrice.price}€ MW/h \n`;
        } else {
          message += `PRICE FOR ${nextHourFormatted} - N/A\n`;
        }
      }
    }

    sendTelegramMessage(message);
  } catch (error) {
    console.error('API Error:', error.message);
  }
}

function startHourlyMonitoring() {
  fetchElectricityPrice();

  setInterval(() => {
    const now = new Date();
    if (now.getMinutes() === 0) {
      fetchElectricityPrice();
    }
  }, 60 * 1000);
}

startHourlyMonitoring();
