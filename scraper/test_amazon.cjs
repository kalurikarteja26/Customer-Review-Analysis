const cheerio = require('cheerio'); 
const fs = require('fs'); 
const html = fs.readFileSync('amazon_debug.html', 'utf8'); 
const $ = cheerio.load(html); 
const items = []; 
$('.s-result-item[data-component-type="s-search-result"]').each((i, el) => { 
    const title = $(el).find('h2 a span, h2 span, h2').first().text().trim(); 
    const link = $(el).find('h2 a, .a-link-normal.s-no-outline').first().attr('href'); 
    items.push({title, link}); 
}); 
console.log(items.slice(0, 5));
