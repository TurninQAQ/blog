import { PublicEmptyState } from "@/components/public/content/PublicEmptyState";
import { PublicNoteList } from "@/components/public/content/PublicNoteList";
import type {
  PublicArchiveYearGroup,
  PublicPostSummary,
} from "@/lib/public/content-queries";

type ArchiveTimelineProps = {
  archiveGroups?: PublicArchiveYearGroup[];
  posts?: PublicPostSummary[];
};

function getUtcMonthLabel(value: string) {
  return `${new Date(value).getUTCMonth() + 1}月`;
}

function groupPostsByArchiveMonth(posts: PublicPostSummary[]) {
  const sortedPosts = [...posts].sort(
    (left, right) =>
      new Date(right.publishedAt).getTime() -
      new Date(left.publishedAt).getTime(),
  );
  const years = new Map<number, Map<number, PublicPostSummary[]>>();

  for (const post of sortedPosts) {
    const publishedAt = new Date(post.publishedAt);
    const year = publishedAt.getUTCFullYear();
    const month = publishedAt.getUTCMonth();
    const months = years.get(year) ?? new Map<number, PublicPostSummary[]>();
    const monthPosts = months.get(month) ?? [];

    monthPosts.push(post);
    months.set(month, monthPosts);
    years.set(year, months);
  }

  return [...years.entries()]
    .sort(([leftYear], [rightYear]) => rightYear - leftYear)
    .map<PublicArchiveYearGroup>(([year, months]) => ({
      year,
      months: [...months.entries()]
        .sort(([leftMonth], [rightMonth]) => rightMonth - leftMonth)
        .map(([month, monthPosts]) => ({
          key: `${year}-${month}`,
          label: getUtcMonthLabel(monthPosts[0].publishedAt),
          posts: monthPosts,
        })),
    }));
}

export function ArchiveTimeline({
  archiveGroups,
  posts = [],
}: ArchiveTimelineProps) {
  const groups = archiveGroups ?? groupPostsByArchiveMonth(posts);

  if (groups.length === 0) {
    return (
      <PublicEmptyState
        title="暂时没有公开归档"
        body="暂时没有可归档的公开笔记。"
      />
    );
  }

  return (
    <section data-testid="archive-timeline" className="space-y-8">
      {groups.map((yearGroup) => (
        <section key={yearGroup.year} aria-labelledby={`archive-${yearGroup.year}`}>
          <h2
            id={`archive-${yearGroup.year}`}
            className="text-[24px] font-semibold leading-[1.2] text-lab-text"
          >
            {yearGroup.year}
          </h2>
          <div className="mt-4 space-y-6">
            {yearGroup.months.map((monthGroup) => (
              <section key={monthGroup.key} className="space-y-3">
                <h3 className="font-mono text-[14px] leading-[1.4] text-lab-accent">
                  {monthGroup.label}
                </h3>
                <PublicNoteList posts={monthGroup.posts} />
              </section>
            ))}
          </div>
        </section>
      ))}
    </section>
  );
}
