import Link from "next/link";
import AuthFrame from "@/components/AuthFrame";

export default function NotFound() {
  return <AuthFrame title="Page not found." description="This page or inquiry may no longer be available."><div className="form-stack"><Link className="button" href="/">Back to inquiries</Link></div></AuthFrame>;
}
