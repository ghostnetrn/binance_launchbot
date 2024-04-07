# Bot de Lançamento de Criptomoedas na Binance

Este é um bot desenvolvido para automatizar o lançamento de criptomoedas na Binance, adaptado a partir do vídeo disponível em https://www.youtube.com/watch?v=rlZ_R70p3OQ

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
   Renomeie o arquivo `.env.example` para `.env` e preencha as variáveis de ambiente necessárias:

   ```
   SYMBOL=par_de_moeda
   PROFIT=valor_do_lucro_desejado
   BUY_QTY=quantidade_para_compra
   API_URL=https://testnet.binance.vision/api ou https://api.binance.com/api
   API_KEY=Saiba mais em https://www.youtube.com/watch?v=-6bF6a6ecIs
   SECRET_KEY=Saiba mais em https://www.youtube.com/watch?v=-6bF6a6ecIs
   BOT_TOKEN=seu_token_do_bot
   CHAT_ID=id_do_chat_para_enviar_mensagens
   ```

4. **Iniciar o Bot:**

   ```
   npm start
   ```

## Comandos Disponíveis

- **🧾 Status**: Verifica o status da operação atual.
- **📖 Help**: Exibe a lista de comandos disponíveis.
- **🔍 Vídeo tutorial**: Fornece um link para o vídeo tutorial.

## Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para abrir uma issue ou enviar um pull request.

## Licença

Este projeto está licenciado sob a [Licença MIT](LICENSE).
