require("dotenv").config();
const fs = require("fs");
const api = require("./api");
const SYMBOL = "OMNIUSDT";

(async () => {
  const data = await api.trades(SYMBOL);
  // Função para converter o array de objetos em formato CSV
  // Função para converter o array de objetos em formato CSV
  function convertToCSV(data) {
    const header = Object.keys(data[0]).join(";"); // Cria o cabeçalho do CSV
    const rows = data.map((obj) => {
      // Formata os campos conforme as regras
      const formattedRow = {
        ...obj,
        price: parseFloat(obj.price).toFixed(2),
        qty: parseFloat(obj.qty).toFixed(2),
        quoteQty: parseFloat(obj.quoteQty).toFixed(2),
        time: obj.time.toString(), // Retorna o número completo
      };
      return Object.values(formattedRow).join(";");
    }); // Converte os valores dos objetos em linhas do CSV
    return `${header}\n${rows.join("\n")}`; // Retorna o CSV completo
  }

  // Função para escrever os dados em um arquivo CSV
  function writeToCSV(data, filename) {
    const csvData = convertToCSV(data);
    fs.writeFileSync(filename, csvData, "utf8"); // Escreve os dados no arquivo
  }

  // Nome do arquivo de saída
  const filename = "output.csv";

  // Escreve os dados no arquivo CSV
  writeToCSV(data, filename);

  console.log(`Arquivo CSV gerado com sucesso: ${filename}`);
})();
