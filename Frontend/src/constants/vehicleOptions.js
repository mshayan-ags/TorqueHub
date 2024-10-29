// Static curated make/model list rather than a new backend taxonomy — the
// storefront already loads the full product catalog client-side, so vehicle
// fitment only needs to filter that list, not drive a server-side query.
export const VEHICLE_MAKES = {
  Honda: ["Civic", "Accord", "CR-V", "Pilot", "Fit"],
  Toyota: ["Corolla", "Camry", "RAV4", "Highlander", "Tacoma"],
  Ford: ["F-150", "Focus", "Escape", "Explorer", "Mustang"],
  Chevrolet: ["Silverado", "Malibu", "Equinox", "Tahoe", "Camaro"],
  Nissan: ["Altima", "Sentra", "Rogue", "Pathfinder", "Frontier"],
  BMW: ["3 Series", "5 Series", "X3", "X5"],
  "Mercedes-Benz": ["C-Class", "E-Class", "GLC", "GLE"],
  Volkswagen: ["Jetta", "Passat", "Tiguan", "Atlas"],
  Hyundai: ["Elantra", "Sonata", "Tucson", "Santa Fe"],
  Jeep: ["Wrangler", "Grand Cherokee", "Cherokee", "Compass"],
};

export const VEHICLE_MAKE_NAMES = Object.keys(VEHICLE_MAKES);

export function getModelsForMake(make) {
  return VEHICLE_MAKES[make] || [];
}

const CURRENT_YEAR = new Date().getFullYear();
export const VEHICLE_YEARS = Array.from({ length: 30 }, (_, i) => CURRENT_YEAR + 1 - i);
