/**
 * Shopify Product Updater Cloud Function
 * 
 * Código diseñado por Pavel Alvarez @Codebypavel como test técnico para Aroma360
 * Fecha: 19/08/2025 (actualizado automáticamente al momento de implementación)
 * 
 * Descripción: 
 * Esta función HTTP actualiza productos en Shopify mediante su API.
 * Recibe product_id, title y price, y actualiza el producto correspondiente.
 * Implementa CORS, manejo de errores y notificaciones claras.
 */

const functions = require('@google-cloud/functions-framework');
const fetch = require('node-fetch');

// Registramos la función HTTP 'productUpdater' en Cloud Functions
functions.http('productUpdater', async (req, res) => {
  // Configuramos CORS para permitir solicitudes desde cualquier origen (*)
  // En producción, deberías restringir esto a dominios específicos
  res.set('Access-Control-Allow-Origin', '*');
  
  try {
    // 1. VALIDACIÓN DE DATOS DE ENTRADA
    const { product_id, title, price } = req.body;
    
    // Verificamos que los campos requeridos estén presentes
    if (!product_id || !title || !price) {
      return res.status(400).json({ 
        error: 'Faltan campos requeridos',
        message: 'Debes proporcionar product_id, title y price',
        status: 'error'
      });
    }

    // Extraemos el ID del producto de la URL completa (por si viene como URL de Shopify)
    const productId = product_id.split('/').pop();

    // 2. ACTUALIZACIÓN DEL PRODUCTO EN SHOPIFY
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

    // 3. MANEJO DE LA RESPUESTA DE SHOPIFY
    const data = await response.json();
    
    if (!response.ok) {
      // Si Shopify devuelve un error, lo propagamos al cliente
      return res.status(response.status).json({
        error: 'Error al actualizar el producto en Shopify',
        shopify_error: data.errors || data.message,
        status: 'error'
      });
    }

    // 4. RESPUESTA EXITOSA
    res.status(200).json({
      data: data,
      message: 'Producto actualizado exitosamente',
      status: 'success'
    });
    
  } catch (error) {
    // 5. MANEJO DE ERRORES INESPERADOS
    console.error('Error inesperado:', error);
    
    res.status(500).json({ 
      error: 'Error interno del servidor',
      message: 'Ocurrió un error inesperado al procesar la solicitud',
      details: error.message,
      status: 'error'
    });
  }
});
