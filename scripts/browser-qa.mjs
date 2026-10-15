import {chromium} from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import {mkdir,writeFile} from 'node:fs/promises';
import {services} from '../src/data/services.ts';
import assert from 'node:assert/strict';

const origin=process.env.QA_ORIGIN||'http://localhost:4322';
const out='output/playwright';await mkdir(out,{recursive:true});
const routes=['/','/about-us/','/services/','/why-choose-us/','/gallery/','/faqs/','/contact-us/','/privacy-policy/','/terms-and-conditions/','/thank-you/','/video-transcripts/',...services.map(s=>`/services/${s.slug}/`)];
const browser=await chromium.launch({channel:'chrome',headless:true});
const context=await browser.newContext({viewport:{width:1440,height:1000}});
const page=await context.newPage();
const report={routes:[],interactions:[],responsive:[],errors:[],assetFailures:[]};
page.on('pageerror',error=>report.errors.push(error.message));
page.on('console',message=>{if(message.type()==='error'&&!message.text().includes('404'))report.errors.push(message.text());});
page.on('response',response=>{if(response.status()>=400&&!response.url().includes('missing-qa-route'))report.assetFailures.push({url:response.url(),status:response.status()});});
async function scrollPage(){await page.evaluate(async()=>{for(let y=0;y<document.body.scrollHeight;y+=650){window.scrollTo(0,y);await new Promise(resolve=>setTimeout(resolve,70));}await Promise.all(Array.from(document.images).map(async image=>{image.loading='eager';await image.decode().catch(()=>{});}));window.scrollTo(0,0);});await page.waitForTimeout(700);}
try{
 const titles=new Set(),descriptions=new Set();const hrefs=new Set();
 for(const route of routes){
  const response=await page.goto(origin+route);assert.equal(response.status(),200,route);
  await page.evaluate(()=>document.fonts.ready);await scrollPage();
  const info=await page.evaluate(()=>({title:document.title,description:document.querySelector('meta[name="description"]')?.content,canonical:document.querySelector('link[rel="canonical"]')?.href,h1:document.querySelectorAll('h1').length,broken:Array.from(document.images).filter(im=>im.getAttribute('src')&&(!im.complete||im.naturalWidth===0)).map(im=>im.src),overflow:document.documentElement.scrollWidth>innerWidth+1,links:Array.from(document.querySelectorAll('a[href]')).map(a=>a.getAttribute('href'))}));
  assert.equal(info.h1,1,`${route} needs one h1`);assert(info.description,route);assert(!titles.has(info.title),`duplicate title: ${route}`);assert(!descriptions.has(info.description),`duplicate description: ${route}`);assert(info.canonical.startsWith('https://ekramulallrepairingservicecenter.com'),route);assert.deepEqual(info.broken,[],`broken images on ${route}`);assert(!info.overflow,`desktop overflow ${route}`);titles.add(info.title);descriptions.add(info.description);info.links.filter(h=>h?.startsWith('/')).forEach(h=>hrefs.add(h.split(/[?#]/)[0]));
  console.log(`Checking ${route}`);
  const axe=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa']).analyze();
  report.routes.push({route,title:info.title,violations:axe.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))}))});
  if(['/', '/about-us/','/gallery/','/services/vrv-ductable-ac-repair/','/contact-us/'].includes(route))await page.screenshot({path:`${out}/${route==='/'?'home-desktop':route.replaceAll('/','-').replace(/^-|-$/g,'')+'-desktop'}.png`,fullPage:true});
 }
 for(const href of hrefs){const response=await page.request.get(origin+href);assert.equal(response.status(),200,`broken link ${href}`);}
 const missing=await page.goto(origin+'/missing-qa-route/');assert.equal(missing.status(),404);assert.match(await page.locator('h1').textContent(),/page needs/);report.interactions.push('Unknown route returns custom HTTP 404');
 const sitemap=await page.request.get(origin+'/sitemap.xml');assert.equal(sitemap.status(),200);assert.equal(((await sitemap.text()).match(/<loc>/g)||[]).length,19);assert.equal((await page.request.get(origin+'/robots.txt')).status(),200);report.interactions.push('Sitemap contains 19 public URLs; robots resolves');
 await page.goto(origin+'/services/');await page.getByRole('button',{name:'Electrical',exact:true}).click();assert.equal(await page.locator('.service-card:visible').count(),2);await page.getByRole('button',{name:'All Services',exact:true}).click();assert.equal(await page.locator('.service-card:visible').count(),12);report.interactions.push('Service category filters');
 await page.goto(origin+'/gallery/');await page.getByRole('button',{name:'Refrigeration',exact:true}).click();assert.equal(await page.locator('.gallery-card:visible').count(),3);const opener=page.locator('.gallery-card:visible .gallery-open').first();await opener.click();assert(await page.locator('dialog').evaluate(el=>el.open));await page.keyboard.press('ArrowRight');assert.equal(await page.locator('.lightbox-count').textContent(),'2 / 3');await page.keyboard.press('Escape');assert(!(await page.locator('dialog').evaluate(el=>el.open)));assert(await opener.evaluate(el=>el===document.activeElement));report.interactions.push('Gallery filters, lightbox arrows, Escape and focus return');
 const videos=page.locator('video');assert.equal(await videos.count(),9);await videos.first().evaluate(v=>v.play());await page.waitForTimeout(800);assert(await videos.first().evaluate(v=>v.currentTime>0));await videos.first().evaluate(v=>{if(v instanceof HTMLVideoElement)v.pause();});report.interactions.push('First video decodes and plays; nine controls and caption tracks present');
 assert.equal(await page.locator('video track[kind="captions"]').count(),9);
 await page.goto(origin+'/faqs/');const summary=page.locator('.faq-item summary').first();await summary.focus();await page.keyboard.press('Enter');assert(await page.locator('.faq-item').first().evaluate(el=>el.open));await page.keyboard.press('Enter');assert(!(await page.locator('.faq-item').first().evaluate(el=>el.open)));report.interactions.push('FAQ keyboard expand/collapse');
 await page.goto(origin+'/');await page.getByRole('button',{name:'Show services',exact:true}).click();assert(await page.locator('#service-dropdown').isVisible());await page.keyboard.press('Escape');assert(!(await page.locator('#service-dropdown').isVisible()));report.interactions.push('Desktop service menu and Escape');
 for(const service of services){await page.goto(`${origin}/contact-us/?service=${service.slug}#enquiry`);assert.equal(await page.locator('select[name="service"]').inputValue(),service.name);}
 report.interactions.push('All 12 service enquiry links preselect the correct equipment');
 await page.goto(origin+'/contact-us/');assert.equal(await page.locator('form').evaluate(f=>f.checkValidity()),false);await page.getByLabel('Full name',{exact:true}).fill('Local QA');await page.getByLabel('Mobile number',{exact:true}).fill('abc');assert.equal(await page.getByLabel('Mobile number',{exact:true}).evaluate(e=>e.checkValidity()),false);await page.getByLabel('Mobile number',{exact:true}).fill('+919870371013');await page.getByLabel('Email address',{exact:true}).fill('invalid');assert.equal(await page.getByLabel('Email address',{exact:true}).evaluate(e=>e.checkValidity()),false);await page.getByLabel('Email address',{exact:true}).fill('local-qa@example.com');await page.getByRole('combobox',{name:'Service required',exact:true}).selectOption('Geyser Repair');await page.getByLabel('Describe the problem',{exact:true}).fill('Local QA only. No real enquiry is being sent.');assert.equal(await page.locator('form').evaluate(f=>f.checkValidity()),true);
 let posted=false;await page.route('https://formsubmit.co/**',async route=>{posted=true;assert.equal(route.request().method(),'POST');assert.match(route.request().postData(),/service=Geyser/);await route.fulfill({status:200,contentType:'text/html',body:'<!doctype html><title>Local intercepted form test</title><h1>Local form test only</h1>'});});await page.getByRole('button',{name:'Submit Enquiry',exact:true}).click();await page.waitForURL('https://formsubmit.co/**');assert(posted);await page.unroute('https://formsubmit.co/**');report.interactions.push('Required, email and phone validation; valid form POST intercepted locally (no delivery claim)');
 await page.setViewportSize({width:375,height:900});await page.goto(origin+'/');await page.getByRole('button',{name:'Open navigation'}).click();assert(await page.locator('#main-nav').isVisible());await page.keyboard.press('Escape');assert(!(await page.locator('#main-nav').isVisible()));report.interactions.push('Mobile menu opens and Escape closes it');
 for(const width of [320,375,480,768,1024,1280,1440]){
  await page.setViewportSize({width,height:900});
  for(const route of ['/','/services/','/contact-us/','/gallery/','/services/two-stand-lift-repair/']){
   await page.goto(origin+route);await page.evaluate(()=>document.fonts.ready);
   const overflow=await page.evaluate(()=>({viewport:innerWidth,scroll:document.documentElement.scrollWidth,items:Array.from(document.querySelectorAll('body *')).filter(el=>{const r=el.getBoundingClientRect();const style=getComputedStyle(el);return r.width&&r.right>innerWidth+2&&style.position!=='absolute'&&style.position!=='fixed';}).slice(0,8).map(el=>el.className)}));
   report.responsive.push({width,route,...overflow});assert(overflow.scroll<=overflow.viewport+1,`Overflow: ${width} ${route} ${JSON.stringify(overflow)}`);
   if(width===375&&['/','/gallery/','/contact-us/'].includes(route)){await scrollPage();await page.screenshot({path:`${out}/${route==='/'?'home-mobile':route.replaceAll('/','-').replace(/^-|-$/g,'')+'-mobile'}.png`,fullPage:true});}
  }
 }
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto(origin+'/');const motion=await page.locator('.reveal').first().evaluate(el=>getComputedStyle(el).animationName);assert.equal(motion,'none');report.interactions.push('Reduced motion disables section animation');
 await page.setViewportSize({width:1440,height:1000});await scrollPage();await page.screenshot({path:`${out}/home-final-viewport.png`,fullPage:false});
 assert(report.routes.every(route=>route.violations.length===0),'Accessibility violations found; see qa-results.json');
 assert.deepEqual(report.errors,[],'Browser errors found');
 assert.deepEqual(report.assetFailures,[],'Failed asset requests found');
}catch(error){report.failure=error.stack;process.exitCode=1;}finally{await writeFile(`${out}/qa-results.json`,JSON.stringify(report,null,2));await browser.close();console.log(JSON.stringify({routes:report.routes.length,responsiveChecks:report.responsive.length,interactions:report.interactions,violations:report.routes.filter(r=>r.violations.length),errors:report.errors,assetFailures:report.assetFailures,failure:report.failure},null,2));}
