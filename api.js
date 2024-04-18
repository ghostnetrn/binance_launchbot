const axios = require("axios");
const crypto = require("crypto");

const apiKey = process.env.API_KEY;
const apiSecret = process.env.SECRET_KEY;
const apiUrl = process.env.API_URL;

async function newOrder(data) {
  if (!apiKey || !apiSecret)
    throw new Error("Preencha corretamente sua API KEY e SECRET KEY");

  data.type = "MARKET";
  data.timestamp = Date.now();
  data.recvWindow = 60000; //máximo permitido, default 5000

  const signature = crypto
    .createHmac("sha256", apiSecret)
    .update(`${new URLSearchParams(data)}`)
    .digest("hex");

  const qs = `?${new URLSearchParams({ ...data, signature })}`;

  try {
    const result = await axios({
      method: "POST",
      url: `${apiUrl}/v3/order${qs}`,
      headers: { "X-MBX-APIKEY": apiKey },
    });
    return result.data;
  } catch (err) {
    console.log(err);
  }
}

function buy(symbol, quoteOrderQty) {
  const data = { symbol, side: "BUY", quoteOrderQty };
  return newOrder(data);
}

function sell(symbol, quantity) {
  const data = { symbol, side: "SELL", quantity };
  return newOrder(data);
}

async function trades(symbol, fromId = 0, limit = 1000) {
  const path = "/v3/historicalTrades";

  if (!apiKey) throw new Error("Preencha corretamente sua API KEY");

  try {
    const result = await axios({
      method: "GET",
      url: `${apiUrl}${path}?symbol=${symbol}&fromId=${fromId}&limit=${limit}`,
      headers: { "X-MBX-APIKEY": apiKey },
    });

    return result.data;
  } catch (err) {
    console.log(err);
  }
}

module.exports = { buy, sell, trades };
