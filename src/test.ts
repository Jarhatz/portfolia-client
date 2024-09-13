import { getLinkPreview, getPreviewFromContent } from "link-preview-js";

interface LinkPreview {
  url: string;
  title: string | undefined;
  image: string | undefined;
  siteName: string | undefined;
  description: string | undefined;
}

const url: string =
  "https://finance.yahoo.com/news/apple-aapl-expected-beat-earnings-140211938.html?guccounter=1";
// getLinkPreview(url).then((data) => console.debug(data));

try {
  const data: any = await getLinkPreview(url);
  console.log(data);
  var link_thumbnail: string = "";
  if (data.images.length > 0) {
    link_thumbnail = data.images[0];
  }
  const link: LinkPreview = {
    url: url,
    title: data.title,
    siteName: data.siteName,
    description: data.description,
    image: link_thumbnail,
  };
  console.log(link);
} catch (error) {
  console.error("Error occurred: ", error);
}