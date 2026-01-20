import { useMutation, useQueryClient } from "@tanstack/react-query";
import { logout } from "../lib/api";

const useLogout = () => {
  const queryClient = useQueryClient();

  const {
    mutate: logoutMutation,
    isPending,
    error,
  } = useMutation({
    mutationFn: logout,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["authUser"] }), //Once logged out,refetch auth user to reflect logged out state
  });

  return { logoutMutation, isPending, error };
};
export default useLogout;
