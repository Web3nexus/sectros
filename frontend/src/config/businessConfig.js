export const businessConfig = {
  restaurant: {
    labels: {
      sidebar: "Restaurant",
      reservations: "Reservations",
      menu: "Menu Builder",
      floorPlan: "Floor Plan",
      pos: "POS Terminal",
      onlineOrdering: "Online Ordering",
      inventory: "Inventory Tracking",
      insights: "Insights",
      calendar: "Calendar",
      staff: "Staff Profiles",
      branches: "Branches",
      financials: "Financials",
      configuration: "Configuration",
      customers: "Customers",
      category: "Category",
      categories: "Categories",
      item: "Menu Item",
      items: "Menu Items",
      reviews: "Reviews",
      gallery: "Gallery",
      blog: "Blog Page",
      team: "Team Members",
      franchises: "Franchise Tools",
      waitlist: "Waitlist Pro",
      integrations: "Public API"
    },
    icons: {
      insights: "LayoutDashboard",
      calendar: "Calendar",
      reservations: "BookOpen",
      messages: "MessageSquare",
      pos: "Component",
      menu: "Utensils",
      website: "Globe",
      tables: "Table",
      staff: "Users",
      branches: "Store",
      franchises: "Users",
      waitlist: "Clock",
      integrations: "Key",
      financials: "DollarSign",
      billing: "CreditCard",
      automation: "Bot",
      online_ordering: "ShoppingBag",
      inventory: "Package",
      settings: "Settings",
      orders: "ShoppingBag",
      reviews: "Briefcase",
      gallery: "Image",
      blog: "BookOpen",
      team: "Users"
    },
    features: [
      'reservations', 'menu', 'floor_plan', 'pos', 'online_ordering', 
      'inventory', 'kds', 'delivery', 'loyalty', 'reviews', 'orders', 'table_management'
    ],
    bookingForm: {
      title: "Table Reservation",
      fields: [
        { name: 'name', label: 'Customer Name', type: 'text', required: true },
        { name: 'phone', label: 'Phone', type: 'tel', required: true },
        { name: 'email', label: 'Email', type: 'email', required: true },
        { name: 'date', label: 'Reservation Date', type: 'date', required: true },
        { name: 'time', label: 'Reservation Time', type: 'time', required: true },
        { name: 'guests', label: 'Number of Guests', type: 'number', required: true },
        { name: 'seating', label: 'Seating Preference', type: 'select', options: ['Indoor', 'Outdoor', 'Window', 'Bar'] },
        { name: 'notes', label: 'Dietary Notes/Allergies', type: 'textarea' },
        { name: 'special_request', label: 'Special Request', type: 'textarea' }
      ]
    },
    aiCommands: [
      { id: 'generate_menu_desc', label: "Generate menu item descriptions" },
      { id: 'create_food_promo', label: "Create food promotions" },
      { id: 'suggest_combos', label: "Suggest meal combos" },
      { id: 'write_res_replies', label: "Write reservation replies" },
      { id: 'write_delivery_msg', label: "Write delivery or pickup messages" },
      { id: 'create_dish_social', label: "Create dish social media posts" },
      { id: 'respond_reviews', label: "Respond to restaurant reviews" }
    ],
    websiteSections: ['menu', 'reservations', 'ordering', 'hours', 'location', 'gallery', 'reviews', 'contact'],
    insights: ['total_sales', 'orders', 'reservations', 'popular_dishes', 'table_occupancy', 'average_order_value', 'customer_reviews', 'inventory_usage'],
    configuration: [
      'table_settings', 'menu_settings', 'reservation_rules', 'order_settings', 'delivery_settings', 'pickup_settings', 'tax_and_service_charge', 'staff_roles', 'notification_settings'
    ],
    sidebar: [
      'insights', 'calendar', 'reservations', 'messages', 'pos', 'menu', 'website', 'branches', 'franchises', 'waitlist', 'integrations', 'tables', 'staff', 'financials', 'billing', 'automation', 'online_ordering', 'inventory', 'reviews', 'gallery', 'blog', 'team', 'settings'
    ],
    kpis: [
      { id: 'total_revenue', label: 'Total Revenue', icon: 'DollarSign' },
      { id: 'active_reservations', label: 'Reservations', icon: 'Calendar' },
      { id: 'waitlist_count', label: 'Waitlist', icon: 'Users' },
      { id: 'aov', label: 'Avg. Check', icon: 'Activity' }
    ]
  },
  cafe: {
    labels: {
      sidebar: "Cafe",
      reservations: "Orders / Reservations",
      menu: "Menu Builder",
      floorPlan: "Floor Plan",
      pos: "POS Terminal",
      onlineOrdering: "Online Ordering / Pickup",
      inventory: "Inventory Tracking",
      insights: "Insights",
      calendar: "Calendar",
      staff: "Staff Profiles",
      branches: "Branches",
      financials: "Financials",
      configuration: "Configuration",
      customers: "Customers",
      category: "Category",
      categories: "Categories",
      item: "Menu Item",
      items: "Menu Items",
      reviews: "Reviews",
      gallery: "Gallery",
      blog: "Blog Page",
      team: "Team Members",
      franchises: "Franchise Tools",
      waitlist: "Waitlist Pro",
      integrations: "Public API"
    },
    icons: {
      insights: "LayoutDashboard",
      calendar: "Calendar",
      reservations: "Coffee",
      messages: "MessageSquare",
      pos: "Component",
      menu: "Utensils",
      website: "Globe",
      tables: "Table",
      staff: "Users",
      branches: "Store",
      franchises: "Users",
      waitlist: "Clock",
      integrations: "Key",
      financials: "DollarSign",
      billing: "CreditCard",
      automation: "Bot",
      online_ordering: "ShoppingBag",
      inventory: "Package",
      settings: "Settings",
      orders: "ShoppingBag",
      reviews: "Briefcase",
      gallery: "Image",
      blog: "BookOpen",
      team: "Users"
    },
    features: [
      'reservations', 'menu', 'pos', 'online_ordering', 
      'inventory', 'loyalty', 'pickup_orders', 'daily_specials', 'reviews'
    ],
    bookingForm: {
      title: "Cafe Booking / Order",
      fields: [
        { name: 'name', label: 'Customer Name', type: 'text', required: true },
        { name: 'phone', label: 'Phone', type: 'tel', required: true },
        { name: 'email', label: 'Email', type: 'email', required: true },
        { name: 'type', label: 'Type', type: 'select', options: ['Reservation', 'Pickup Order'], required: true },
        { name: 'date', label: 'Date', type: 'date', required: true },
        { name: 'time', label: 'Time', type: 'time', required: true },
        { name: 'guests', label: 'Number of Guests', type: 'number' },
        { name: 'items', label: 'Menu Items (for Pickup)', type: 'textarea' },
        { name: 'notes', label: 'Special Request', type: 'textarea' }
      ]
    },
    aiCommands: [
      { id: 'generate_drink_desc', label: "Generate coffee/drink descriptions" },
      { id: 'suggest_seasonal', label: "Suggest seasonal drinks" },
      { id: 'create_pastry_combos', label: "Create pastry and drink combos" },
      { id: 'write_cafe_promo', label: "Write cafe promotions" },
      { id: 'create_loyalty_ideas', label: "Create loyalty campaign ideas" },
      { id: 'write_pickup_msg', label: "Write pickup order messages" },
      { id: 'respond_cafe_reviews', label: "Respond to cafe reviews" }
    ],
    websiteSections: ['menu', 'ordering', 'specials', 'loyalty', 'hours', 'location', 'gallery', 'contact'],
    insights: ['total_sales', 'popular_drinks', 'peak_hours', 'pickup_orders', 'daily_specials_performance', 'loyalty_usage', 'inventory_usage'],
    configuration: [
      'menu_settings', 'pickup_settings', 'reservation_settings', 'loyalty_settings', 'stock_settings', 'tax_settings', 'staff_roles', 'notification_settings'
    ],
    sidebar: [
      'insights', 'calendar', 'reservations', 'messages', 'pos', 'menu', 'website', 'branches', 'franchises', 'waitlist', 'integrations', 'staff', 'financials', 'billing', 'automation', 'online_ordering', 'inventory', 'reviews', 'gallery', 'blog', 'team', 'settings'
    ],
    kpis: [
      { id: 'total_revenue', label: 'Total Sales', icon: 'DollarSign' },
      { id: 'active_reservations', label: 'Orders', icon: 'ShoppingBag' },
      { id: 'waitlist_count', label: 'Waitlist', icon: 'Users' },
      { id: 'aov', label: 'Avg. Check', icon: 'BarChart2' }
    ]
  },
  salon: {
    labels: {
      sidebar: "Salon",
      reservations: "Appointments",
      menu: "Services Builder",
      floorPlan: null,
      pos: "POS Terminal",
      onlineOrdering: "Product Sales",
      inventory: "Inventory Tracking",
      insights: "Insights",
      calendar: "Calendar",
      staff: "Staff Profiles",
      branches: "Branches",
      financials: "Financials",
      configuration: "Configuration",
      customers: "Clients",
      category: "Service Category",
      categories: "Service Categories",
      item: "Service",
      items: "Services",
      reviews: "Reviews",
      gallery: "Gallery",
      blog: "Blog Page",
      team: "Team Members",
      franchises: "Franchise Tools",
      waitlist: "Waitlist Pro",
      integrations: "Public API",
      services: "Services Management"
    },
    icons: {
      insights: "LayoutDashboard",
      calendar: "Calendar",
      reservations: "Scissors",
      messages: "MessageSquare",
      pos: "Component",
      menu: "Briefcase",
      website: "Globe",
      staff: "Users",
      branches: "Store",
      franchises: "Users",
      waitlist: "Clock",
      integrations: "Key",
      financials: "DollarSign",
      billing: "CreditCard",
      automation: "Bot",
      online_ordering: "ShoppingBag",
      inventory: "Package",
      settings: "Settings",
      reviews: "Briefcase",
      gallery: "Image",
      blog: "BookOpen",
      team: "Users",
      services: "Scissors"
    },
    features: [
      'appointments', 'services', 'pos', 'inventory', 'client_profiles', 
      'service_categories', 'stylists', 'packages', 'memberships', 'product_sales'
    ],
    bookingForm: {
      title: "Book Appointment",
      fields: [
        { name: 'name', label: 'Client Name', type: 'text', required: true },
        { name: 'phone', label: 'Phone', type: 'tel', required: true },
        { name: 'email', label: 'Email', type: 'email', required: true },
        { name: 'category', label: 'Service Category', type: 'select', required: true },
        { name: 'service', label: 'Selected Service', type: 'select', required: true },
        { name: 'stylist', label: 'Preferred Stylist', type: 'select' },
        { name: 'date', label: 'Appointment Date', type: 'date', required: true },
        { name: 'time', label: 'Appointment Time', type: 'time', required: true },
        { name: 'first_time', label: 'First-time client?', type: 'checkbox' },
        { name: 'notes', label: 'Special Requests', type: 'textarea' }
      ]
    },
    aiCommands: [
      { id: 'generate_service_desc', label: "Generate service descriptions" },
      { id: 'suggest_beauty_pkgs', label: "Suggest beauty packages" },
      { id: 'write_app_reminders', label: "Write appointment reminders" },
      { id: 'create_salon_promo', label: "Create salon promotions" },
      { id: 'write_client_followup', label: "Write client follow-up messages" },
      { id: 'generate_stylist_bios', label: "Generate stylist bios" },
      { id: 'write_cancel_msg', label: "Write cancellation/rescheduling messages" }
    ],
    websiteSections: ['services', 'appointments', 'staff', 'gallery', 'pricing', 'packages', 'reviews', 'contact'],
    insights: ['appointments', 'popular_services', 'staff_performance', 'repeat_clients', 'product_sales', 'cancellation_rate', 'revenue_by_service'],
    configuration: [
      'appointment_settings', 'staff_availability', 'service_duration', 'service_pricing', 'booking_rules', 'cancellation_rules', 'client_reminder_settings', 'product_sales_settings', 'staff_roles', 'notification_settings'
    ],
    sidebar: [
      'insights', 'calendar', 'reservations', 'messages', 'pos', 'menu', 'website', 'branches', 'franchises', 'waitlist', 'integrations', 'staff', 'financials', 'billing', 'automation', 'inventory', 'services', 'reviews', 'gallery', 'blog', 'team', 'settings'
    ],
    kpis: [
      { id: 'total_revenue', label: 'Service Revenue', icon: 'DollarSign' },
      { id: 'active_reservations', label: 'Appointments', icon: 'Calendar' },
      { id: 'waitlist_count', label: 'Waitlist', icon: 'Users' },
      { id: 'aov', label: 'Avg. Value', icon: 'Activity' }
    ]
  },
  hotel: {
    labels: {
      sidebar: "Hotel",
      reservations: "Bookings",
      menu: "Rooms Management",
      floorPlan: "Room Layout",
      pos: "POS Terminal",
      onlineOrdering: "Room Booking",
      inventory: "Inventory Tracking",
      insights: "Insights",
      calendar: "Calendar",
      staff: "Staff Profiles",
      branches: "Branches",
      financials: "Financials",
      configuration: "Configuration",
      customers: "Guests",
      category: "Room Category",
      categories: "Room Categories",
      item: "Room",
      items: "Rooms",
      reviews: "Reviews",
      gallery: "Gallery",
      blog: "Blog Page",
      team: "Team Members",
      franchises: "Franchise Tools",
      waitlist: "Waitlist Pro",
      integrations: "Public API",
      rooms: "Rooms Management"
    },
    icons: {
      insights: "LayoutDashboard",
      calendar: "Calendar",
      reservations: "BedDouble",
      messages: "MessageSquare",
      pos: "Component",
      menu: "Hotel",
      website: "Globe",
      tables: "Map",
      staff: "Users",
      branches: "Store",
      franchises: "Users",
      waitlist: "Clock",
      integrations: "Key",
      financials: "DollarSign",
      billing: "CreditCard",
      automation: "Bot",
      online_ordering: "ShoppingBag",
      inventory: "Package",
      settings: "Settings",
      reviews: "Briefcase",
      gallery: "Image",
      blog: "BookOpen",
      team: "Users",
      rooms: "BedDouble"
    },
    features: [
      'bookings', 'rooms', 'housekeeping', 'maintenance', 'guests', 
      'pos', 'room_layout', 'addons', 'reviews'
    ],
    bookingForm: {
      title: "Room Reservation",
      fields: [
        { name: 'name', label: 'Guest Name', type: 'text', required: true },
        { name: 'phone', label: 'Phone', type: 'tel', required: true },
        { name: 'email', label: 'Email', type: 'email', required: true },
        { name: 'check_in', label: 'Check-in Date', type: 'date', required: true },
        { name: 'check_out', label: 'Check-out Date', type: 'date', required: true },
        { name: 'adults', label: 'Adults', type: 'number', required: true },
        { name: 'children', label: 'Children', type: 'number' },
        { name: 'room_type', label: 'Room Type', type: 'select', required: true },
        { name: 'rooms', label: 'Number of Rooms', type: 'number', required: true },
        { name: 'arrival_time', label: 'Estimated Arrival Time', type: 'time' },
        { name: 'notes', label: 'Special Requests', type: 'textarea' }
      ]
    },
    aiCommands: [
      { id: 'generate_room_desc', label: "Generate room descriptions" },
      { id: 'write_welcome_msg', label: "Write guest welcome messages" },
      { id: 'create_hotel_offers', label: "Create hotel offers" },
      { id: 'suggest_room_pkgs', label: "Suggest room packages" },
      { id: 'write_booking_confirm', label: "Write booking confirmation messages" },
      { id: 'write_prearrival_msg', label: "Write pre-arrival guest messages" },
      { id: 'respond_hotel_reviews', label: "Respond to hotel reviews" },
      { id: 'create_hk_notes', label: "Create housekeeping/maintenance notes" }
    ],
    websiteSections: ['rooms', 'booking', 'amenities', 'gallery', 'location', 'reviews', 'offers', 'contact'],
    insights: ['room_occupancy', 'bookings', 'revenue', 'check_ins_outs', 'adr', 'revpar', 'guest_reviews', 'housekeeping_status'],
    configuration: [
      'room_settings', 'booking_rules', 'check_in_out_time', 'cancellation_policy', 'room_pricing', 'tax_and_fees', 'housekeeping_settings', 'maintenance_settings', 'staff_roles', 'notification_settings'
    ],
    sidebar: [
      'insights', 'calendar', 'reservations', 'messages', 'branches', 'franchises', 'waitlist', 'integrations', 'menu', 'website', 'tables', 'staff', 'financials', 'billing', 'automation', 'inventory', 'reviews', 'gallery', 'blog', 'team', 'settings'
    ],
    kpis: [
      { id: 'total_revenue', label: 'Booking Revenue', icon: 'DollarSign' },
      { id: 'active_reservations', label: 'Active Bookings', icon: 'Calendar' },
      { id: 'upcoming_checkouts', label: 'Checkouts Today', icon: 'LayoutGrid' },
      { id: 'aov', label: 'ADR', icon: 'TrendingUp' }
    ]
  }
};
