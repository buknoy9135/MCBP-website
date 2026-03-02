require("dotenv").config();
const fs = require("fs");
const { SitemapStream, streamToPromise } = require("sitemap");
const { createClient } = require("@supabase/supabase-js");

const hostname = "https://www.mcbp-org.com/";

const staticLinks = [
  { url: "/", changefreq: "daily", priority: 1.0 },
  { url: "/#about", changefreq: "monthly", priority: 0.7 },
  { url: "/#join", changefreq: "monthly", priority: 0.7 },
  { url: "/blog", changefreq: "weekly", priority: 0.8 },
  { url: "/privacy-policy", changefreq: "yearly", priority: 0.3 },
];

(async () => {
  let blogLinks = [];

  const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
  const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseKey) {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data: posts, error } = await supabase
      .from("posts")
      .select("slug, updated_at")
      .eq("is_archived", false)
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("⚠️  Could not fetch posts from Supabase:", error.message);
    } else {
      blogLinks = posts.map((post) => ({
        url: `/blog/${post.slug}`,
        changefreq: "monthly",
        priority: 0.9,
        lastmod: post.updated_at,
      }));
      console.log(`✅ Added ${blogLinks.length} blog post(s) to sitemap`);
    }
  } else {
    console.warn("⚠️  Supabase env vars not found — skipping dynamic blog posts");
  }

  const sitemapLinks = [...staticLinks, ...blogLinks];

  const sitemapStream = new SitemapStream({ hostname });
  sitemapLinks.forEach((link) => sitemapStream.write(link));
  sitemapStream.end();

  const sitemapXml = await streamToPromise(sitemapStream).then((sm) => sm.toString());
  fs.writeFileSync("./public/sitemap.xml", sitemapXml);

  console.log("✅ sitemap.xml generated successfully");
})();
