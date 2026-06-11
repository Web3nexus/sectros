import { useBusinessConfig } from './useBusinessConfig';

export function useBusinessLabels() {
  const config = useBusinessConfig();
  
  // Map the new config structure back to the old label format for compatibility
  return {
    ...config.labels,
    // Add any missing ones that were in the old file but might be handled differently now
    menuDescription: config.type === 'salon' ? 'List your beauty treatments and service pricing.' : 
                     config.type === 'hotel' ? 'Define your room categories and nightly rates.' : 
                     'Organize your offerings and pricing.',
    reservationsDescription: config.type === 'salon' ? 'Manage your client appointments and schedules.' :
                             config.type === 'hotel' ? 'Manage guest check-ins and stay durations.' :
                             'Manage your bookings and guest requests.',
    floorPlanDescription: config.type === 'salon' ? 'Monitor your salon stations.' :
                          config.type === 'hotel' ? 'Monitor room occupancy and cleaning status.' :
                          'Design and monitor your seating arrangement.',
    staffDescription: config.type === 'salon' ? 'Manage your stylists and therapists.' :
                      config.type === 'hotel' ? 'Manage housekeeping and front desk teams.' :
                      'Manage your team profiles and access permissions.'
  };
}
