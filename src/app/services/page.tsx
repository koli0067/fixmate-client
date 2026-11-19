import ServicesClient from "@/components/services/ServicesClient";

// Search params and the live services fetch need a blocking render.
export const instant = false;



export type ServiceItem = {
  _id: string;
  title: string;
  category: string;
  description: string;
  image: string;
  basePrice: number;
  estimatedDuration: string;
  serviceMode: string;
  serviceArea?: string;
  technicianName?: string;
  approvalStatus?: string;
  isAvailable?: boolean;
};

type ServicesPageProps = {
  searchParams: Promise<{
    search?: string;
    category?: string;
    serviceMode?: string;
    sort?: string;
  }>;
};

export default async function ServicesPage({ searchParams }: ServicesPageProps) {
  const params = await searchParams;

  const query = new URLSearchParams();
  if (params.search) query.set("search", params.search);
  if (params.category && params.category !== "All") {
    query.set("category", params.category);
  }
  if (params.serviceMode && params.serviceMode !== "All") {
    query.set("serviceMode", params.serviceMode);
  }
  if (params.sort) query.set("sort", params.sort);

  let services: ServiceItem[] = [];

  try {
    const baseUrl =
      process.env.NEXT_PUBLIC_SERVER_BASE_URL || "http://localhost:5000";
    const url = `${baseUrl}/services${
      query.toString() ? `?${query.toString()}` : ""
    }`;

    const res = await fetch(url, { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      services = Array.isArray(data) ? data : data.services || [];
    }
  } catch (error) {
    console.error("Error loading services:", error);
  }

  return (
    <ServicesClient
      initialServices={services}
      initialFilters={{
        search: params.search || "",
        category: params.category || "All",
        serviceMode: params.serviceMode || "All",
        sort: params.sort || "newest",
      }}
    />
  );
}