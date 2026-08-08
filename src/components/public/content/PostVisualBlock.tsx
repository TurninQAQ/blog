import Image from "next/image";

type PostVisualBlockProps = {
  coverImage: string | null;
  title: string;
};

export function PostVisualBlock({ coverImage, title }: PostVisualBlockProps) {
  return (
    <div
      data-testid="post-visual-block"
      className="manga-post-visual relative min-h-[120px] w-full overflow-hidden rounded-lab border-2 border-lab-text bg-lab-base"
    >
      {coverImage ? (
        <Image
          src={coverImage}
          alt={title}
          fill
          sizes="(min-width: 1024px) 280px, 100vw"
          className="object-cover"
          data-testid="post-visual-cover"
          referrerPolicy={
            /^https:\/\//i.test(coverImage) ? "no-referrer" : undefined
          }
          unoptimized
        />
      ) : (
        <Image
          src="/images/portal/note-fallback-portal.webp"
          alt=""
          fill
          sizes="(min-width: 1024px) 280px, 100vw"
          className="manga-post-visual-fallback object-cover"
          data-testid="post-visual-fallback"
          loading="eager"
        />
      )}
      <span className="absolute bottom-3 left-3 rounded-lab border border-lab-accent bg-[#070a12]/92 px-2 py-1 font-mono text-[12px] font-semibold leading-[1.4] text-lab-accent">
        技术笔记
      </span>
    </div>
  );
}
