// Central configuration for OpenAI image generation.
// The API key is read only from process.env.OPENAI_API_KEY at run time (server-side Node script).
// Change models, quality levels or sizes here without touching the generator.

export const imageConfig = {
  endpoint: 'https://api.openai.com/v1/images/generations',
  models: {
    flare: process.env.IMAGE_MODEL_FLARE || 'gpt-image-2.5-flare', // default: routine, cost-efficient
    sunburst: process.env.IMAGE_MODEL_SUNBURST || 'gpt-image-2.5-sunburst', // premium: hero, photoreal, complex scenes
  },
  quality: {
    default: process.env.IMAGE_QUALITY_DEFAULT || 'medium',
    premium: process.env.IMAGE_QUALITY_PREMIUM || 'high',
  },
  sizes: {
    square: '1024x1024',
    landscape: '1536x1024',
    portrait: '1024x1536',
  },
  output: {
    dir: 'public/images/gen',
    webpQuality: 80,
    // Responsive widths written per asset (largest first). Width never exceeds the source.
    widths: { landscape: [1600, 900], portrait: [1000, 600], square: [1000, 600] },
  },
};

// Automatic routing: Sunburst only when the brief genuinely needs it.
const PREMIUM_TRAITS = new Set([
  'hero', 'banner', 'photoreal', 'multi-subject', 'machinery', 'architecture',
  'interior', 'complex-lighting', 'reference-image', 'detail-sensitive',
]);

export function routeModel(asset) {
  const premium = asset.priority === 'hero' || (asset.traits || []).filter((t) => PREMIUM_TRAITS.has(t)).length >= 2;
  return {
    model: premium ? imageConfig.models.sunburst : imageConfig.models.flare,
    quality: asset.priority === 'hero' || asset.priority === 'key' ? imageConfig.quality.premium : imageConfig.quality.default,
    size: imageConfig.sizes[asset.orientation],
  };
}

const style = 'Authentic documentary-style commercial photography, natural colour, realistic hands and tools, no text, no logos, no brand names, no watermarks, no lettering on clothing.';

// Every asset has an assigned placement on the website.
export const assets = [
  {
    id: 'hero-rooftop-vrv',
    placement: 'Homepage hero (right/background)',
    orientation: 'landscape', priority: 'hero', traits: ['photoreal', 'machinery', 'complex-lighting'],
    prompt: `Wide photograph of an Indian HVAC technician in plain navy workwear and safety gloves servicing a row of large white commercial VRV outdoor condenser units on a city rooftop in Noida, India, at warm late-afternoon light. Refrigerant manifold gauges and hoses connected, one unit's side panel open. Technician placed on the right third, units receding in perspective, soft hazy skyline. Left side calmer open sky for text overlay. ${style}`,
  },
  {
    id: 'industrial-chiller',
    placement: 'Homepage industrial band + industrial service pages',
    orientation: 'landscape', priority: 'key', traits: ['photoreal', 'machinery', 'interior'],
    prompt: `Photograph inside a clean Indian factory plant room: an Indian technician in navy workwear checking the control panel of a large industrial water chiller with insulated blue pipework and pressure gauges, cool overhead industrial lighting with a warm accent, shallow depth of field. ${style}`,
  },
  {
    id: 'home-appliance',
    placement: 'Homepage "At home" bento tile, About page',
    orientation: 'portrait', priority: 'standard', traits: ['interior'],
    prompt: `Vertical photograph of an Indian appliance technician in navy workwear kneeling beside an open front-load washing machine in a bright, tidy Indian apartment utility area, toolbox open on the floor, soft window daylight. ${style}`,
  },
  {
    id: 'commercial-refrigeration',
    placement: 'Homepage "Commercial" bento tile, refrigeration pages',
    orientation: 'portrait', priority: 'standard', traits: ['interior'],
    prompt: `Vertical photograph of a technician in navy workwear inspecting a stainless steel four-door commercial refrigerator in a clean restaurant kitchen in India, door open, digital thermometer in hand, cool even lighting. ${style}`,
  },
  {
    id: 'electrical-panel',
    placement: 'Homepage "Electrical" bento tile, electrical page',
    orientation: 'square', priority: 'standard', traits: [],
    prompt: `Square close photograph of gloved hands using an insulated multimeter probe on a neatly wired residential electrical distribution board with MCB breakers, safety-focused, shallow depth of field, cool neutral light. ${style}`,
  },
  {
    id: 'workbench-tools',
    placement: 'Process section background / CTA band',
    orientation: 'landscape', priority: 'standard', traits: [],
    prompt: `Overhead flat-lay photograph on a dark navy workbench: refrigerant manifold gauge set, insulated screwdrivers, multimeter, pliers, copper pipe pieces and a coiled hose arranged neatly with generous empty space on the left half, soft directional light. ${style}`,
  },
];
