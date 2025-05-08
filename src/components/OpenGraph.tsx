'use client';

import { Metadata } from 'next';

interface OpenGraphProps {
  title: string;
  description: string;
  url?: string;
  image?: {
    url: string;
    width?: number;
    height?: number;
    alt?: string;
  };
  logo?: {
    url: string;
    width?: number;
    height?: number;
  };
  type?: 'website' | 'article';
}

export default function OpenGraph({
  title,
  description,
  url,
  image,
  logo,
  type = 'website'
}: OpenGraphProps) {
  return (
    <>
      {/* Basic OpenGraph tags */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      {url && <meta property="og:url" content={url} />}
      
      {/* Twitter Card tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      
      {/* Logo tags */}
      {logo && (
        <>
          <meta property="og:logo" content={logo.url} />
          {logo.width && <meta property="og:logo:width" content={logo.width.toString()} />}
          {logo.height && <meta property="og:logo:height" content={logo.height.toString()} />}
          <meta property="og:logo:alt" content="AL Performance Logo" />
        </>
      )}
      
      {/* Image tags */}
      {image && (
        <>
          <meta property="og:image" content={image.url} />
          {image.width && <meta property="og:image:width" content={image.width.toString()} />}
          {image.height && <meta property="og:image:height" content={image.height.toString()} />}
          <meta property="og:image:alt" content="AL Performance" />
          <meta name="twitter:image" content={image.url} />
          <meta name="twitter:image:alt" content="AL Performance" />
        </>
      )}
    </>
  );
} 