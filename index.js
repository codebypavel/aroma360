const functions = require('@google-cloud/functions-framework');
const fetch = require('node-fetch');

functions.http('productUpdater', async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  
  try {
    const { product_id, title, price } = req.body;
    const productId = product_id.split('/').pop();

    const response = await fetch(
      `https://aroma360test.myshopify.com/admin/api/2023-07/products/${productId}.json`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': process.env.SHOPIFY_ACCESS_TOKEN
        },
        body: JSON.stringify({
          product: {
            title: title,
            variants: [{ price: price }]
          }
        })
      }
    );

    const data = await response.json();
    res.status(200).json(data);
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
