export const FALLBACK_BLUEPRINTS = [
  {
    id: 'blueprint-tastenest-dark',
    name: 'TasteNest Elite',
    category: 'restaurant',
    preview: '/images/previews/blueprint_noir_elite_1776173730045.png',
    theme: { primaryColor: '#F70A38', secondaryColor: '#FFC806', fontFamily: 'Outfit' },
    sections: [
      { id: 'nav-1', type: 'Navbar', content: { layout: 'tastenest-dark', logo: '{{restaurant_name}}', buttonText: 'Book Table', phone: '{{business_phone}}' }, visible: true },
      { 
        id: 'hero-1', type: 'Hero', 
        content: { 
          layout: 'tastenest-dark',
          title: 'The Perfect Space to Enjoy Fantastic Food', 
          subtitle: 'Festive dining at {{restaurant_name}} where we are strong believers in using the very best produce.', 
          imageUrl: 'https://images.unsplash.com/photo-1544025162-8350dbde4ed5?auto=format&fit=crop&q=80&w=1200',
          buttonText: 'See Our Menus',
          highlightCard: { title: 'Sicilian Pizza', price: '$20.85', label: 'Weekly Special', image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591' }
        }, visible: true 
      },
      { id: 'abt-1', type: 'About', content: { layout: 'tastenest-dark', title: 'Our Culinary Journey', subtitle: 'A legacy of flavor and passion for fine dining.', description: 'Founded in 2024, {{restaurant_name}} has become a sanctuary for food lovers. We source only the freshest ingredients from local farmers.' }, visible: true },
      { id: 'menu-1', type: 'Menu', content: { layout: 'tastenest-dark', title: 'Signature Dishes' }, visible: true },
      { id: 'test-1', type: 'Testimonials', content: { layout: 'tastenest-dark', title: 'What Our Guests Say' }, visible: true },
      { id: 'res-1', type: 'ReservationForm', content: { layout: 'tastenest-dark', title: 'Reserve a Table', subtitle: 'Join us for an unforgettable dining experience.' }, visible: true },
      { id: 'foot-1', type: 'Footer', content: { layout: 'tastenest-dark', title: '{{restaurant_name}}', subtitle: '{{business_address}}', phone: '{{business_phone}}' }, visible: true }
    ]
  },
  {
    id: 'blueprint-tastenest-light',
    name: 'TasteNest Classic',
    category: 'restaurant',
    preview: '/images/previews/blueprint_skyline_lounge_1776173969922.png',
    theme: { primaryColor: '#F70A38', secondaryColor: '#FFC806', fontFamily: 'Outfit' },
    sections: [
      { id: 'nav-1', type: 'Navbar', content: { layout: 'tastenest-light', logo: '{{restaurant_name}}', buttonText: 'Book Now', phone: '{{business_phone}}' }, visible: true },
      { 
        id: 'hero-1', type: 'Hero', 
        content: { 
          layout: 'tastenest-light',
          title: 'Best Food for Best People', 
          subtitle: 'Experience the finest dining at {{restaurant_name}} with our curated seasonal menu.', 
          imageUrl: 'https://images.unsplash.com/photo-1544025162-8350dbde4ed5',
          buttonText: 'Reserve Table'
        }, visible: true 
      },
      { id: 'abt-1', type: 'About', content: { layout: 'tastenest-light', title: 'Discover Our Story', subtitle: 'From Farm to Table', description: 'We believe in the power of good food to bring people together. Every dish is a masterpiece of seasonal flavors.' }, visible: true },
      { id: 'menu-1', type: 'Menu', content: { layout: 'tastenest-light', title: 'Main Course' }, visible: true },
      { id: 'test-1', type: 'Testimonials', content: { layout: 'tastenest-light', title: 'Guest Reviews' }, visible: true },
      { id: 'res-1', type: 'ReservationForm', content: { layout: 'tastenest-light', title: 'Schedule Your Visit', subtitle: 'Select your preferred time and date.' }, visible: true },
      { id: 'foot-1', type: 'Footer', content: { layout: 'tastenest-light', title: '{{restaurant_name}}', subtitle: '{{business_address}}' }, visible: true }
    ]
  },
  {
    id: 'blueprint-coffee-house',
    name: 'Coffee House Elite',
    category: 'cafe',
    preview: '/images/previews/blueprint_velvet_bean_deluxe_1776173929017.png',
    theme: { primaryColor: '#A58B6D', secondaryColor: '#1F1A17', fontFamily: 'Playfair Display' },
    sections: [
      { id: 'nav-1', type: 'Navbar', content: { layout: 'coffee-house', logo: '{{restaurant_name}}', buttonText: 'Get A Cup' }, visible: true },
      { 
        id: 'hero-1', type: 'Hero', 
        content: { 
          layout: 'coffee-house',
          title: '{{restaurant_name}}', 
          subtitle: 'Awaken your senses with the finest roasted beans at {{restaurant_name}}.', 
          imageUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=80&w=1200',
          buttonText: 'Order Now'
        }, visible: true 
      },
      { id: 'abt-1', type: 'About', content: { layout: 'tastenest-dark', title: 'Crafted with Love', subtitle: 'The Art of Coffee', description: 'Our beans are ethically sourced and roasted to perfection in-house to ensure every cup is a moment of pure bliss.' }, visible: true },
      { id: 'menu-1', type: 'Menu', content: { layout: 'coffee-house', title: 'Our Special Brews' }, visible: true },
      { id: 'test-1', type: 'Testimonials', content: { layout: 'tastenest-dark', title: 'Community Love' }, visible: true },
      { id: 'foot-1', type: 'Footer', content: { layout: 'coffee-house', title: '{{restaurant_name}}', phone: '{{business_phone}}' }, visible: true }
    ]
  },
  {
    id: 'blueprint-salon-vogue',
    name: 'Salon Vogue',
    category: 'salon',
    preview: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=1200',
    theme: { primaryColor: '#C49F7B', secondaryColor: '#1A1A1A', fontFamily: 'Raleway' },
    sections: [
      { id: 'nav-1', type: 'Navbar', content: { layout: 'salon-elegance', logo: '{{restaurant_name}}', buttonText: 'Book Now' }, visible: true },
      { 
        id: 'hero-1', type: 'Hero', 
        content: { 
          layout: 'salon-elegance',
          title: 'Unveil Your Inner Radiance', 
          subtitle: 'Premium styling and beauty services tailored to your unique beauty at {{restaurant_name}}.', 
          imageUrl: 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&q=80&w=1200',
          buttonText: 'Book Now'
        }, visible: true 
      },
      { id: 'abt-1', type: 'About', content: { layout: 'salon-elegance', title: 'Our Philosophy', subtitle: 'Elegance & Care', description: 'At {{restaurant_name}}, we believe beauty is about feeling confident in your own skin. Our experts are here to pamper you.' }, visible: true },
      { id: 'serv-1', type: 'Services', content: { layout: 'salon-elegance', title: 'Beauty Treatments', subtitle: 'Indulge in our range of premium salon services.' }, visible: true },
      { id: 'test-1', type: 'Testimonials', content: { layout: 'salon-elegance', title: 'Happy Clients' }, visible: true },
      { id: 'res-1', type: 'ReservationForm', content: { layout: 'salon-elegance', title: 'Schedule Your Visit', subtitle: 'Select your preferred stylist and date.' }, visible: true },
      { id: 'foot-1', type: 'Footer', content: { layout: 'salon-elegance', title: '{{restaurant_name}}' }, visible: true }
    ]
  },
  {
    id: 'blueprint-hotel-grand',
    name: 'Grand Horizon Hospitality',
    category: 'hotel',
    preview: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=1200',
    theme: { primaryColor: '#2C3E50', secondaryColor: '#BDC3C7', fontFamily: 'Playfair Display' },
    sections: [
      { id: 'nav-1', type: 'Navbar', content: { layout: 'hotel-boutique', logo: '{{restaurant_name}}', buttonText: 'Reserve Room' }, visible: true },
      { 
        id: 'hero-1', type: 'Hero', 
        content: { 
          layout: 'hotel-boutique',
          title: 'Your Sanctuary Awaits', 
          subtitle: 'Luxury accommodations and unparalleled service at {{restaurant_name}}.', 
          imageUrl: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&q=80&w=1200',
          buttonText: 'Explore Rooms'
        }, visible: true 
      },
      { id: 'abt-1', type: 'About', content: { layout: 'hotel-boutique', title: 'Modern Luxury', subtitle: 'A World of Comfort', description: 'Experience the pinnacle of hospitality at {{restaurant_name}}. From our panoramic suites to world-class dining.' }, visible: true },
      { id: 'serv-1', type: 'Services', content: { layout: 'hotel-boutique', title: 'Available Suites', subtitle: 'Choose from our range of luxury rooms.' }, visible: true },
      { id: 'test-1', type: 'Testimonials', content: { layout: 'hotel-boutique', title: 'Guest Stories' }, visible: true },
      { id: 'foot-1', type: 'Footer', content: { layout: 'hotel-boutique', title: '{{restaurant_name}}' }, visible: true }
    ]
  },
  {
    id: 'blueprint-salon-elegance',
    name: 'Salon Elegance',
    category: 'salon',
    preview: 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&q=80&w=600',
    theme: { primaryColor: '#8B0000', secondaryColor: '#F3DDCF', fontFamily: 'Playfair Display' },
    sections: [
      { id: 'nav-1', type: 'Navbar', content: { layout: 'salon-elegance', logo: '{{restaurant_name}}', buttonText: 'Book Now', phone: '{{business_phone}}' }, visible: true },
      { 
        id: 'hero-1', type: 'Hero', 
        content: { 
          layout: 'salon-elegance',
          title: 'We can create what you imagine', 
          subtitle: 'Welcome to your premium beauty experience. Discover modern treatments tailored just for you.', 
          imageUrl: 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&q=80&w=1200',
          buttonText: 'Discover Services',
          categories: ['Makeup', 'Hair Styling', 'Nail Care', 'Cosmetology']
        }, visible: true 
      },
      { id: 'abt-1', type: 'About', content: { layout: 'salon-elegance', title: 'The Beauty Hub', subtitle: 'Excellence in Hair & Beauty', description: 'Our team of award-winning stylists is dedicated to providing you with the best experience.' }, visible: true },
      { id: 'serv-1', type: 'Services', content: { layout: 'salon-elegance', title: 'Services & Prices', subtitle: 'Enhance your natural beauty with our exclusive treatments.' }, visible: true },
      { id: 'test-1', type: 'Testimonials', content: { layout: 'salon-elegance', title: 'Client Reviews' }, visible: true },
      { id: 'res-1', type: 'ReservationForm', content: { layout: 'salon-elegance', title: 'Book an Appointment', subtitle: 'Select your service and preferred date.' }, visible: true },
      { id: 'foot-1', type: 'Footer', content: { layout: 'salon-elegance', title: '{{restaurant_name}}', subtitle: 'Your trusted destination for beauty and care.', phone: '{{business_phone}}' }, visible: true }
    ]
  },
  {
    id: 'blueprint-hotel-boutique',
    name: 'Boutique Haven',
    category: 'hotel',
    preview: 'https://images.unsplash.com/photo-1542314831-c6a4d14d8373?auto=format&fit=crop&q=80&w=1200',
    theme: { primaryColor: '#7C6A43', secondaryColor: '#EFE7DA', fontFamily: 'Playfair Display' },
    sections: [
      { id: 'nav-1', type: 'Navbar', content: { layout: 'hotel-boutique', logo: '{{restaurant_name}}', buttonText: 'Book Now' }, visible: true },
      { 
        id: 'hero-1', type: 'Hero', 
        content: { 
          layout: 'hotel-boutique',
          title: 'Hotel for every moment rich in emotion', 
          subtitle: 'Experience warm boutique luxury with cozy room photography and earthy accents.', 
          imageUrl: 'https://images.unsplash.com/photo-1542314831-c6a4d14d8373?auto=format&fit=crop&q=80&w=1200',
          buttonText: 'Explore',
          buttonTextPrimary: 'Book Now'
        }, visible: true 
      },
      { id: 'abt-1', type: 'About', content: { layout: 'hotel-boutique', title: 'Quiet Luxury', subtitle: 'Your Home Away From Home', description: 'Nestled in the heart of the city, {{restaurant_name}} offers a unique blend of comfort and style.' }, visible: true },
      { id: 'serv-1', type: 'Services', content: { layout: 'hotel-boutique', title: 'Featured Rooms', subtitle: 'Discover our elegant accommodations' }, visible: true },
      { id: 'test-1', type: 'Testimonials', content: { layout: 'hotel-boutique', title: 'Guest Experiences' }, visible: true },
      { id: 'foot-1', type: 'Footer', content: { layout: 'hotel-boutique', title: '{{restaurant_name}}', subtitle: 'Warm boutique luxury.' }, visible: true }
    ]
  }
];
