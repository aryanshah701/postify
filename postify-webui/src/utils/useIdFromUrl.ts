import { useRouter } from "next/router";

export const useIdFromUrl = (): number => {
  // Grab the id from the query params
  const router = useRouter();
  const intId = parseInt(
    typeof router.query.id === "string" ? router.query.id : "-1"
  );

  return intId;
};
