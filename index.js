/**
 * Shopify Product Updater Cloud Function
 *
 * Code designed by Pavel Alvarez @Codebypavel as a technical test for Aroma360
 * Date: 19/08/2025 (automatically updated at the time of deployment)
 *
 * Description:
 * This HTTP function updates products in Shopify using its API.
 * It receives product_id, title, and price, and updates the corresponding product.
 * Implements CORS, error handling, and clear notifications.
 */

const functions = require('@google-cloud/functions-framework');
const fetch = require('node-fetch');

// We register the HTTP function 'productUpdater' in Cloud Functions
functions.http('productUpdater', async (req, res) => {

  // We configure CORS to allow requests from any origin (*).
  // In production, you should restrict this to specific domains.
  res.set('Access-Control-Allow-Origin', '*');
  
  try {
    // 1. INPUT DATA VALIDATION
    const { product_id, title, price } = req.body;
    
    // We verify that the required fields are present
    if (!product_id || !title || !price) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        message: 'You must provide product_id, title, and price',
        status: 'error'
      });
    }

    // We extract the product ID from the full URL (in case it comes as a Shopify URL)
    const productId = product_id.split('/').pop();

    // 2. UPDATING THE PRODUCT IN SHOPIFY
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

    // 3. HANDLING THE SHOPIFY RESPONSE
    const data = await response.json();
    
    // If Shopify returns an error, we propagate it to the client
    if (!response.ok) {
      return res.status(response.status).json({
        error: 'Error updating the product in Shopify',
        shopify_error: data.errors || data.message,
        status: 'error'
      });
    }

    // 4. SUCCESSFUL RESPONSE
    res.status(200).json({
      data: data,
      message: 'Product updated successfully',
      status: 'success'
    });
    
  } catch (error) {
    // 5. UNEXPECTED ERROR HANDLING
    console.error('Unexpected error:', error);
    
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'An unexpected error occurred while processing the request',
      details: error.message,
      status: 'error'
    });
  }
});
