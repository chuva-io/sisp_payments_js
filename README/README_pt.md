# SISP PAYMENTS JS

# Introdução
Este módulo simplifica o início no processamento de pagamentos Vinti4, Visa e Mastercard usando SISP no Node.js.

**Observação:** Você pode solicitar as credenciais do SISP, ver documentação e muito mais [aqui](https://www.vinti4.cv/web.aspx).

```js
// Credenciais que devem ser fornecidas pelo SISP
const posID = "";
const posAutCode = "";
const url = "";
```
Essas credenciais são usadas para permitir que você processe o pagamento usando os serviços de pagamento do SISP.

# Iniciando

## Configurando o Módulo 
Importa `sisp-payments` e crie uma nova instância usando suas credenciais. (obtido do SISP):

```js
const Sisp = require('sisp-payments');

const posID = 900512;
const posAutCode = "123456789ssA";
const url = "https://mc.vinti4net.cv/payments";

const sisp = new Sisp({ posID, posAutCode, url });

```
## Gerar formulário de solicitação de pagamento
```js
sisp.generatePaymentRequestForm(referenceId, total, webhookUrl);
```
Gera e retorna um formulário HTML que pode ser usado para processar pagamentos.

* `referenceId`: Client-generated payment reference ID. Este valor é enviado através de uma requisição  `POST` para o  `webhookUrl` e permite ao cliente correlacionar a solicitação de pagamento e a resposta.
* `total`: Valor do pagamento (em CVE).
* `webhookUrl`: A url para onde o SISP deve enviar a resposta de pagamento. Você deve esperar uma requisição `POST` com informações de pagamento no corpo. Veja a [documentação](https://www.vinti4.cv/documentation.aspx?id=682) do SISP para mais informações.

### Exemplo
```js
const referenceId = 'abc-123';
const total = 1200;
const webhookUrl = 'https://samba.chuva.io/webhooks/sisp-payment';

const htmlForm = sisp.generatePaymentRequestForm(referenceId, total, webhookUrl);
```

## Gerar formulário de solicitação de pagamento de serviço
```js
sisp.generateServicePaymentRequestForm(referenceId, total, webhookUrl, entityCode, referenceNumber);
```
Gera e retorna um formulário HTML que pode ser usado para processar pagamento de serviço.

* `referenceId`: Client-generated payment reference ID. Este valor é enviado através de uma requisição  `POST` para o  `webhookUrl` e permite ao cliente correlacionar a solicitação de pagamento e a resposta.
* `total`: Valor do pagamento (em CVE).
* `webhookUrl`: A url para onde o SISP deve enviar a resposta de pagamento. Você deve esperar uma requisição `POST` com informações de pagamento no corpo. Veja a [documentação](https://www.vinti4.cv/documentation.aspx?id=682) do SISP para mais informações.
* `entityCode`: O código da entidade que receberá o pagamento.
* `referenceNumber`: O número de referência da fatura a pagar.

### Exemplo
```js
const referenceId = 'abc-123';
const total = 1200;
const webhookUrl = 'https://samba.chuva.io/webhooks/sisp-payment';
const entityCode = '6';
const referenceNumber = '216465697';

const htmlForm = sisp.generateServicePaymentRequestForm(referenceId, total, webhookUrl, entityCode, referenceNumber);
```

## Gerar formulário de solicitação de recarga
```js
sisp.generateRechargeRequestForm(referenceId, total, webhookUrl, entityCode, phoneNumber);
```
Gera e retorna um formulário HTML que pode ser usado para processar recarga de telefone.

* `referenceId`: Client-generated payment reference ID. Este valor é enviado através de uma requisição  `POST` para o  `webhookUrl` e permite ao cliente correlacionar a solicitação de pagamento e a resposta.
* `total`: Valor do pagamento (em CVE).
* `webhookUrl`: A url para onde o SISP deve enviar a resposta de pagamento. Você deve esperar uma requisição `POST` com informações de pagamento no corpo. Veja a [documentação](https://www.vinti4.cv/documentation.aspx?id=682) do SISP para mais informações.
* `entityCode`: O código da entidade que receberá o pagamento.
* `phoneNumber`: O número de telefone a ser recarregado.

### Exemplo
```js
const referenceId = 'abc-123';
const total = 1200;
const webhookUrl = 'https://samba.chuva.io/webhooks/sisp-payment';
const entityCode = '2';
const phoneNumber = '9573234';

const htmlForm = sisp.generateRechargeRequestForm(referenceId, total, webhookUrl, entityCode, phoneNumber);
```

## Validar status de processamento de pagamento (método de conveniência)

Verifique se um pagamento foi ou não processado com sucesso.

**Observação:** Este método é fornecido como uma conveniência. Consulte a documentação do SISP para a estrutura da solicitação.


### Utilização
Passe o corpo da requisição do Webhook para `validatePayment`. Retorna um objeto de erro contendo `code` e `description` se houver um erro, caso contrário, retorna `undefined`.

```js
validatePayment(responseBody)
```

`Nota`: O responseBody deve ser do tipo `x-www-form-urlencoded` conforme fornecido pelo SISP.

#### Possíveis messageTypes de sucesso por transactionCode
| Transaction: `string`  | transactionCode: `string` | messageType: `string` |
|------------------------|---------------------------|-----------------------|
| Purchase               |             1             |           8           |
| Service Payment        |             2             |           P           |
| Phone recharge         |             3             |           M           |


#### Possíveis erros

| Code: `string`  | Description: `string`               |
|-------|:----------------------------------------------|
| 001   | Payment processing error: Invalid fingerprint |
| 002   | Payment processing error: Cancelled by user   |
| 003   | Payment processing error: Processing error    |

### Exemplo

```js
 app.post("/webhook-handler", (request, response) => {
     const error = sisp.validatePayment(request.body);

     if(error === undefined) {
         // Payment processed successfully
     }
     else {
         // Payment processing error
         console.log(error.code);
         console.log(error.description);
     }
 }
```
