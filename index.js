require("dotenv").config();
const api = require("./api");
const { Telegraf, Markup } = require("telegraf");

const bot = new Telegraf(process.env.BOT_TOKEN);

const SYMBOL = process.env.SYMBOL;
let PROFIT = parseFloat(process.env.PROFIT);
const BUY_QTY = parseFloat(process.env.BUY_QTY);
const PROFIT_INCREASE_PERCENT = parseFloat(process.env.PROFIT_INCREASE_PERCENT);
const PROFIT_DECREASE_PERCENT = parseFloat(process.env.PROFIT_DECREASE_PERCENT);

bot.telegram.sendMessage(
  process.env.CHAT_ID,
  `Iniciando monitoramento da moeda ${SYMBOL}`
);

const WebSocket = require("ws");
const ws = new WebSocket(
  `wss://stream.binance.com:9443/ws/${SYMBOL.toLowerCase()}@bookTicker`
);

//não mexa nestas variáveis
let quantity = 0;
let buyPrice = 0;
let targetSell = 0;
let sendMessage = false;
let message = null ?? `Aguardando lançamento da moeda ${SYMBOL}`;

ws.on("error", (err) => {
  console.log("WS Error");
  console.error(err);
  process.exit(1);
});

// ws.onmessage = async (event) => {
//   try {
//     const obj = JSON.parse(event.data);
//     console.clear();
//     let targetPrice = (buyPrice * PROFIT).toFixed(2);
//     const notional = `${buyPrice * quantity}`;
//     let percentual = ((PROFIT - 1) * 100).toFixed() + "%";

//     console.log(`Symbol: ${obj.s}`);
//     console.log(`Best ask: ${obj.a}`);
//     console.log(`Best bid: ${obj.b}`);
//     console.log(`Buy Price: ${buyPrice}`);
//     console.log(`Profit: ${percentual}`);
//     console.log(`Qty: ${quantity}`);
//     console.log(`Notional: ${notional}`);
//     console.log(`Target Price: ${targetPrice} ${percentual}`);

//     message = `
// *Symbol*: ${obj.s}
// *Best ask*: ${obj.a}
// *Best bid*: ${obj.b}

// *Buy Price*: ${buyPrice}
// *PROFIT*: ${percentual}
// *Qty*: ${quantity}
// *Notional*: ${buyPrice * quantity}

// *Target Price*: ${buyPrice * PROFIT}
// `;

//     if (sendMessage) {
//       bot.telegram.sendMessage(process.env.CHAT_ID, message, {
//         parse_mode: "Markdown",
//       });
//       sendMessage = false;
//     }

//     if (quantity === 0) {
//       quantity = -1;
//       const order = await api.buy(SYMBOL, BUY_QTY);
//       sendMessage = true;

//       if (order.status !== "FILLED") {
//         console.log(order);
//         await bot.telegram.sendMessage(process.env.CHAT_ID, order);
//         await bot.telegram.sendMessage(
//           process.env.CHAT_ID,
//           "O bot foi parado! Verifique"
//         );
//         process.exit(1);
//       }

//       quantity = parseFloat(order.executedQty);
//       buyPrice = parseFloat(order.fills[0].price);
//       return;
//     } else if (quantity > 0 && parseFloat(obj.b) > buyPrice * PROFIT) {
//       const order = await api.sell(SYMBOL, quantity);
//       if (order.status !== "FILLED") {
//         console.log(order);
//         bot.telegram.sendMessage(process.env.CHAT_ID, order);
//       } else {
//         const soldPrice = parseFloat(order.fills[0].price).toFixed(2);
//         const soldDate = new Date().toLocaleString("pt-BR");
//         console.log(`Sold at ${soldDate} by USD ${soldPrice}`);

//         await bot.telegram.sendMessage(
//           process.env.CHAT_ID,
//           `Vendido em ${soldDate} por ${order.fills[0].price}`
//         );
//         await bot.telegram.sendMessage(
//           process.env.CHAT_ID,
//           "*O bot foi parado! Verifique*",
//           { parse_mode: "Markdown" }
//         );
//         process.exit(1);
//       }
//     }
//   } catch (err) {
//     console.error(err);
//     await bot.telegram.sendMessage(process.env.CHAT_ID, JSON.stringify(err));
//     await bot.telegram.sendMessage(
//       process.env.CHAT_ID,
//       "O bot foi parado! Verifique"
//     );
//     process.exit(1);
//   }
// };

// Telegram

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
*PROFIT*: ${percentual}
*Qty*: ${quantity}
*Notional*: ${buyPrice * quantity}

*Target Price*: ${buyPrice * PROFIT}
`;

    if (quantity === 0) {
      quantity = -1;

      const order = await api.buy(SYMBOL, BUY_QTY);
      if (order.status !== "FILLED") {
        console.log(order);
        process.exit(1);
      }

      quantity = parseFloat(order.executedQty);
      buyPrice = parseFloat(order.fills[0].price);
      return;
    } else if (quantity > 0 && parseFloat(obj.b) > buyPrice * PROFIT) {
      const order = await api.sell(SYMBOL, quantity);
      if (order.status !== "FILLED") console.log(order);
      else console.log(`Sold at ${new Date()} by ${order.fills[0].price}`);
      process.exit(1);
    }
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

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
