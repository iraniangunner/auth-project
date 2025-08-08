import { unauthorized } from "next/navigation";
import { Course } from "./_types/courses.types";
import { getSession } from "@/app/utils/session";

export const getCourses = async (): Promise<Course[]> => {
  const session = await getSession();

  if (!session) {
    unauthorized();
  }

  const response = await fetch(
    "https://general-api.classbon.com/api/identity/courses",
    {
      headers: {
        authorization: `Bearer ${session.accessToken}`,
      },
    }
  );

  if (response.status === 401) {
    unauthorized();
  }

  return await response.json();
};

export default async function Page() {
  const courses = await getCourses();
  return (
    <>
      {courses.map((course) => (
        <p className="my-2 text-lg" key={`course-${course.title}`}>
          {course.title}
        </p>
      ))}
    </>
  );
}
