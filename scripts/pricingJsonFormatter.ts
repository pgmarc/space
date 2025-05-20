import fs from 'fs';
import path from 'path';

// Interfaces para tipado
interface Feature {
  name?: string;
  valueType?: string;
  defaultValue?: any;
  value?: any;
  description?: string;
  type?: string;
  tag?: string;
  render?: string;
  [key: string]: any;
}

interface UsageLimit {
  name?: string;
  value?: any;
  defaultValue?: any;
  trackable?: boolean;
  render?: string;
  [key: string]: any;
}

interface Plan {
  private: boolean;
  features?: Record<string, Feature>;
  usageLimits?: Record<string, UsageLimit>;
  [key: string]: any;
}

interface AddOn {
  name?: string;
  description?: string;
  private?: boolean;
  price?: any;
  availableFor?: string[];
  dependsOn?: string[];
  excludes?: string[];
  features?: Record<string, Feature>;
  usageLimits?: Record<string, any>;
  usageLimitsExtensions?: Record<string, any>;
  subscriptionConstraints?: {
    minQuantity?: number;
    maxQuantity?: number;
    quantityStep?: number;
  };
  [key: string]: any;
}

interface Pricing {
  _id: { $oid: string };
  _serviceName: string;
  version: string;
  currency: string;
  createdAt: string;
  features: Record<string, Feature>;
  usageLimits: Record<string, UsageLimit>;
  plans: Record<string, Plan>;
  addOns: Record<string, AddOn>;
  [key: string]: any;
}

// Ruta del archivo origen y destino
const inputFilePath = path.resolve(__dirname, '../src/main/database/seeders/mongo/pricings/pricings.json');
const outputDir = path.resolve(__dirname, 'output');
const outputFilePath = path.resolve(outputDir, 'transformed_pricings.json');

// Asegurarse de que el directorio output existe
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Función principal para transformar el JSON
function transformPricingJson() {
  try {
    // Leer el archivo JSON
    const data = fs.readFileSync(inputFilePath, 'utf8');
    const pricings: Pricing[] = JSON.parse(data);
    
    // Procesar cada pricing
    const transformedPricings = pricings.map(pricing => transformPricing(pricing));
    
    // Escribir el resultado en un nuevo archivo
    fs.writeFileSync(outputFilePath, JSON.stringify(transformedPricings, null, 2));
    
    console.log(`Archivo generado exitosamente en: ${outputFilePath}`);
    
    // También generar un archivo por servicio
    transformedPricings.forEach(pricing => {
      const serviceFileName = `${pricing._serviceName}.json`;
      const serviceFilePath = path.resolve(outputDir, serviceFileName);
      fs.writeFileSync(serviceFilePath, JSON.stringify(pricing, null, 2));
      console.log(`Archivo específico para ${pricing._serviceName} generado en: ${serviceFilePath}`);
    });
  } catch (error) {
    console.error('Error al procesar el archivo JSON:', error);
  }
}

// Transformar un objeto pricing
function transformPricing(pricing: Pricing): Pricing {
  const result = { ...pricing };
  
  // Transformar features globales
  if (result.features) {
    for (const planName in result.plans){
      const plan = result.plans[planName];
      plan.features = transformFeatures(plan.features!);
    }
  }
  
  // Transformar usageLimits globales
  if (result.usageLimits) {
    for (const planName in result.plans){
      const plan = result.plans[planName];
      plan.usageLimits = transformUsageLimits(plan.usageLimits!);
    }
  }
  
  // Transformar addOns
  if (result.addOns) {
    result.addOns = transformAddOns(result.addOns);
  }
  
  return result;
}

// Transformar features
function transformFeatures(features: Record<string, Feature>): Record<string, any> {
  const transformedFeatures: Record<string, any> = {};
  
  for (const [key, feature] of Object.entries(features)) {
    // Usar el valor o el valor por defecto
    transformedFeatures[key] = feature.value !== undefined ? feature.value : (feature.defaultValue !== undefined ? feature.defaultValue : null);
  }
  
  return transformedFeatures;
}

// Transformar usageLimits
function transformUsageLimits(usageLimits: Record<string, UsageLimit>): Record<string, any> {
  const transformedUsageLimits: Record<string, any> = {};
  
  for (const [key, limit] of Object.entries(usageLimits)) {
    // Usar el valor o el valor por defecto
    transformedUsageLimits[key] = limit.value !== undefined ? limit.value : (limit.defaultValue !== undefined ? limit.defaultValue : null);
  }
  
  return transformedUsageLimits;
}

// Transformar addOns
function transformAddOns(addOns: Record<string, AddOn>): Record<string, AddOn> {
  const transformedAddOns: Record<string, AddOn> = {};
  
  for (const [key, addOn] of Object.entries(addOns)) {
    const transformedAddOn = { ...addOn };
    
    // Transformar features de addOns si existen
    if (transformedAddOn.features) {
      const features: Record<string, any> = {};
      for (const [featureKey, feature] of Object.entries(transformedAddOn.features)) {
        features[featureKey] = feature.value;
      }
      transformedAddOn.features = features;
    }
    
    // Transformar usageLimits de addOns si existen
    if (transformedAddOn.usageLimits) {
      const limits: Record<string, any> = {};
      for (const [limitKey, limit] of Object.entries(transformedAddOn.usageLimits)) {
        limits[limitKey] = limit.value;
      }
      transformedAddOn.usageLimits = limits;
    }
    
    // Transformar usageLimitsExtensions de addOns si existen
    if (transformedAddOn.usageLimitsExtensions) {
      const extensions: Record<string, any> = {};
      for (const [extKey, ext] of Object.entries(transformedAddOn.usageLimitsExtensions)) {
        extensions[extKey] = ext.value;
      }
      transformedAddOn.usageLimitsExtensions = extensions;
    }
    
    transformedAddOns[key] = transformedAddOn;
  }
  
  return transformedAddOns;
}

// Ejecutar la función principal
transformPricingJson();