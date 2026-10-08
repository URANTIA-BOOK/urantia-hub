import type { GetServerSideProps } from "next";
import { AUTH_OFF_READ_HREF, isAuthEnabled } from "./authEnabled";

export const authOffReadRedirect: GetServerSideProps = async () => {
  if (!isAuthEnabled()) {
    return {
      redirect: {
        destination: AUTH_OFF_READ_HREF,
        permanent: false,
      },
    };
  }
  return { props: {} };
};
