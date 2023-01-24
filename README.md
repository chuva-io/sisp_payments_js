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

### Sisp with 3DSecure

Import `@chuva.io/sisp/src/sisp3DS` and create a new instance using your credentials. (obtained from SISP):

```js
const Sisp = require('@chuva.io/sisp/src/sisp3DS');

const posID = '900512';
const posAutCode = "123456789ssA";
const url = "https://mc.vinti4net.cv/3ds_payments_url";

const sisp = new Sisp({ posID, posAutCode, url });

```
#### Generate Payment Request Form with 3DSec

```js
sisp.generatePaymentRequestForm(referenceId, total, webhookUrl, userBillingInfo);
```
Generates and returns an HTML form that can be used to process payments with 3DSecure.

* `referenceId`: Client-generated payment reference ID. This value is sent via a `POST` request to the `webhookUrl` and allows the client to correlate the payment request and response.
* `total`: Payment amount (in CVE).
* `webhookUrl`: The url where SISP should send the payment response. You should expect a `POST` request with payment information in the body. See the SISP [documentation]( https://www.vinti4.cv/documentation.aspx?id=682) for more information.
* `userBillingInfo`: This is an object containing information related to the user being billed.
* `options` - Optional - This is an object used to setup some configurations for the form, like language and currency
* `options.languageMessages` - Optional - This is used to setup the languages for the response messages.
* `options.currencyCode` - Optional - This is to setup the currency.

##### userBillingInfo field
```js
{
    acctID: "Required - This is the user id at the account",
    acctInfo: {
        chAccAgeInd: "Optional - This indicates the age of the user account, the acceptable values are: 01 - Without account, 02 - Account created during the transaction, 03 - Account with less than 30 days, 04 - Account age between 30 and 60 days, 05 - Account with more than 60 days",
        chAccChange: "Optional - Date that happened any change to the user account. The required format is - yyyyMMdd",
        chAccDate: "Optional - Date that the user account was created. The required format is - yyyyMMdd",
        chAccPwChange: "Optional - Date that the user changed his account password. The required format is - yyyyMMdd",
        chAccPwChangeInd: "Optional - This indicates the age of the user account password, the acceptable values are: 01 - Without password, 02 - password created during the transaction, 03 - password with less than 30 days, 04 - password age between 30 and 60 days, 05 - password with more than 60 days",
        suspiciousAccActivity: "Optional - This indicates suspicious user account activity. Indicates if the merchant has experienced suspicious activity from the user in question (includes previous fraud complaints). Acceptable value are: 01 - none suspect, 02 - suspect"
    },
    email: "Required - Email address of the card holder",
    addrMatch: "Optional - This indicates if the billing address is the same as shipping address. Acceptable values are: Y - yes, N - no, in case it is Y the values filled on billAddr* should be the same as shipAddr*",
    billAddrCity: "Optional - City of the billing address of the card holder",
    billAddrCountry: "Required - The country of the billing address of the card holder, it should be the first 3 digits of the ISO 3166-1",
    billAddrLine1: "Optional - First billing address of the card holder",
    billAddrLine2: "Optional - Second billing address of the card holder",
    billAddrLine3: "Optional - Thrid billing address of the card holder",
    billAddrPostCode: "Optional - Postal code of the billing address of the card holder",
    billAddrState: "Optional - State of the billing address of the card holder. It should be the sub-division of the defined country in ISO 3166-2",
    shipAddrCity: "Optional - City of the delivery address of the card holder",
    shipAddrCountry: "Optional - The country of the delivery address of the card holder, it should be the first 3 digits of the ISO 3166-1",
    shipAddrLine1: "Optional - First delivery address of the card holder",
    shipAddrPostCode: "Optional - Postal code of the delivery address of the card holder",
    shipAddrState: "Optional - State of the delivery address of the card holder. It should be the sub-division of the defined country in ISO 3166-2",
    workPhone: {
        cc: "Optional - This indicates the country code of the country of the phone number, example - 123",
        subscriber: "Optional - This indicates the phone number of the account holder, it should include the indicator without the + sign, example of a phone number of Cape Verd: 2389573234"
    },
    mobilePhone: {
        cc: "Required - This indicates the country code of the country of the phone number, example - 123",
        subscriber: "Required - This indicates the phone number of the account holder, it should include the indicator without the + sign, example of a phone number of Cape Verd: 2389573234"
    },
}
```

##### Example
```js
const referenceId = 'abc-123';
const total = 1200;
const webhookUrl = 'https://samba.chuva.io/webhooks/sisp-payment';

const userBillingInfo = {
    acctID: "xpto",
    email: "carlos@email.com",
    billAddrCountry: "123",
    mobilePhone: {
        // Cape Verd country code
        cc: "123",
        subscriber: "2389573234"
    },
};

const htmlForm = sisp.generatePaymentRequestForm(referenceId, total, webhookUrl, userBillingInfo);
```

### Sisp without 3DSecure

Import `@chuva/sisp` and create a new instance using your credentials. (obtained from SISP):

```js
const Sisp = require('@chuva.io/sisp');;

const posID = 900512;
const posAutCode = "123456789ssA";
const url = "https://mc.vinti4net.cv/payments";

const sisp = new Sisp({ posID, posAutCode, url });

```

#### Generate Payment Request Form - `This function is deprecated`

```js
sisp.generatePaymentRequestForm(referenceId, total, webhookUrl);
```
Generates and returns an HTML form that can be used to process payments.

* `referenceId`: Client-generated payment reference ID. This value is sent via a `POST` request to the `webhookUrl` and allows the client to correlate the payment request and response.
* `total`: Payment amount (in CVE).
* `webhookUrl`: The url where SISP should send the payment response. You should expect a `POST` request with payment information in the body. See the SISP [documentation]( https://www.vinti4.cv/documentation.aspx?id=682) for more information.

##### Example
```js
const referenceId = 'abc-123';
const total = 1200;
const webhookUrl = 'https://samba.chuva.io/webhooks/sisp-payment';

const htmlForm = sisp.generatePaymentRequestForm(referenceId, total, webhookUrl);
```

#### Generate Service Payment Request Form
```js
sisp.generateServicePaymentRequestForm(referenceId, total, webhookUrl, entityCode, referenceNumber);
```
Generates and returns an HTML form that can be used to process service payments.

* `referenceId`: Client-generated payment reference ID. This value is sent via a `POST` request to the `webhookUrl` and allows the client to correlate the payment request and response.
* `total`: Payment amount (in CVE).
* `webhookUrl`: The url where SISP should send the payment response. You should expect a `POST` request with payment information in the body. See the SISP [documentation]( https://www.vinti4.cv/documentation.aspx?id=682) for more information.
* `entityCode`: The code of the entity that will receive the payment.
* `referenceNumber`: The reference number of the invoice to be paid.

##### Example
```js
const referenceId = 'abc-123';
const total = 1200;
const webhookUrl = 'https://samba.chuva.io/webhooks/sisp-payment';
const entityCode = '6';
const referenceNumber = '216465697';

const htmlForm = sisp.generateServicePaymentRequestForm(referenceId, total, webhookUrl, entityCode, referenceNumber);
```

#### Generate Recharge Request Form
```js
sisp.generateRechargeRequestForm(referenceId, total, webhookUrl, entityCode, phoneNumber);
```
Generates and returns an HTML form that can be used to process phone recharge.

* `referenceId`: Client-generated payment reference ID. This value is sent via a `POST` request to the `webhookUrl` and allows the client to correlate the payment request and response.
* `total`: Payment amount (in CVE).
* `webhookUrl`: The url where SISP should send the payment response. You should expect a `POST` request with payment information in the body. See the SISP [documentation]( https://www.vinti4.cv/documentation.aspx?id=682) for more information.
* `entityCode`: The code of the entity that will receive the payment.
* `phoneNumber`: The phone number to be recharged.

##### Example
```js
const referenceId = 'abc-123';
const total = 1200;
const webhookUrl = 'https://samba.chuva.io/webhooks/sisp-payment';
const entityCode = '2';
const phoneNumber = '9573234';

const htmlForm = sisp.generateRechargeRequestForm(referenceId, total, webhookUrl, entityCode, phoneNumber);
```

#### Generate Token Enrollment Request Form
```js
sisp.generateTokenEnrollmentRequestForm(referenceId, total, webhookUrl);
```
Generates and returns an HTML form that can be used to make a token enrollment request.

* `referenceId`: Client-generated token enrollment reference ID. This value is sent via a `POST` request to the `webhookUrl` and allows the client to correlate the token enrollment request and response.
* `total`: This is the minimal amount (in CVE) accepted for a payment.
* `webhookUrl`: The url where SISP should send the token enrollment response. You should expect a `POST` request with token enrollment information in the body. See the SISP [documentation]( https://www.vinti4.cv/documentation.aspx?id=682) for more information.

##### Example
```js
const referenceId = 'abc-123';
const total = 1200;
const webhookUrl = 'https://samba.chuva.io/webhooks/token-enrollment';

const htmlForm = sisp.generateTokenEnrollmentRequestForm(referenceId, total, webhookUrl);
```

#### Generate Token Cancel Request Form
```js
sisp.generateTokenCancelRequestForm(referenceId, webhookUrl, token);
```
Generates and returns an HTML form that can be used to make a token cancel request.

* `referenceId`: Client-generated token cancel reference ID. This value is sent via a `POST` request to the `webhookUrl` and allows the client to correlate the token cancel request and response.
* `webhookUrl`: The url where SISP should send the token cancel response. You should expect a `POST` request with token cancel information in the body. See the SISP [documentation]( https://www.vinti4.cv/documentation.aspx?id=682) for more information.
* `token`: The token to be cancelled. It is also used to authenticate the request. This token is retrieved from the `token enrollment` request response.

##### Example
```js
const referenceId = 'abc-123';
const total = 1200;
const webhookUrl = 'https://samba.chuva.io/webhooks/token-cancel';

const token = '831561583';

const htmlForm = sisp.generateTokenCancelRequestForm(referenceId, webhookUrl, token);
```

#### Generate Token Purchase Request Form
```js
sisp.generateTokenPurchaseRequestForm(referenceId, total, webhookUrl, token);
```
Generates and returns an HTML form that can be used to make a token purchase request.

* `referenceId`: Client-generated token purchase reference ID. This value is sent via a `POST` request to the `webhookUrl` and allows the client to correlate the token purchase request and response.
* `total`: Payment amount (in CVE).
* `webhookUrl`: The url where SISP should send the token purchase response. You should expect a `POST` request with token purchase information in the body. See the SISP [documentation]( https://www.vinti4.cv/documentation.aspx?id=682) for more information.
* `token`: The token to authenticate the request. This token is retrieved from the `token enrollment` request response.

##### Example
```js
const referenceId = 'abc-123';
const total = 1200;
const webhookUrl = 'https://samba.chuva.io/webhooks/token-payment';

const token = '831561583';

const htmlForm = sisp.generateTokenPurchaseRequestForm(referenceId, total, webhookUrl, token);
```

#### Generate Token Service Payment Request Form
```js
sisp.generateTokenServicePaymentRequestForm(referenceId, total, webhookUrl, entityCode, referenceNumber, token);
```
Generates and returns an HTML form that can be used to make a token service payment request.

* `referenceId`: Client-generated token service payment reference ID. This value is sent via a `POST` request to the `webhookUrl` and allows the client to correlate the token service payment request and response.
* `total`: Payment amount (in CVE).
* `webhookUrl`: The url where SISP should send the token service payment response. You should expect a `POST` request with token service payment information in the body. See the SISP [documentation]( https://www.vinti4.cv/documentation.aspx?id=682) for more information.
* `entityCode`: The code of the entity that will receive the payment.
* `referenceNumber`: The reference number of the invoice to be paid.
* `token`: The token to authenticate the request. This token is retrieved from the `token enrollment` request response.

##### Example
```js
const referenceId = 'abc-123';
const total = 1200;
const webhookUrl = 'https://samba.chuva.io/webhooks/token-payment';
const entityCode = '6';
const referenceNumber = '216465697';

const token = '831561583';

const htmlForm = sisp.generateTokenServicePaymentRequestForm(referenceId, total, webhookUrl, entityCode, referenceNumber, token);
```

#### Generate Token Phone Recharge Request Form
```js
sisp.generateTokenRechargeRequestForm(referenceId, total, webhookUrl, entityCode, phoneNumber, token);
```
Generates and returns an HTML form that can be used to make a token phone recharge request.

* `referenceId`: Client-generated token phone recharge reference ID. This value is sent via a `POST` request to the `webhookUrl` and allows the client to correlate the token phone recharge request and response.
* `total`: Payment amount (in CVE).
* `webhookUrl`: The url where SISP should send the token phone recharge response. You should expect a `POST` request with token phone recharge information in the body. See the SISP [documentation]( https://www.vinti4.cv/documentation.aspx?id=682) for more information.
* `entityCode`: The code of the entity that will receive the payment.
* `phoneNumber`: The phone number to be recharged.
* `token`: The token to authenticate the request. This token is retrieved from the `token enrollment` request response.

##### Example
```js
const referenceId = 'abc-123';
const total = 1200;
const webhookUrl = 'https://samba.chuva.io/webhooks/token-payment';
const entityCode = '2';
const phoneNumber = '9573234';

const token = '831561583';

const htmlForm = sisp.generateTokenRechargeRequestForm(referenceId, total, webhookUrl, entityCode, phoneNumber, token);
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
| Token enrollment       |             5             |           A           |
| Token cancel           |             7             |           C           |
| Token purchase         |             6             |           B           |
| Token service payment  |             2             |           B           |
| Token recharge         |             3             |           B           |

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
