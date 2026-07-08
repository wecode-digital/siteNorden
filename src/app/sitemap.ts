import type { MetadataRoute } from "next";
import { getAllKnownPaths } from "@/lib/cms";
import { SITE_URL } from "@/lib/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const paths = await getAllKnownPaths();

  return paths.map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
  }));
}
