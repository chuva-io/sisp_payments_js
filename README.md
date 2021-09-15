# SISP PAYMENTS JS

# Introduction
This module simplifies getting started with processing Vinti4, Visa, and Mastercard payments using SISP on Node.js.

**Note:** You can request SISP credentials, view their documentation, and more [here](https://www.vinti4.cv/web.aspx).

```js
// Credentials that should be provided by SISP
const posID = "";
const posAutCode = "";
```
These credentials are used to allow you to process the payment using SISP payment services.

# Getting Started

## Module Configuration
Import `sisp-payments` and create a new instance using your credentials. (obtained from SISP):

```js
const Sisp = require('sisp-payments');

const posID = 900512;
const posAutCode = "123456789ssA";

const sisp = new Sisp({ posID, posAutCode });

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
