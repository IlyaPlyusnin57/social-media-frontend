import { useQuery } from "@tanstack/react-query";
import { useState, useRef } from "react";
import useAxiosConfig2 from "../api/useAxiosConfig2";

export function useNextQuery(queryKeys, queryFunction, queryFunctionOptions) {
  const [results, setResults] = useState([]);
  const [hasNextPage, setHasNextPage] = useState(false);
  const nextUserId = useRef(null);

  const api = useAxiosConfig2();

  const { isError, error, isFetching } = useQuery({
    queryKey: [...queryKeys],
    queryFn: () => queryFunction(api, queryFunctionOptions),
    refetchOnWindowFocus: false,
    onSuccess: (data) => {
      setResults((results) => [...results, ...data]);
      setHasNextPage(data.length === 10);
      nextUserId.current =
        data.length === 10 ? data[data.length - 1]._id : null;
    },
  });

  return {
    isError,
    error,
    isFetching,
    results,
    hasNextPage,
    nextUserId,
  };
}
