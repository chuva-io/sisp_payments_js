# SISP PAYMENTS JS 💳
This is a minimal, lightweight API to process payment with SISP.
So you can easily build your own API without worry about all SISP configurations to process payments.

Created with <3 for developers who need a quick SISP payment service for NodeJS back-end.

## Requirements
- NodeJS
- You need SISP credentials, for that you need to contact [SISP](https://www.vinti4.cv/web.aspx)
- Install the API.

## Usage
1. Create a .env file with your credentials
```js
SISP_VINTI4_POS_ID=
SISP_VINTI4_POS_AUT_CODE=
SISP_VINTI4_MERCHANT_ID=
SISP_VINTI4_WEBHOOK_URL=
SISP_VINTI4_URL=
```
2. Import SISP in your file that you want to process payment
```js
 const sisp = require('sisp');
```
3. Generate the HTML Form to process payment
```js
// Example
const fileName = `${user_id}:${order_id}`;
const fileExtension = 'html';
const total = 1200;
const htmlForm = await sisp.generatePaymentForm(fileName, user_id, order_id, total);
```
4. Store SISP payment form
```js
// Example path to store SISP payment form
const baseDir = path.join(__dirname, './path_to_serve_static_file');
// Store SISP payment form
await createSispPaymentFile(baseDir, `${fileName}.${fileExtension}`, htmlForm);
```
5. Send the front end response with the file
```js
return res.status(201).send(`${process.env.YOUR_SERVER_URL}files/${fileName}.${fileExtension}`);
```

6. Create a route that SISP will contact you if the payment was processed with success or not.
```js
// Example
router.post(
  '/sisp_payment',
  bodyParser.urlencoded({ extended: false }),
  controller.handle_sisp_payment
);
```

7. Create the controller to handle SISP payment
```js
handle_sisp_payment: async (req, res) => {
    const fileExtension = 'html';
    const { code, message } = await sisp.processWebhook(req.body);
    const { store_id, order_id, ref } = sisp.orderDataFromWebhook(req.body);
    /* path for SISP payment form */
    const baseDir = path.join(__dirname, './path_to_serve_static_file');

    if (code === 200) {
      // handle success case
      ...

      /* delete SISP payment form */
      sisp.deleteSispPaymentFile(`${baseDir}${ref}.${fileExtension}`);
    }
    else {
      console.error('ERROR to process payment with SISP');
      console.error('Ref', ref);
      console.error('Code', code);
      console.error('Message', message);


      // handle the error
      ...

      /* delete sisp payment form */
      sisp.deleteSispPaymentFile(`${baseDir}${ref}.${fileExtension}`);
    }
  }
};
```

## Show your support

Give a ⭐️ if this project helped you!
## License
MIT
