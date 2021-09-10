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
