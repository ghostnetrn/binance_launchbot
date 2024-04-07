require("dotenv").config();
const api = require("./api");
const { Telegraf, Markup } = require("telegraf");

const bot = new Telegraf(process.env.BOT_TOKEN);

const SYMBOL = process.env.SYMBOL;
const PROFIT = parseFloat(process.env.PROFIT);
const BUY_QTY = parseFloat(process.env.BUY_QTY);

const WebSocket = require("ws");
const ws = new WebSocket(
  `wss://stream.binance.com:9443/ws/${SYMBOL.toLowerCase()}@bookTicker`
);

//não mexa nestas variáveis
let quantity = 0;
let buyPrice = 0;
let sendMessage = false;
let message = null;

ws.on("error", (err) => {
  console.log("WS Error");
  console.error(err);
  bot.telegram.sendMessage(process.env.CHAT_ID, err);
  bot.telegram.sendMessage(process.env.CHAT_ID, "O bot foi parado! Verifique");
  process.exit(1);
});

ws.onmessage = async (event) => {
  try {
    const obj = JSON.parse(event.data);
    console.clear();

    console.log(`Symbol: ${obj.s}`);
    console.log(`Best ask: ${obj.a}`);
    console.log(`Best bid: ${obj.b}`);
    console.log(`Buy Price: ${buyPrice}`);
    console.log(`Qty: ${quantity}`);
    console.log(`Notional: ${buyPrice * quantity}`);
    console.log(`Target Price: ${buyPrice * PROFIT}`);

    message = `
*Symbol*: ${obj.s}
*Best ask*: ${obj.a}
*Best bid*: ${obj.b}
*Buy Price*: ${buyPrice}
*Qty*: ${quantity}
*Notional*: ${buyPrice * quantity}
*Target Price*: ${buyPrice * PROFIT}
`;

    if (sendMessage) {
      bot.telegram.sendMessage(process.env.CHAT_ID, message, {
        parse_mode: "Markdown",
      });
      sendMessage = false;
    }

    if (quantity === 0) {
      quantity = -1;
      const order = await api.buy(SYMBOL, BUY_QTY);
      sendMessage = true;

      if (order.status !== "FILLED") {
        console.log(order);
        bot.telegram.sendMessage(process.env.CHAT_ID, order);
        bot.telegram.sendMessage(
          process.env.CHAT_ID,
          "O bot foi parado! Verifique"
        );
        process.exit(1);
      }

      quantity = parseFloat(order.executedQty);
      buyPrice = parseFloat(order.fills[0].price);
      return;
    } else if (quantity > 0 && parseFloat(obj.b) > buyPrice * PROFIT) {
      const order = await api.sell(SYMBOL, quantity);
      if (order.status !== "FILLED") {
        console.log(order);
        bot.telegram.sendMessage(process.env.CHAT_ID, order);
      } else {
        console.log(`Sold at ${new Date()} by ${order.fills[0].price}`);
        bot.telegram.sendMessage(
          process.env.CHAT_ID,
          `Sold at ${new Date()} by ${order.fills[0].price}`
        );
        bot.telegram.sendMessage(
          process.env.CHAT_ID,
          "O bot foi parado! Verifique"
        );
        process.exit(1);
      }
    }
  } catch (err) {
    console.error(err);
    bot.telegram.sendMessage(process.env.CHAT_ID, err);
    bot.telegram.sendMessage(
      process.env.CHAT_ID,
      "O bot foi parado! Verifique"
    );
    process.exit(1);
  }
};

// Telegram
bot.start((ctx) =>
  ctx.reply("Bot para lançamento de criptomoedas na Binance", keyboard)
);

// Telegram Keyboard
const keyboard = Markup.keyboard([
  ["🧾 Status", "📖 Help"],
  ["🔍 Vídeo tutorial"],
])
  .oneTime()
  .resize();

bot.hears("🔍 Vídeo tutorial", async (ctx) => {
  ctx.reply("https://www.youtube.com/watch?v=rlZ_R70p3OQ", keyboard);
});

bot.hears("🧾 Status", async (ctx) => {
  ctx.reply(message, { parse_mode: "Markdown" });
});

bot.hears("📖 Help", async (ctx) => {
  ctx.replyWithMarkdown(
    `*Comandos disponíveis:* 
          ============  
      *🧾 Status:* Status da operação.\n
      *📖 Help* Ajuda.\n
      *🔍Vídeo*
          ============
          `,
    keyboard
  );
});

bot.launch();
