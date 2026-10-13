import Link from "next/link";
import { RefreshButton } from "@/components/RefreshButton";
import { getEnquiries, getEnquiryStats } from "@/lib/enquiries";
import { enquiryProjectTypes, type EnquiryFilters } from "@/lib/enquiry-types";

export const dynamic = "force-dynamic";

function pageHref(filters: EnquiryFilters, page: number) {
  const query = new URLSearchParams();
  if (filters.q) query.set("q", filters.q);
  if (filters.projectType) query.set("projectType", filters.projectType);
  if (filters.period !== "all") query.set("period", filters.period);
  if (page > 1) query.set("page", String(page));
  return query.size ? `/?${query.toString()}` : "/";
}

const dateFormat = new Intl.DateTimeFormat("en-CA", {
  day: "2-digit", month: "short", year: "numeric", timeZone: "America/Toronto",
});
const timeFormat = new Intl.DateTimeFormat("en-CA", {
  hour: "numeric", minute: "2-digit", timeZone: "America/Toronto",
});

export default async function InquiriesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const [result, stats] = await Promise.all([getEnquiries(params), getEnquiryStats()]);
  const { items, total, page, pageSize, totalPages, filters } = result;
  const filtered = Boolean(filters.q || filters.projectType || filters.period !== "all");
  const projectTypes = [...new Set<string>([...enquiryProjectTypes, ...(filters.projectType ? [filters.projectType] : [])])];
  const metrics = [
    ["Total inquiries", stats.total, "Since the beginning"],
    ["Last 7 days", stats.last7Days, "Recent conversations"],
    ["Last 30 days", stats.last30Days, "Rolling 30-day view"],
    ["With inspiration", stats.withAttachments, "Files to explore"],
  ] as const;

  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">THE STUDIO INBOX</span>
          <h1>Inquiries<span className="title-dot">.</span></h1>
          <p>Every new project starts with a conversation.</p>
        </div>
        <RefreshButton />
      </div>
      <section className="metrics" aria-label="Inquiry overview, across all inquiries">
        {metrics.map(([label, value, note]) => (
          <div className="metric" key={label}>
            <span className="metric-label">{label}</span>
            <strong>{value.toLocaleString("en-CA")}</strong>
            <span className="metric-note">{note}</span>
          </div>
        ))}
      </section>
      <section className="inbox" aria-labelledby="inbox-heading">
        <div className="section-heading">
          <h2 id="inbox-heading">{filtered ? "Filtered inquiries" : "All inquiries"}<span className="count-badge">{total.toLocaleString("en-CA")}</span></h2>
          <span className="muted text-small">Newest first</span>
        </div>
        <form method="get" action="/" className="inbox-filters" role="search" aria-label="Search and filter inquiries">
          <label className="field search-field" htmlFor="inquiry-search">
            <span>Search inquiries</span>
            <input id="inquiry-search" name="q" type="search" placeholder="Name, email, company or project…" defaultValue={filters.q} maxLength={200} />
          </label>
          <label className="field" htmlFor="project-type">
            <span>Project type</span>
            <select id="project-type" name="projectType" defaultValue={filters.projectType}>
              <option value="">All project types</option>
              {projectTypes.map((type) => <option key={type} value={type}>{type}</option>)}
            </select>
          </label>
          <label className="field" htmlFor="received-period">
            <span>Received</span>
            <select id="received-period" name="period" defaultValue={filters.period}>
              <option value="all">Any time</option>
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
            </select>
          </label>
          <button className="button filter-submit" type="submit">Apply</button>
        </form>
        {filtered && (
          <div className="filter-summary">
            <span>{total.toLocaleString("en-CA")} {total === 1 ? "inquiry matches" : "inquiries match"} your filters.</span>
            <Link href="/" className="text-link">Clear filters</Link>
          </div>
        )}
        {items.length ? (
          <>
            <div className="table-scroll" role="region" aria-label="Inquiry results" tabIndex={0}>
              <table className="inquiry-table">
                <caption className="sr-only">Customer inquiries from the landing page, newest first. Dates and times use Toronto time.</caption>
                <thead><tr><th scope="col">Customer</th><th scope="col">Project</th><th scope="col">Received</th><th scope="col">Inspiration</th><th scope="col"><span className="sr-only">Open inquiry</span></th></tr></thead>
                <tbody>
                  {items.map((inquiry) => (
                    <tr key={inquiry.reference}>
                      <td>
                        <Link className="customer-name" href={`/enquiries/${inquiry.reference}`}>{inquiry.name}</Link>
                        <span className="table-secondary">{inquiry.company || inquiry.email}</span>
                      </td>
                      <td><span className="project-type">{inquiry.projectType || "Not specified"}</span><span className="table-secondary">{inquiry.application || inquiry.location || "No project details"}</span></td>
                      <td className="date-cell"><time dateTime={inquiry.receivedAt}>{dateFormat.format(new Date(inquiry.receivedAt))}</time><span className="table-secondary">{timeFormat.format(new Date(inquiry.receivedAt))}</span></td>
                      <td>{inquiry.hasAttachment ? <span className="attachment-badge">1 file</span> : <span className="muted">—</span>}</td>
                      <td><Link className="open-inquiry" href={`/enquiries/${inquiry.reference}`} aria-label={`View inquiry from ${inquiry.name}`}>View <span aria-hidden="true">↗</span></Link></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="pagination">
              <span>Showing {((page - 1) * pageSize + 1).toLocaleString("en-CA")}–{Math.min(page * pageSize, total).toLocaleString("en-CA")} of {total.toLocaleString("en-CA")}</span>
              <nav className="pagination-controls" aria-label="Inquiry pages">
                {page > 1 ? <Link className="button button-secondary button-small" href={pageHref(filters, page - 1)}>Previous</Link> : <button className="button button-secondary button-small" disabled>Previous</button>}
                <span>Page {page} of {totalPages}</span>
                {page < totalPages ? <Link className="button button-secondary button-small" href={pageHref(filters, page + 1)}>Next</Link> : <button className="button button-secondary button-small" disabled>Next</button>}
              </nav>
            </div>
          </>
        ) : (
          <div className="empty-state" role="status">
            <span className="empty-mark" aria-hidden="true">↘</span>
            <h3>{filtered ? "No inquiries match these filters." : "Room for the next great idea."}</h3>
            <p>{filtered ? "Try a different search or clear your filters to see every inquiry." : "When someone sends an inquiry through the studio website, you’ll find their project and contact details here."}</p>
            {filtered && <Link className="button button-secondary" href="/">Clear filters</Link>}
          </div>
        )}
      </section>
      <p className="inbox-note">Submitted through the VAVI Tile Studio website. Select an inquiry to see the full project brief.</p>
    </>
  );
}
