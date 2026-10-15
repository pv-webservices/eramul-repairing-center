import type { APIRoute } from 'astro';
import {business} from '../data/business';
import {services} from '../data/services';
export const GET:APIRoute = ()=>{
 const routes=['/','/about-us/','/services/','/why-choose-us/','/gallery/','/faqs/','/contact-us/',...services.map(s=>`/services/${s.slug}/`)];
 return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${routes.map(route=>`<url><loc>${business.origin}${route}</loc></url>`).join('')}</urlset>`,{headers:{'Content-Type':'application/xml; charset=utf-8'}});
};
