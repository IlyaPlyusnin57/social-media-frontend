import "./style.css";

import ReactDOM from "react-dom/client";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import { AuthContextProvider } from "./context/AuthContext";
import { disableReactDevTools } from "@fvilers/disable-react-devtools";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

const container = document.getElementById("root");
const root = ReactDOM.createRoot(container);
const queryClient = new QueryClient();

// if (
//   process.env.NODE_ENV === "production" ||
//   process.env.NODE_ENV === "development"
// ) {
//   disableReactDevTools();
// }

root.render(
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthContextProvider>
        <App />
        {/* <ReactQueryDevtools initialIsOpen={false} /> */}
      </AuthContextProvider>
    </BrowserRouter>
  </QueryClientProvider>
);
