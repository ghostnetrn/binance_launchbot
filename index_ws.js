require("dotenv").config();
const WebSocket = require("ws");
const crypto = require("crypto");

const SYMBOL = process.env.SYMBOL;
const PROFIT = parseFloat(process.env.PROFIT);
const BUY_QTY = parseFloat(process.env.BUY_QTY);
const API_KEY = process.env.API_KEY;
const API_SECRET = process.env.API_SECRET;
const wsUrl = process.env.API_URL;

let quantity = 0;
let buyPrice = 0;
let isConnected = false;
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
function newOrder(
  symbol,
  side,
  orderQty,
  type = "MARKET",
  isBuyOrder = true,
  callback
) {
  const params = {
    symbol,
    side,
    type,
    timestamp: Date.now(),
    recvWindow: 60000,
    apiKey: API_KEY,
  };

  if (isBuyOrder) {
    params.quoteOrderQty = orderQty;
  } else {
    params.quantity = orderQty;
  }

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
    console.error("WebSocket não está conectado.");
  }
}

// Funções de compra e venda
function buy(symbol, quoteOrderQty, callback) {
  newOrder(symbol, "BUY", quoteOrderQty, "MARKET", true, callback);
}

function sell(symbol, quantity, callback) {
  newOrder(symbol, "SELL", quantity, "MARKET", false, callback);
}

// Conexão WebSocket
const ws = new WebSocket(wsUrl);

ws.on("open", () => {
  console.log("Conexão WebSocket aberta");
  isConnected = true;
});

ws.on("message", (message) => {
  const response = JSON.parse(message);
  if (response.id && responseCallbacks[response.id]) {
    responseCallbacks[response.id](response);
    delete responseCallbacks[response.id];
  }
});

ws.on("ping", () => {
  ws.pong();
});

ws.on("error", (error) => {
  console.error("Erro WebSocket:", error);
  process.exit(1);
});

ws.on("close", () => {
  console.log("Conexão WebSocket fechada");
  process.exit(1);
});

// WebSocket para monitorar o book ticker
const bookTickerWs = new WebSocket(
  `wss://stream.binance.com:9443/ws/${SYMBOL.toLowerCase()}@bookTicker`
);

bookTickerWs.on("error", (err) => {
  console.error("Erro no WebSocket", err);
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
        console.log("Resposta da ordem de compra:", order);
        if (!order || !order.result || order.result.status !== "FILLED") {
          console.error("Erro ao preencher ordem de compra", order);
          process.exit(1);
        }
        quantity = parseFloat(order.result.executedQty);
        buyPrice = parseFloat(order.result.fills[0].price);
      });
    } else if (quantity > 0 && parseFloat(obj.b) > buyPrice * PROFIT) {
      sell(SYMBOL, quantity, (order) => {
        console.log("Resposta da ordem de venda:", order);
        if (!order || !order.result || order.result.status !== "FILLED") {
          console.error("Erro ao preencher ordem de venda", order);
        } else {
          console.log(
            `Venda realizada com sucesso em ${new Date()} por ${
              order.result.fills[0].price
            }`
          );
          process.exit(0);
        }
      });
    }
  } catch (err) {
    console.error("Erro ao processar mensagem do WebSocket", err);
    process.exit(1);
  }
});
