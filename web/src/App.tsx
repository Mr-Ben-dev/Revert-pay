import { Navbar } from "@/components/shared/Navbar";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Checkout from "./pages/Checkout";
import CreatePolicy from "./pages/CreatePolicy";
import Docs from "./pages/Docs";
import GenerateLink from "./pages/GenerateLink";
import Home from "./pages/Home";
import Legal from "./pages/Legal";
import Market from "./pages/Market";
import MerchantDashboard from "./pages/MerchantDashboard";
import MyRNFTs from "./pages/MyRNFTs";
import NotFound from "./pages/NotFound";
import Stats from "./pages/Stats";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/merchant" element={<MerchantDashboard />} />
          <Route path="/merchant/policy" element={<CreatePolicy />} />
          <Route path="/merchant/link" element={<GenerateLink />} />
          <Route path="/pay/:linkId" element={<Checkout />} />
          <Route path="/me" element={<MyRNFTs />} />
          <Route path="/market" element={<Market />} />
          <Route path="/stats" element={<Stats />} />
          <Route path="/docs" element={<Docs />} />
          <Route path="/legal" element={<Legal />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
