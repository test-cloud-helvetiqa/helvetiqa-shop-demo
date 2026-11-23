# Demo Shop

The application under test of HelvetiQA's Change Radar scenario: a product list, a cart through `POST /api/cart`
and a checkout. No dependencies.

```
npm start            # http://127.0.0.1:4310
PORT=4312 npm start  # another port
```

`GET /version` answers the version and the commit that runs, which HelvetiQA records with every run.
The tests live in the repository `helvetiqa-shop-tests`.
