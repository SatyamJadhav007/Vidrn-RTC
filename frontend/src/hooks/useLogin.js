import { useMutation, useQueryClient } from "@tanstack/react-query";
import { login } from "../lib/api";

const useLogin = () => {
  const queryClient = useQueryClient();
  const { mutate, isPending, error } = useMutation({
    mutationFn: login,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["authUser"] }), //Once logged in,refetch auth user to validate if your to one or not?
  });

  return { error, isPending, loginMutation: mutate };
};

export default useLogin;
