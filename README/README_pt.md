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

### Sisp com 3DSecure

Importa `@chuva.io/sisp/src/sisp3DS` e crie uma nova instância usando suas credenciais. (obtido do SISP):

```js
const Sisp = require('@chuva.io/sisp/src/sisp3DS');

const posID = '900512';
const posAutCode = "123456789ssA";
const url = "https://mc.vinti4net.cv/3ds_payments_url";

const sisp = new Sisp({ posID, posAutCode, url });

```

#### Gerar formulário de solicitação de pagamento com 3DSec

```js
sisp.generatePaymentRequestForm(referenceId, total, webhookUrl, userBillingInfo);
```
Gera e retorna um formulário HTML que pode ser usado para processar pagamentos com 3DSec.

* `referenceId`: Client-generated payment reference ID. Este valor é enviado através de uma requisição  `POST` para o  `webhookUrl` e permite ao cliente correlacionar a solicitação de pagamento e a resposta.
* `total`: Valor do pagamento (em CVE).
* `webhookUrl`: A url para onde o SISP deve enviar a resposta de pagamento. Você deve esperar uma requisição `POST` com informações de pagamento no corpo. Veja a [documentação](https://www.vinti4.cv/documentation.aspx?id=682) do SISP para mais informações.
* `userBillingInfo`: Este é um objeto que contém informações relacionadas ao usuário que está efetuando o pagamento.
* `options` - Opcional - Este é um objeto usado para configurar o formulário, como idioma e a moeda.
* `options.languageMessages` - Opcional - Isto é usado para configurar o idioma para as mensagens de resposta.
* `options.currencyCode` - Opcional - Isto é para configurar a moeda.


##### userBillingInfo field

```js
{
    acctID: "Obrigatório - Este é o ID da conta do utilizador",
    acctInfo: {
        chAccAgeInd: "Opcional - Isto indica a idade da conta do utilizador, os valores aceitáveis são: 01 - Sem conta, 02 - Conta criada durante a transação, 03 - Conta com menos de 30 dias, 04 - Idade da conta entre 30 e 60 dias, 05 - Conta com mais de 60 dias",
        chAccChange: "Opcional - Data em que ocorreu qualquer alteração na conta do utilizador. O formato exigido é - yyyyMMdd",
        chAccDate: "Opcional - Data em que a conta do utilizador foi criada. O formato exigido é - yyyyMMdd",
        chAccPwChange: "Opcional - Data em que o utilizador alterou sua senha da conta. O formato exigido é - yyyyMMdd",
        chAccPwChangeInd: "Opcional - Isto indica a idade da senha da conta do utilizador, os valores aceitáveis são: 01 - Sem senha, 02 - senha criada durante a transação, 03 - senha com menos de 30 dias, 04 - idade da senha entre 30 e 60 dias, 05 - senha com mais de 60 dias",
        suspiciousAccActivity: "Opcional - Isto indica atividade suspeita na conta do utilizador. Indica se o comerciante experimentou atividade suspeita do utilizador em questão (inclui queixas de fraude anteriores). Os valores aceitáveis são: 01 - nenhuma suspeita, 02 - suspeita"
    },
    email: "Obrigatório - Endereço de e-mail do titular do cartão",
    addrMatch: "Opcional - Isto indica se o endereço de cobrança é o mesmo que o endereço de entrega. Os valores aceitáveis são: Y - sim, N - não, no caso de Y os valores preenchidos em billAddr* devem ser os mesmos que os de shipAddr*",
    billAddrCity: "Opcional - Cidade do endereço de cobrança do titular do cartão",
    billAddrCountry: "Obrigatório - O país do endereço de cobrança do titular do cartão, deve ser os primeiros 3 dígitos do ISO 3166-1",
    billAddrLine1: "Opcional - Primeiro endereço de cobrança do titular do cartão",
    billAddrLine2: "Opcional - Segundo endereço de cobrança do titular do cartão",
    billAddrLine3: "Opcional - Terceiro endereço de cobrança do titular do cartão",
    billAddrPostCode: "Opcional - Código postal do endereço de cobrança do titular do cartão",
    billAddrState: "Opcional - Estado do endereço de cobrança do titular do cartão. Deve ser a subdivisão do país definido no ISO 3166-2",
    shipAddrCity: "Opcional - Cidade do endereço de entrega do titular do cartão",
    shipAddrCountry: "Opcional - O país do endereço de entrega do titular do cartão, deve ser os primeiros 3 dígitos do ISO 3166-1",
    shipAddrLine1: "Opcional - Primeiro endereço de entrega do titular do cartão",
    shipAddrPostCode: "Opcional - Código postal do endereço de entrega do titular do cartão",
    shipAddrState: "Opcional - Estado do endereço de entrega do titular do cartão. Deve ser a subdivisão do país definido no ISO 3166-2",
    workPhone: {
        cc: "Opcional - Isto indica o código do país do número de telefone, exemplo - 123",
        subscriber: "Opcional - Isto indica o número de telefone do titular da conta, deve incluir o indicador sem o sinal +, exemplo de um número de telefone de Cabo Verde: 2389573234"
    },
    mobilePhone: {
        cc: "Obrigatório - Isto indica o código do país do número de telefone, exemplo - 123",
        subscriber: "Obrigatório - Isto indica o número de telefone do titular da conta, deve incluir o indicador sem o sinal +, exemplo de um número de telefone de Cabo Verde: 2389573234"
    },
}
```

##### Exemplo
```js
const referenceId = 'abc-123';
const total = 1200;
const webhookUrl = 'https://samba.chuva.io/webhooks/sisp-payment';

const userBillingInfo = {
    acctID: "xpto",
    email: "carlos@email.com",
    billAddrCountry: "123",
    mobilePhone: {
        // Código de país de Cabo Verde
        cc: "123",
        subscriber: "2389573234"
    },
};

const htmlForm = sisp.generatePaymentRequestForm(referenceId, total, webhookUrl, userBillingInfo);
```

### Sisp sem 3DSecure

Importa `@chuva/sisp` e crie uma nova instância usando suas credenciais. (obtido do SISP):

```js
const Sisp = require('@chuva/sisp');

const posID = 900512;
const posAutCode = "123456789ssA";
const url = "https://mc.vinti4net.cv/payments";

const sisp = new Sisp({ posID, posAutCode, url });

```
#### Gerar formulário de solicitação de pagamento - `Esta função está obsoleta`

```js
sisp.generatePaymentRequestForm(referenceId, total, webhookUrl);
```
Gera e retorna um formulário HTML que pode ser usado para processar pagamentos.

* `referenceId`: Client-generated payment reference ID. Este valor é enviado através de uma requisição  `POST` para o  `webhookUrl` e permite ao cliente correlacionar a solicitação de pagamento e a resposta.
* `total`: Valor do pagamento (em CVE).
* `webhookUrl`: A url para onde o SISP deve enviar a resposta de pagamento. Você deve esperar uma requisição `POST` com informações de pagamento no corpo. Veja a [documentação](https://www.vinti4.cv/documentation.aspx?id=682) do SISP para mais informações.

##### Exemplo
```js
const referenceId = 'abc-123';
const total = 1200;
const webhookUrl = 'https://samba.chuva.io/webhooks/sisp-payment';

const htmlForm = sisp.generatePaymentRequestForm(referenceId, total, webhookUrl);
```

#### Gerar formulário de solicitação de pagamento de serviço
```js
sisp.generateServicePaymentRequestForm(referenceId, total, webhookUrl, entityCode, referenceNumber);
```
Gera e retorna um formulário HTML que pode ser usado para processar pagamento de serviço.

* `referenceId`: Client-generated payment reference ID. Este valor é enviado através de uma requisição  `POST` para o  `webhookUrl` e permite ao cliente correlacionar a solicitação de pagamento e a resposta.
* `total`: Valor do pagamento (em CVE).
* `webhookUrl`: A url para onde o SISP deve enviar a resposta de pagamento. Você deve esperar uma requisição `POST` com informações de pagamento no corpo. Veja a [documentação](https://www.vinti4.cv/documentation.aspx?id=682) do SISP para mais informações.
* `entityCode`: O código da entidade que receberá o pagamento.
* `referenceNumber`: O número de referência da fatura a pagar.

##### Exemplo
```js
const referenceId = 'abc-123';
const total = 1200;
const webhookUrl = 'https://samba.chuva.io/webhooks/sisp-payment';
const entityCode = '6';
const referenceNumber = '216465697';

const htmlForm = sisp.generateServicePaymentRequestForm(referenceId, total, webhookUrl, entityCode, referenceNumber);
```

#### Gerar formulário de solicitação de recarga
```js
sisp.generateRechargeRequestForm(referenceId, total, webhookUrl, entityCode, phoneNumber);
```
Gera e retorna um formulário HTML que pode ser usado para processar recarga de telefone.

* `referenceId`: Client-generated payment reference ID. Este valor é enviado através de uma requisição  `POST` para o  `webhookUrl` e permite ao cliente correlacionar a solicitação de pagamento e a resposta.
* `total`: Valor do pagamento (em CVE).
* `webhookUrl`: A url para onde o SISP deve enviar a resposta de pagamento. Você deve esperar uma requisição `POST` com informações de pagamento no corpo. Veja a [documentação](https://www.vinti4.cv/documentation.aspx?id=682) do SISP para mais informações.
* `entityCode`: O código da entidade que receberá o pagamento.
* `phoneNumber`: O número de telefone a ser recarregado.

##### Exemplo
```js
const referenceId = 'abc-123';
const total = 1200;
const webhookUrl = 'https://samba.chuva.io/webhooks/sisp-payment';
const entityCode = '2';
const phoneNumber = '9573234';

const htmlForm = sisp.generateRechargeRequestForm(referenceId, total, webhookUrl, entityCode, phoneNumber);
```

#### Gerar formulário de solicitação de token
```js
sisp.generateTokenEnrollmentRequestForm(referenceId, total, webhookUrl);
```
Gera e retorna um formulário HTML que pode ser usado para fazer uma requisição de token.

* `referenceId`: ID de referência da solicitação de token gerado pelo cliente. Este valor é enviado através de uma requisição `POST` para o `webhookUrl` e permite ao cliente correlacionar a solicitação de token e a resposta.
* `total`: Valor do pagamento (em CVE).
* `webhookUrl`: A url para onde o SISP deve enviar a resposta da solicitação de token. Você deve esperar uma requisição `POST` com informações da solicitação de token no corpo. Veja a [documentação](https://www.vinti4.cv/documentation.aspx?id=682) do SISP para mais informações.

##### Exemplo
```js
const referenceId = 'abc-123';
const total = 1200;
const webhookUrl = 'https://samba.chuva.io/webhooks/token-enrollment';

const htmlForm = sisp.generateTokenEnrollmentRequestForm(referenceId, total, webhookUrl);
```

#### Gerar formulário de cancelamento de token
```js
sisp.generateTokenCancelRequestForm(referenceId, webhookUrl, token);
```
Gera e retorna um formulário HTML que pode ser usado para fazer uma requisição para cancelar o token.

* `referenceId`: ID de referência do cancelamento de token gerado pelo cliente. Este valor é enviado através de uma requisição  `POST` para o  `webhookUrl` e permite ao cliente correlacionar a solicitação de cancelamento de token e a resposta.
* `webhookUrl`: A url para onde o SISP deve enviar a resposta do cancelamento de token. Você deve esperar uma requisição `POST` com informações de cancelamento de token no corpo. Veja a [documentação](https://www.vinti4.cv/documentation.aspx?id=682) do SISP para mais informações.
* `token`: O token a ser cancelado. Também é usado para autenticar a solicitação. Este token é recuperado da responta do pedido `token enrollment`.

##### Exemplo
```js
const referenceId = 'abc-123';
const total = 1200;
const webhookUrl = 'https://samba.chuva.io/webhooks/token-cancel';

const token = '831561583';

const htmlForm = sisp.generateTokenCancelRequestForm(referenceId, webhookUrl, token);
```

#### Gerar formulário de pagamento com token
```js
sisp.generateTokenPurchaseRequestForm(referenceId, total, webhookUrl, token);
```
Gera e retorna um formulário HTML que pode ser usado para fazer uma requisição de pagamento com token.

* `referenceId`: ID de referência de pagamento com token gerado pelo cliente. Este valor é enviado através de uma requisição  `POST` para o  `webhookUrl` e permite ao cliente correlacionar a solicitação de pagamento com token e a resposta.
* `total`: Valor do pagamento (em CVE).
* `webhookUrl`: A url para onde o SISP deve enviar a resposta do pagamento com token. Você deve esperar uma requisição `POST` com informações do pagamento com token no corpo. Veja a [documentação](https://www.vinti4.cv/documentation.aspx?id=682) do SISP para mais informações.
* `token`: O token para autenticar o pedido. Este token é recuperado da responta do pedido `token enrollment`.

##### Exemplo
```js
const referenceId = 'abc-123';
const total = 1200;
const webhookUrl = 'https://samba.chuva.io/webhooks/token-payment';

const token = '831561583';

const htmlForm = sisp.generateTokenPurchaseRequestForm(referenceId, total, webhookUrl, token);
```

#### Gerar formulário de pagamento de serviços com token
```js
sisp.generateTokenServicePaymentRequestForm(referenceId, total, webhookUrl, entityCode, referenceNumber, token);
```
Gera e retorna um formulário HTML que pode ser usado para fazer uma requisição de pagamento de serviços com token.

* `referenceId`: ID de referência do pagamento de serviços com token gerado pelo cliente. Este valor é enviado através de uma requisição  `POST` para o  `webhookUrl` e permite ao cliente correlacionar a solicitação do pagamento de serviços com token e a resposta.
* `total`: Valor do pagamento (em CVE).
* `webhookUrl`: A url para onde o SISP deve enviar a resposta de pagamento de serviços com token. Você deve esperar uma requisição `POST` com informações de pagamento de serviços com token no corpo. Veja a [documentação](https://www.vinti4.cv/documentation.aspx?id=682) do SISP para mais informações.
* `entityCode`: O código da entidade que receberá o pagamento.
* `referenceNumber`: O número de referência da fatura a pagar.
* `token`: O token para autenticar o pedido. Este token é recuperado da responta do pedido `token enrollment`.

##### Exemplo
```js
const referenceId = 'abc-123';
const total = 1200;
const webhookUrl = 'https://samba.chuva.io/webhooks/token-payment';
const entityCode = '6';
const referenceNumber = '216465697';

const token = '831561583';

const htmlForm = sisp.generateTokenServicePaymentRequestForm(referenceId, total, webhookUrl, entityCode, referenceNumber, token);
```

#### Gerar formulário de recarga de telefone com token
```js
sisp.generateTokenRechargeRequestForm(referenceId, total, webhookUrl, entityCode, phoneNumber, token);
```
Gera e retorna um formulário HTML que pode ser usado para fazer uma requisição de recarga de telefone com token.

* `referenceId`: ID de referência de recarga de telefone com token gerado pelo cliente. Este valor é enviado através de uma requisição  `POST` para o  `webhookUrl` e permite ao cliente correlacionar a solicitação de recarga de telefone com token e a resposta.
* `total`: Valor do pagamento (em CVE).
* `webhookUrl`: A url para onde o SISP deve enviar a resposta de recarga de telefone com token. Você deve esperar uma requisição `POST` com informações de recarga de telefone com token no corpo. Veja a [documentação](https://www.vinti4.cv/documentation.aspx?id=682) do SISP para mais informações.
* `entityCode`: O código da entidade que receberá o pagamento.
* `phoneNumber`: O número de telefone a ser recarregado.
* `token`: O token para autenticar o pedido. Este token é recuperado da responta do pedido `token enrollment`.

##### Exemplo
```js
const referenceId = 'abc-123';
const total = 1200;
const webhookUrl = 'https://samba.chuva.io/webhooks/token-payment';
const entityCode = '2';
const phoneNumber = '9573234';

const token = '831561583';

const htmlForm = sisp.generateTokenRechargeRequestForm(referenceId, total, webhookUrl, entityCode, phoneNumber, token);
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
| Token enrollment       |             5             |           A           |
| Token cancel           |             7             |           C           |
| Token purchase         |             6             |           B           |
| Token service payment  |             2             |           B           |
| Token recharge         |             3             |           B           |

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
