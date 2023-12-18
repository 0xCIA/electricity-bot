## Electricity [Telegram](https://t.me/elektrikell) bot
Simple bot for monitoring electricity price in Estonia. This is bot that allows the user to see electricity prices in present and future time. The bot sends price information every hour. Every day at 9:00AM and 9:00PM prices for the next 12 hours are displayed. The information is taken via API request to "Elering".
![Alt text](https://i.imgur.com/AWcN7Yu.png)

## Getting Started 
Clone the repository using Git
```sh
git clone https://github.com/0xCIA/electricity-bot/
```
Run the command to install all of the project's dependencies.
```sh
npm install
```
Fill the index.js file with the required values
```sh
const BotToken = 'YOUR_BOT_TOKEN'; 
const chaIT = 'YOUR_CHAT_ID';
```
After the dependencies have been installed, run the command to start the development server.
```sh
 npm start
```
