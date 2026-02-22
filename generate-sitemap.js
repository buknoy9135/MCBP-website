const fs = require("fs");
const { SitemapStream, streamToPromise } = require("sitemap");
const { createGzip } = require("zlib");

const sitemapLinks = [
  { url: "/", changefreq: "daily", priority: 1.0 },
  { url: "/#about", changefreq: "monthly", priority: 0.7 },
  { url: "/#join", changefreq: "monthly", priority: 0.7 },
  { url: "/blog", changefreq: "weekly", priority: 0.8 },
  { url: "/privacy-policy", changefreq: "yearly", priority: 0.3 },
];

const hostname = "https://www.mcbp-org.com/";

(async () => {
  const sitemapStream = new SitemapStream({ hostname });

  sitemapLinks.forEach(link => sitemapStream.write(link));
  sitemapStream.end();

  // Plain XML
  const sitemapXml = await streamToPromise(sitemapStream).then(sm => sm.toString());
  fs.writeFileSync("./public/sitemap.xml", sitemapXml);

  // Compressed gzip version
  const gzipStream = sitemapStream.pipe(createGzip());
  const compressed = await streamToPromise(gzipStream);
  fs.writeFileSync("./public/sitemap.xml.gz", compressed);

  console.log("✅ sitemap.xml and sitemap.xml.gz generated successfully");
})();
