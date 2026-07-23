import { cookies } from "next/headers";

export async function isAdmin(): Promise<boolean> {
  try {
    const cookieStore = await cookies();

    const session = cookieStore.get(
      "admin_session"
    );

    return (
      session?.value === "authenticated"
    );
  } catch (error) {
    console.error(
      "Auth session error:",
      error
    );

    return false;
  }
}