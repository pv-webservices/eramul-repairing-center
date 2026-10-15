export const business = {
  name: 'EKRAMUL ALL REPAIRING SERVICE CENTER',
  email: 'ekramulhaqnoida@gmail.com',
  phone: '+919870371013',
  phoneDisplay: '+91 98703 71013',
  secondary: '+919220491412',
  secondaryDisplay: '+91 92204 91412',
  // WhatsApp uses the primary number. Change here if the business uses a different WhatsApp line.
  whatsapp: '919870371013',
  address: 'Shop No. 3, Gali No. 5, Hoshiyarpur, Noida Sector 51',
  origin: 'https://ekramulallrepairingservicecenter.com',
};
export const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(business.address)}`;
export const whatsappUrl = (message = 'Hello, I would like to enquire about a repair service.') =>
  `https://wa.me/${business.whatsapp}?text=${encodeURIComponent(message)}`;
