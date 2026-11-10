import { ToolWorkspace } from "@/components/ToolWorkspace";
import { MediaToolWorkspace } from "@/components/MediaToolWorkspace";

const mediaSlugs = ["image-compressor", "image-resizer", "image-converter", "image-to-pdf", "pdf-merge", "pdf-split"];

export default async function ToolPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  return mediaSlugs.includes(slug) ? <MediaToolWorkspace slug={slug} /> : <ToolWorkspace slug={slug} />;
}
