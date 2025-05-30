import { getServices } from "@/api/services/servicesApi";
import { useEffect, useState } from "react";
import type { Service, ServiceQueryFilters } from "@/types/Services";
import useAuth from "@/hooks/useAuth";

export default function ServicesPage() {
  
  const [services, setServices] = useState<Service[]>([]);
  const [filters, setFilters] = useState<ServiceQueryFilters>({});
  const [loading, setLoading] = useState<boolean>(true);
  
  const {user} = useAuth();

  useEffect(() => {
    getServices(user.apiKey, filters).then((data) => {
      setServices(data);
      setLoading(false);
    })
  }, []);
  
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 flex items-center justify-center">
      <h1 className="text-2xl font-bold text-gray-800">Pricings Page</h1>
      <p className="text-gray-600 mt-4">This is the pricings page content.</p>
    </div>
  );
}