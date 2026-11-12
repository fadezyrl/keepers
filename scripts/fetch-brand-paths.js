const https = require('https');
const fs = require('fs');
const path = require('path');

const get = url =>
  new Promise((resolve, reject) => {
    https
      .get(url, res => {
        let data = '';
        res.on('data', c => (data += c));
        res.on('end', () => resolve({status: res.statusCode, data}));
      })
      .on('error', reject);
  });

const brands = ['toyota', 'jeep', 'ford', 'nissan', 'hyundai', 'kia'];

(async () => {
  const out = {};
  for (const brand of brands) {
    const {status, data} = await get(
      `https://cdn.simpleicons.org/${brand}/111110`,
    );
    if (status !== 200) {
      console.error('fail', brand, status);
      continue;
    }
    const match = data.match(/d="([^"]+)"/);
    if (!match) {
      console.error('no path', brand);
      continue;
    }
    out[brand] = match[1];
    console.log(brand, 'ok', match[1].length);
  }
  const target = path.join(__dirname, '..', 'src', 'data', 'brandLogoPaths.json');
  fs.writeFileSync(target, JSON.stringify(out, null, 2));
  console.log('wrote', target);
})();
