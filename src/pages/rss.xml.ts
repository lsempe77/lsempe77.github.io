import type { APIContext } from 'astro';
import { getCollection } from 'astro:content';

// Escape XML special characters
function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function GET(context: APIContext) {
  const posts = (await getCollection('blog', ({ data }) => !data.draft))
    .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());

  const site = 'https://lsempe77.github.io';
  const now = new Date().toUTCString();

  const items = posts.map(post => {
    const link = `${site}/blog/${post.slug}/`;
    const pubDate = new Date(post.data.date).toUTCString();
    const description = post.data.summary || post.data.subtitle || '';
    const tags = post.data.tags?.map((t: string) => `<category>${escapeXml(t)}</category>`).join('\n        ') || '';

    return `
    <item>
      <title><![CDATA[${post.data.title}]]></title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <pubDate>${pubDate}</pubDate>
      <description><![CDATA[${description}]]></description>
      ${tags}
    </item>`;
  }).join('\n');

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>Lucas Sempé - Research and AI Blog</title>
    <description>Impact evaluation, evidence synthesis, AI and LLMs for research automation, and lessons from policy and development work.</description>
    <link>${site}</link>
    <atom:link href="${site}/rss.xml" rel="self" type="application/rss+xml"/>
    <language>en-us</language>
    <lastBuildDate>${now}</lastBuildDate>
    <managingEditor>lucas.sempe@gmail.com (Lucas Sempé)</managingEditor>
    <webMaster>lucas.sempe@gmail.com (Lucas Sempé)</webMaster>
    <image>
      <url>${site}/favicon.svg</url>
      <title>Lucas Sempé</title>
      <link>${site}</link>
    </image>
    ${items}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
}
