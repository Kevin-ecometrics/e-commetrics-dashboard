import ProjectClient from "./ProjectClient";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function Page({
  params,
}: {
  params: Promise<{ project_name: string }>;
}) {
  const { project_name } = await params;

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_URL}/api/project/${project_name}`
  );

  if (!res.ok) {
    redirect("/dashboard");
  }

  const project = await res.json();

  return <ProjectClient project={project} />;
}
