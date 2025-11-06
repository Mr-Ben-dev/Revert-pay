import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Navbar } from "@/components/shared/Navbar";
import Home from "./pages/Home";
import MerchantDashboard from "./pages/MerchantDashboard";
import CreatePolicy from "./pages/CreatePolicy";
import GenerateLink from "./pages/GenerateLink";
import Checkout from "./pages/Checkout";
import MyRNFTs from "./pages/MyRNFTs";
import Market from "./pages/Market";
import Docs from "./pages/Docs";
import Legal from "./pages/Legal";
import NotFound from "./pages/NotFound";

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
