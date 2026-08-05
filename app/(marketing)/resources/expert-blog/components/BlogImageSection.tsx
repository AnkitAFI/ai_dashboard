interface BlogImageSectionProps {
  imageSrc: string;
  altText: string;
  caption?: string;
  // maxWidth?: number;
}

export default function BlogImageSection({
  imageSrc,
  altText,
  caption,
  // maxWidth = 1040,
}: BlogImageSectionProps) {
  return (
    <div
      className="my-10"
      style={{
        // maxWidth,
        margin: "16px auto 0",
        padding: "0 16px",
      }}
    >
      <div className="rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 shadow-sm">
        <img src={encodeURI(imageSrc).replace(/\+/g, "%2B")} alt={altText} className="w-full h-auto block" />
      </div>

      {caption && (
        <p className="mt-2 text-center text-[13px] text-gray-400 italic font-medium font-sans px-2">
          {caption}
        </p>
      )}
    </div>
  );
}
