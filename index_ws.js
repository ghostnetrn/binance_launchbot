require("dotenv").config();
const WebSocket = require("ws");
const crypto = require("crypto");

const SYMBOL = process.env.SYMBOL;
const PROFIT = parseFloat(process.env.PROFIT);
const BUY_QTY = parseFloat(process.env.BUY_QTY); // Usando como quoteOrderQty
const API_KEY = process.env.API_KEY;
const API_SECRET = process.env.API_SECRET;
const wsUrl = "wss://testnet.binance.vision/ws-api/v3";
const ws = new WebSocket(wsUrl);

// Variáveis para rastreamento da quantidade e preço de compra
let quantity = 0;
let buyPrice = 0;
let isConnected = false;
let orderQueue = [];
let responseCallbacks = {};

// Função para criar a assinatura HMAC SHA256
function createSignature(params, secret) {
  const query = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("&");
  return crypto.createHmac("sha256", secret).update(query).digest("hex");
}

// Função para enviar novas ordens
function newOrder(symbol, side, quoteOrderQty, type = "MARKET", callback) {
  if (!API_KEY || !API_SECRET) {
    throw new Error("API KEY e SECRET KEY são necessários");
  }

  const params = {
    symbol,
    side,
    type,
    quoteOrderQty,
    timestamp: Date.now(),
    recvWindow: 60000,
    apiKey: API_KEY,
  };

  params.signature = createSignature(params, API_SECRET);

  const data = {
    method: "order.place",
    params,
    id: Date.now(),
  };

  const payload = JSON.stringify(data);

  if (isConnected) {
    ws.send(payload);
    responseCallbacks[data.id] = callback;
  } else {
    orderQueue.push({ payload, callback });
  }
}

// Funções de compra e venda
function buy(symbol, quoteOrderQty, callback) {
  newOrder(symbol, "BUY", quoteOrderQty, "MARKET", callback);
}

function sell(symbol, quantity, callback) {
  newOrder(symbol, "SELL", quantity, "MARKET", callback);
}

// Conexão WebSocket
ws.on("open", () => {
  console.log("Conexão WebSocket aberta");
  isConnected = true;

  // Processa qualquer ordem na fila
  while (orderQueue.length > 0) {
    const { payload, callback } = orderQueue.shift();
    ws.send(payload);
    responseCallbacks[JSON.parse(payload).id] = callback;
  }
});

ws.on("message", (message) => {
  if (message === "pong") {
    console.log("Recebido pong do servidor");
    return;
  }

  const response = JSON.parse(message);
  console.log("Mensagem recebida:", response); // Log para depuração
  if (response.id && responseCallbacks[response.id]) {
    responseCallbacks[response.id](response);
    delete responseCallbacks[response.id];
  }
});

ws.on("ping", () => {
  console.log("Recebido ping do servidor");
  ws.pong();
});

ws.on("error", (error) => {
  console.error("Erro WebSocket:", error);
  process.exit(1);
});

ws.on("close", () => {
  console.log("Conexão WebSocket fechada");
  isConnected = false;
});

// WebSocket para monitorar o book ticker
const bookTickerWs = new WebSocket(
  `wss://stream.binance.com:9443/ws/${SYMBOL.toLowerCase()}@bookTicker`
);

bookTickerWs.on("error", (err) => {
  console.log("Erro no WebSocket");
  console.error(err);
  process.exit(1);
});

bookTickerWs.on("message", async (event) => {
  try {
    const obj = JSON.parse(event);
    console.clear();

    console.log(`Symbol: ${obj.s}`);
    console.log(`Best ask: ${obj.a}`);
    console.log(`Best bid: ${obj.b}`);
    console.log(`Buy Price: ${buyPrice}`);
    console.log(`Qty: ${quantity}`);
    console.log(`Notional: ${buyPrice * quantity}`);
    console.log(`Target Price: ${buyPrice * PROFIT}`);

    if (quantity === 0) {
      quantity = -1;

      buy(SYMBOL, BUY_QTY, (order) => {
        console.log("Resposta da ordem de compra:", order); // Log para depuração
        if (!order || order.status !== "FILLED") {
          console.log(order);
          process.exit(1);
        }

        quantity = parseFloat(order.result.executedQty);
        buyPrice = parseFloat(order.result.fills[0].price);
      });
      return;
    } else if (quantity > 0 && parseFloat(obj.b) > buyPrice * PROFIT) {
      sell(SYMBOL, quantity, (order) => {
        console.log("Resposta da ordem de venda:", order); // Log para depuração
        if (!order || order.status !== "FILLED") {
          console.log(order);
        } else {
          console.log(
            `Vendido em ${new Date()} por ${order.result.fills[0].price}`
          );
          process.exit(1);
        }
      });
    }
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
});
