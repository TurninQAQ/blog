import { PublicNoteCard } from "@/components/public/content/PublicNoteCard";
import type { PublicPostSummary } from "@/lib/public/content-queries";

type PublicNoteListProps = {
  posts: PublicPostSummary[];
};

export function PublicNoteList({ posts }: PublicNoteListProps) {
  return (
    <section className="manga-note-list overflow-hidden rounded-lab border-2 border-lab-text bg-lab-surface">
      <ul data-testid="public-note-list">
        {posts.map((post) => (
          <PublicNoteCard key={post.id} post={post} />
        ))}
      </ul>
    </section>
  );
}
