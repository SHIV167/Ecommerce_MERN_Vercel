import axios, { AxiosError } from 'axios';
import SettingModel from '../models/Setting';

interface ServiceabilityParams {
  pickup_pincode: string;
  delivery_pincode: string;
  weight: number; // in kg
  cod: number; // 1 or 0
}

let cachedToken: string | null = null;
let tokenExpiry: number = 0;

// Helper function to safely handle different error types
function handleError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    // Handle Axios error
    const axiosError = error as AxiosError;
    if (axiosError.response) {
      return `API Error (${axiosError.response.status}): ${JSON.stringify(axiosError.response.data)}`;
    } else if (axiosError.request) {
      return 'No response received from server';
    } else {
      return `Request setup error: ${axiosError.message}`;
    }
  } else if (error instanceof Error) {
    // Handle standard Error object
    return error.message;
  } else {
    // Handle completely unknown error
    return String(error);
  }
}

// Log error details safely
function logErrorDetails(context: string, error: unknown): void {
  console.error(`ERROR IN ${context}:`);
  
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError;
    if (axiosError.response) {
      console.error('Response status:', axiosError.response.status);
      console.error('Response headers:', axiosError.response.headers);
      console.error('Response data:', axiosError.response.data);
    } else if (axiosError.request) {
      console.error('No response received, request details:', axiosError.request);
    } else {
      console.error('Error message:', axiosError.message);
    }
    console.error('Axios error config:', axiosError.config);
  } else if (error instanceof Error) {
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
  } else {
    console.error('Unknown error type:', error);
  }
}

async function getAuthToken(): Promise<string> {
  try {
    if (cachedToken && Date.now() < tokenExpiry) {
      console.log("Using cached ShipRocket token");
      return cachedToken;
    }
    
    console.log("Getting new ShipRocket token...");
    const settings = await SettingModel.findOne();
    if (!settings) {
      console.error("ShipRocket settings not found in database");
      throw new Error('ShipRocket settings not configured');
    }
    
    const { shiprocketApiKey: email, shiprocketApiSecret: password } = settings;
    if (!email || !password) {
      console.error("Missing ShipRocket credentials in settings");
      throw new Error('ShipRocket credentials missing');
    }
    
    console.log("Attempting to authenticate with ShipRocket API");
    try {
      const resp = await axios.post(
        'https://apiv2.shiprocket.in/v1/external/auth/login',
        { email, password }
      );
      
      console.log("ShipRocket auth response status:", resp.status);
      
      if (!resp.data || !resp.data.token) {
        console.error("No token in ShipRocket response:", resp.data);
        throw new Error('No token returned from ShipRocket');
      }
      
      const { token, expires_in } = resp.data;
      cachedToken = token;
      tokenExpiry = Date.now() + (expires_in - 60) * 1000;
      console.log("New ShipRocket token obtained, expires in:", expires_in, "seconds");
      return token;
    } catch (error: unknown) {
      // Safely handle and log the authentication error
      logErrorDetails("SHIPROCKET AUTHENTICATION", error);
      throw new Error(`ShipRocket authentication failed: ${handleError(error)}`);
    }
  } catch (error: unknown) {
    // Safely handle and log any other error in the getAuthToken function
    logErrorDetails("GET AUTH TOKEN", error);
    throw new Error(`Failed to get ShipRocket token: ${handleError(error)}`);
  }
}

export async function getServiceability(params: ServiceabilityParams) {
  try {
    const token = await getAuthToken();
    const url = 'https://apiv2.shiprocket.in/v1/external/courier/serviceability/';
    
    console.log("Checking serviceability with params:", params);
    
    const resp = await axios.get(url, {
      headers: { Authorization: `Bearer ${token}` },
      params: {
        pickup_postcode: params.pickup_pincode,
        delivery_postcode: params.delivery_pincode,
        weight: params.weight,
        cod: params.cod,
      },
    });
    
    console.log("Serviceability check response status:", resp.status);
    return resp.data;
  } catch (error: unknown) {
    logErrorDetails("SERVICEABILITY CHECK", error);
    throw new Error(`ShipRocket serviceability check failed: ${handleError(error)}`);
  }
}

