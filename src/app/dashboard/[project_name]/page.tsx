import ProjectClient from "./ProjectClient";
import { redirect } from "next/navigation";

interface Project {
  project_name: string;
}

export async function generateStaticParams() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/projects`);
  const projects: Project[] = await res.json();

  return projects.map((project) => ({
    project_name: project.project_name,
  }));
}

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
