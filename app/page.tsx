import { Dock } from "@/components/ui/dock";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SwapComponent from "@/components/web3/swap/swap-component";
import { TabsContent } from "@radix-ui/react-tabs";
import Link from "next/link";
import Pool from "./pool/page";

interface HomeProps {
  searchParams: { tab?: string };
}

export default function Home({ searchParams }: HomeProps) {
  const currentTab = searchParams.tab || "swap";

  return (
    <div className="flex flex-col h-[calc(100vh-272px)] items-center justify-center">
      <Tabs className="bg-transparent" value={currentTab} defaultValue="swap">
        <TabsList className="flex flex-row max-w-xl">
          {[
            { value: "swap", label: "Swap" },
            { value: "limit", label: "Limit" },
            { value: "send", label: "Send" },
            { value: "buy", label: "Buy" },
            { value: "pool", label: "Pool" },
          ].map((tab) => (
            <Link key={tab.value} href={`/?tab=${tab.value}`}>
              <TabsTrigger value={tab.value}>{tab.label}</TabsTrigger>
            </Link>
          ))}
        </TabsList>
        <TabsContent value="swap">
          <SwapComponent />
        </TabsContent>
        <TabsContent value="pool">
          <Pool />
        </TabsContent>
      </Tabs>
    </div>
  );
}
