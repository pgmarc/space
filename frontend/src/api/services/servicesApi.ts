import axios from "@/lib/axios";
import type { Pricing, RetrievedService, Service } from "@/types/Services";

export async function getServices(apiKey:string, filters: Record<string, boolean | number | string> = {}) {
  return axios.get('/services', {
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
    },
    params: filters,
  }).then(async (response) => {
    return await Promise.all(response.data.map(async (service: RetrievedService) => {
      return await _retrievePricingsFromService(apiKey, service.name);
    }));
  }).catch(error => {
    console.error("Error fetching services:", error);
    throw new Error("Failed to fetch services. Please try again later.");
  });
}

export async function getPricingsFromService(apiKey: string, serviceName: string, pricingStatus: "active" | "archived" = "active"): Promise<Pricing[]> {
  return axios.get(`/services/${serviceName}/pricings?pricingStatus=${pricingStatus}`, {
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
    },
  }).then(response => {
    return response.data;
  }).catch(() => {
    throw new Error(`Failed to retrieve pricings for service ${serviceName}. Please try again later.`);
  });
}

async function _retrievePricingsFromService(apiKey: string, serviceName: string): Promise<Service> {
  const [serviceActivePricings, serviceArchivedPricings] = await Promise.all([
    getPricingsFromService(apiKey, serviceName, "active"),
    getPricingsFromService(apiKey, serviceName, "archived"),
  ]);

  const mapPricings = (pricings: Pricing[]) =>
    pricings.reduce((acc: Record<string, Pricing>, pricing) => {
      acc[pricing.version] = pricing;
      return acc;
    }, {});

  return {
    name: serviceName,
    activePricings: mapPricings(serviceActivePricings),
    archivedPricings: mapPricings(serviceArchivedPricings),
  };
}