// Create an adhoc shipment/order in Shiprocket with improved error handling
export async function createShipment(order: any, items: any[]) {
  try {
    console.log("Creating shipment for order:", order.id);
    console.log("Item count:", items.length);
    
    // Validate essential inputs
    if (!order || !order.id) {
      throw new Error("Invalid order: missing order ID");
    }
    
    if (!Array.isArray(items) || items.length === 0) {
      throw new Error("Invalid order items: empty or not an array");
    }
    
    // Get settings
    let settings;
    try {
      settings = await SettingModel.findOne();
      if (!settings) {
        throw new Error('ShipRocket settings not configured');
      }
    } catch (error: unknown) {
      logErrorDetails("SETTINGS RETRIEVAL", error);
      throw new Error(`Failed to get ShipRocket settings: ${handleError(error)}`);
    }
    
    // Get auth token
    let token;
    try {
      token = await getAuthToken();
    } catch (error: unknown) {
      // Error already logged and handled in getAuthToken
      throw error;
    }
    
    const url = 'https://apiv2.shiprocket.in/v1/external/orders/create/adhoc';
    
    // Create order payload with default values where needed
    const payload = {
      order_id: (order.id?.toString() || order._id?.toString()),
      order_date: new Date().toISOString().split('T')[0],
      pickup_location: settings.shiprocketPickupLocation || 'Primary',
      channel_id: settings.shiprocketChannelId,
      billing_customer_name: order.billingCustomerName || 'Customer',
      billing_last_name: order.billingLastName || '',
      billing_address: order.billingAddress || order.shippingAddress || '',
      billing_city: order.billingCity || order.shippingCity || '',
      billing_state: order.billingState || order.shippingState || '',
      billing_country: order.billingCountry || order.shippingCountry || 'India',
      billing_pincode: order.billingPincode || order.shippingPincode || '',
      billing_email: order.billingEmail || '',
      billing_phone: order.billingPhone || '',
      shipping_is_billing: order.shippingIsBilling ?? true,
      shipping_customer_name: order.shippingIsBilling ? order.billingCustomerName : (order.shippingCustomerName || 'Customer'),
      shipping_address: order.shippingIsBilling ? order.billingAddress : (order.shippingAddress || ''),
      shipping_city: order.shippingIsBilling ? order.billingCity : (order.shippingCity || ''),
      shipping_state: order.shippingIsBilling ? order.billingState : (order.shippingState || ''),
      shipping_country: order.shippingIsBilling ? order.billingCountry : (order.shippingCountry || 'India'),
      shipping_pincode: order.shippingIsBilling ? order.billingPincode : (order.shippingPincode || ''),
      payment_method: order.paymentMethod || 'Prepaid',
      sub_total: order.subtotal || items.reduce((sum, item) => sum + ((item.sellingPrice || item.price) * (item.units || item.quantity)), 0),
      length: order.packageLength || 10,
      breadth: order.packageBreadth || 10,
      height: order.packageHeight || 10,
      weight: order.packageWeight || 0.5,
      order_items: items.map(i => ({
        name: i.name || i.productId || 'Product',
        sku: i.sku || i.productId || `SKU-${Date.now()}`,
        units: i.units || i.quantity || 1,
        selling_price: i.sellingPrice || i.price || 0,
      })),
    };
    
    console.log("Sending payload to ShipRocket:", JSON.stringify(payload, null, 2));

    // Validate required billing/shipping fields
    const requiredFields = {
      billing_address: payload.billing_address,
      billing_city: payload.billing_city,
      billing_state: payload.billing_state,
      billing_pincode: payload.billing_pincode,
      billing_phone: payload.billing_phone,
      billing_country: payload.billing_country,
      shipping_address: payload.shipping_address,
      shipping_city: payload.shipping_city,
      shipping_state: payload.shipping_state,
      shipping_pincode: payload.shipping_pincode,
      shipping_country: payload.shipping_country
    };
    const missingFields = Object.entries(requiredFields)
      .filter(([_, v]) => !v)
      .map(([k]) => k);
    if (missingFields.length) {
      throw new Error(`ShipRocket payload missing required fields: ${missingFields.join(", ")}`);
    }

    try {
      const resp = await axios.post(url, payload, { 
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000 // 10 seconds timeout
      });
      
      console.log("ShipRocket order creation successful, status:", resp.status);
      console.log("ShipRocket order response:", resp.data);
      
      return resp.data;
    } catch (error: unknown) {
      logErrorDetails("SHIPROCKET ORDER CREATION", error);
      throw new Error(`ShipRocket API error: ${handleError(error)}`);
    }
  } catch (error: unknown) {
    // Final catch-all error handler
    logErrorDetails("CREATE SHIPMENT", error);
    throw new Error(`Failed to create ShipRocket order: ${handleError(error)}`);
  }
}

// Cancel a Shipment in Shiprocket
export async function cancelShipment(orderId: string, reason: string = 'Order cancelled'): Promise<any> {
  try {
    const token = await getAuthToken();
    const url = 'https://apiv2.shiprocket.in/v1/external/orders/cancel';
    const payload = { order_id: orderId, cancel_reason: reason };
    const resp = await axios.post(url, payload, {
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
    });
    console.log('Shiprocket cancel response:', resp.data);
    return resp.data;
  } catch (error: unknown) {
    logErrorDetails('SHIPROCKET CANCEL', error);
    throw new Error(`Failed to cancel Shiprocket order: ${handleError(error)}`);
  }
}

// Track a Shipment in Shiprocket
export async function trackShipment(orderId: string): Promise<any> {
  try {
    const token = await getAuthToken();
    const url = `https://apiv2.shiprocket.in/v1/external/orders/show/${orderId}`;
    const resp = await axios.get(url, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Shiprocket tracking info:', resp.data);
    return resp.data;
  } catch (error: unknown) {
    logErrorDetails('SHIPROCKET TRACK', error);
    throw new Error(`Failed to fetch Shiprocket tracking: ${handleError(error)}`);
  }
}