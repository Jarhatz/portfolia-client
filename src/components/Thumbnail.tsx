import { useState } from 'react';
import "./Thumbnail.css";

interface ThumbnailProps {
  src: string;
  defaultSrc: string;
}

const Thumbnail: React.FC<ThumbnailProps> = ({ src, defaultSrc }) => {
  const [imgSrc, setImgSrc] = useState(src);

  const handleError = () => {
    setImgSrc(defaultSrc);
  };

  return <img className="thumbnail" src={imgSrc} onError={handleError} />;
};

export default Thumbnail;