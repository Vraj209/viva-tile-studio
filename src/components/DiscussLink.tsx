"use client";
import Arrow from "./Arrow";
export default function DiscussLink({
  projectType,
  application,
}: {
  projectType: string;
  application: string;
}) {
  return (
    <a
      className="text-link"
      href="#enquiry"
      onClick={() =>
        window.dispatchEvent(
          new CustomEvent("vavi:application", {
            detail: { projectType, application },
          }),
        )
      }
    >
      Discuss a similar idea <Arrow diagonal />
    </a>
  );
}
