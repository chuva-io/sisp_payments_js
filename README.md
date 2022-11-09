# SISP PAYMENTS JS

# Introduction
This module simplifies getting started with processing Vinti4, Visa, and Mastercard payments using SISP on Node.js.

**Note:** You can request SISP credentials, view their documentation, and more [here](https://www.vinti4.cv/web.aspx).

```js
// Credentials that should be provided by SISP
const posID = "";
const posAutCode = "";
const url = "";
```
These credentials are used to allow you to process the payment using SISP payment services.

# Getting Started

## Quick Overview
You can install this package using `npm` or `yarn` by running one of the following commands:
```bash
$ npm install @chuva.io/sisp
# OR
$ yarn add @chuva.io/sisp
```
## Module Configuration
Import `sisp-payments` and create a new instance using your credentials. (obtained from SISP):

```js
const Sisp = require('sisp-payments');

const posID = 900512;
const posAutCode = "123456789ssA";
const url = "https://mc.vinti4net.cv/payments";

const sisp = new Sisp({ posID, posAutCode, url });

```
## Generate Payment Request Form
```js
sisp.generatePaymentRequestForm(referenceId, total, webhookUrl);
```
Generates and returns an HTML form that can be used to process payments.

* `referenceId`: Client-generated payment reference ID. This value is sent via a `POST` request to the `webhookUrl` and allows the client to correlate the payment request and response.
* `total`: Payment amount (in CVE).
* `webhookUrl`: The url where SISP should send the payment response. You should expect a `POST` request with payment information in the body. See the SISP [documentation]( https://www.vinti4.cv/documentation.aspx?id=682) for more information.

### Example
```js
const referenceId = 'abc-123';
const total = 1200;
const webhookUrl = 'https://samba.chuva.io/webhooks/sisp-payment';

const htmlForm = sisp.generatePaymentRequestForm(referenceId, total, webhookUrl);
```

## Generate Service Payment Request Form
```js
sisp.generateServicePaymentRequestForm(referenceId, total, webhookUrl, entityCode, referenceNumber);
```
Generates and returns an HTML form that can be used to process service payments.

* `referenceId`: Client-generated payment reference ID. This value is sent via a `POST` request to the `webhookUrl` and allows the client to correlate the payment request and response.
* `total`: Payment amount (in CVE).
* `webhookUrl`: The url where SISP should send the payment response. You should expect a `POST` request with payment information in the body. See the SISP [documentation]( https://www.vinti4.cv/documentation.aspx?id=682) for more information.
* `entityCode`: The code of the entity that will receive the payment.
* `referenceNumber`: The reference number of the invoice to be paid.

### Example
```js
const referenceId = 'abc-123';
const total = 1200;
const webhookUrl = 'https://samba.chuva.io/webhooks/sisp-payment';
const entityCode = '6';
const referenceNumber = '216465697';

const htmlForm = sisp.generateServicePaymentRequestForm(referenceId, total, webhookUrl, entityCode, referenceNumber);
```

## Generate Recharge Request Form
```js
sisp.generateRechargeRequestForm(referenceId, total, webhookUrl, entityCode, phoneNumber);
```
Generates and returns an HTML form that can be used to process phone recharge.

* `referenceId`: Client-generated payment reference ID. This value is sent via a `POST` request to the `webhookUrl` and allows the client to correlate the payment request and response.
* `total`: Payment amount (in CVE).
* `webhookUrl`: The url where SISP should send the payment response. You should expect a `POST` request with payment information in the body. See the SISP [documentation]( https://www.vinti4.cv/documentation.aspx?id=682) for more information.
* `entityCode`: The code of the entity that will receive the payment.
* `phoneNumber`: The phone number to be recharged.

### Example
```js
const referenceId = 'abc-123';
const total = 1200;
const webhookUrl = 'https://samba.chuva.io/webhooks/sisp-payment';
const entityCode = '2';
const phoneNumber = '9573234';

const htmlForm = sisp.generateRechargeRequestForm(referenceId, total, webhookUrl, entityCode, phoneNumber);
```

## Validate Payment Processing Status (convenience method)
Check whether or not a payment was processed successfully.
**Note:** This method is provided as a convenience. See the SISP documentation for the request structure.

### Usage
Pass the Webhook request body to `validatePayment`. Returns an error object containing `code` and `description` if there is an error, otherwise returns `undefined`.

```js
validatePayment(responseBody)
```

`Note`: The responseBody should be of type `x-www-form-urlencoded` as provided by SISP.

#### Possible success messageTypes per transactionCode
| Transaction: `string`  | transactionCode: `string` | messageType: `string` |
|------------------------|---------------------------|-----------------------|
| Purchase               |             1             |           8           |
| Service Payment        |             2             |           P           |
| Phone recharge         |             3             |           M           |

#### Possible Errors
| Code: `string`  | Description: `string`               |
|-------|:----------------------------------------------|
| 001   | Payment processing error: Invalid fingerprint |
| 002   | Payment processing error: Cancelled by user   |
| 003   | Payment processing error: Processing error    |

### Example

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
