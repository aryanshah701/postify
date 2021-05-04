import { useRouter } from "next/router";
import { useEffect } from "react";
import { useMeQuery } from "../generated/graphql";

// Naviagate to the login page if the user isn't authenticated
export const useReqAuthentication = () => {
  const [{ data, fetching }] = useMeQuery();
  const router = useRouter();
  useEffect(() => {
    if (!fetching && !data?.me.user) {
      router.replace("/login?next=" + router.pathname);
    }
  }, [fetching, data, router]);
};
