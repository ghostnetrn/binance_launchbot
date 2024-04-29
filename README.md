# Bot de Lançamento de Criptomoedas na Binance

Este é um bot desenvolvido para automatizar o lançamento de criptomoedas na Binance, adaptado a partir do vídeo disponível em https://www.youtube.com/watch?v=rlZ_R70p3OQ

## AVISOS

- VOCÊ DEVE TER CONHECIMENTOS BÁSICOS DE LÓGICA DE PROGRAMAÇÃO E DE ALGORITMOS PARA USAR ESTES ROBÔS.
- EU NÃO ME RESPONSABILIZO PELO USO INDEVIDO DESTES ROBÔS TRADER, BUGS QUE ELES POSSAM TER OU A LÓGICA DE TRADING QUE VOCÊ VENHA A APLICAR.
- EU NÃO ME RESPONSABILIZO POR PERDAS FINANCEIRAS E NÃO DOU CONSELHOS DE INVESTIMENTO.
- CRIPTOMOEDAS É INVESTIMENTO DE RISCO, TENHA ISSO EM MENTE.
- NÃO COMPARTILHE SUAS VARIÁVEIS DE AMBIENTE E ARQUIVO .ENV COM NINGUÉM, NEM COMIGO.
- AO USAR ESTES ROBÔS, VOCÊ ASSUME QUALQUER RISCO FINANCEIRO QUE ELES POSSAM LHE CAUSAR.

## Configuração

1. **Clonar o repositório:**

   ```
   git clone https://github.com/ghostnetrn/binance_launchbot.git
   ```

2. **Instalar as dependências:**

   ```
   cd binance_launchbot
   npm install
   ```

3. **Configurar o arquivo `.env`:**

   Para rodar em Produção: renomeie o arquivo `.env.example` para `.env`

   Para rodar em testnet: renomeie o arquivo `.env.example`para `.env.local`

   ```
   - SYMBOL: Define o par de moedas que será negociado.
   - PROFIT: Define o valor do lucro desejado para cada negociação bem-sucedida.
   - BUY_QTY: Indica a quantidade da moeda que será comprada em cada negociação.
   - PROFIT_INCREASE_PERCENT: Porcentagem pelo qual o lucro será aumentado.
   - PROFIT_DECREASE_PERCENT: Porcentagem pelo qual o lucro será diminuído.
   - API_URL: URL da API usada para acessar dados de mercado e executar negociações. https://testnet.binance.vision/api ou https://api.binance.com/api
   - API_KEY: Chave de autenticação para acessar a API da Binance. Saiba mais em https://www.youtube.com/watch?v=-6bF6a6ecIs
   - SECRET_KEY: Chave secreta associada à chave de API da Binance. Saiba mais em https://www.youtube.com/watch?v=-6bF6a6ecIs
   - BOT_TOKEN: Token de autenticação do bot do Telegram.
   - CHAT_ID: ID do chat do Telegram para enviar mensagens.
   ```

```

5. **Iniciar o Bot:**

 _para rodar em produção_

```

npm start

```

_para rodar em testnet_

```

npm run testnet

```

## Comandos Disponíveis

- **🧾 Status**: Verifica o status da operação atual.
- **📖 Help**: Exibe a lista de comandos disponíveis.
- **🔍 Vídeo tutorial**: Fornece um link para o vídeo tutorial.

## Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para abrir uma issue ou enviar um pull request.

## Licença

Este projeto está licenciado sob a [Licença MIT](LICENSE).
```
