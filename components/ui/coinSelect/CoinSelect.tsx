import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { getCoinData } from "@/actions/coingecko/getCoinData.action";
import { Button } from "../button";
import { ScrollArea } from "../scroll-area";
import { Input } from "../input";
import { useCoinStore } from "@/store";
import {
  ArrowDownIcon,
  ChevronDownIcon,
  MagnifyingGlassIcon,
} from "@radix-ui/react-icons";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton"; // Add this import
import { SearchInput } from "@/components/common/SearchBar";
import { filterCoins } from "@/lib/utils/utils";
const ITEMS_PER_PAGE = 20;

interface Coin {
  id: string;
  name: string;
  symbol: string;
  image: string;
}

interface CoinSelectProps {
  coinType: "coin1" | "coin2"; // To distinguish between the two coin selectors
}

const CoinLoadingSkeleton = () => (
  <ScrollArea className="h-[60vh] rounded-md border p-2">
    {Array.from({ length: 15 }).map((_, i) => (
      <div key={i} className="p-2 border-b flex items-center space-x-2">
        <Skeleton className="h-6 w-6 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-[200px]" />
        </div>
      </div>
    ))}
  </ScrollArea>
);

const CoinSelect: React.FC<CoinSelectProps> = ({ coinType }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [coinData, setCoinData] = useState<Coin[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [visibleCoins, setVisibleCoins] = useState(ITEMS_PER_PAGE);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const { coin1, coin2, setCoin1, setCoin2 } = useCoinStore();

  useEffect(() => {
    const fetchCoinData = async () => {
      if (!isOpen) return;

      try {
        setIsLoading(true);
        setError(null);
        const data = await getCoinData();
        if (Array.isArray(data)) {
          setCoinData(data);
          setVisibleCoins(ITEMS_PER_PAGE);
        } else {
          setError("Invalid data format");
        }
      } catch (err) {
        setError("Failed to fetch coin data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCoinData();
  }, [isOpen]);

  const filteredCoins = filterCoins(coinData, searchQuery);

  const paginatedCoins = filteredCoins.slice(0, visibleCoins);

  const lastCoinRef = useCallback(
    (node: HTMLElement | null) => {
      if (isLoading) return;
      if (observerRef.current) observerRef.current.disconnect();

      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && visibleCoins < filteredCoins.length) {
          setVisibleCoins((prev) => prev + ITEMS_PER_PAGE);
        }
      });

      if (node) observerRef.current.observe(node);
    },
    [isLoading, visibleCoins, filteredCoins.length]
  );

  const handleSelectCoin = (coin: Coin) => {
    // Select coin based on `coinType` prop
    if (coinType === "coin1") {
      setCoin1(coin);
    } else {
      setCoin2(coin);
    }
    setIsOpen(false);
  };

  // Decide which coin to display in the button
  const selectedCoin = coinType === "coin1" ? coin1 : coin2;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          className="border border-red hover:bg-red/10 transition-colors p-2.5 rounded-lg w-[160px] h-[44px]"
          onClick={() => setIsOpen(true)}
        >
          <div className="flex items-center justify-between w-full">
            {selectedCoin ? (
              <div className="flex items-center  flex-1 min-w-0">
                <Image
                  src={selectedCoin?.image}
                  alt={selectedCoin?.name}
                  width={24}
                  height={24}
                  className="rounded-full shrink-0"
                />
                <span className="font-medium truncate">
                  {selectedCoin?.symbol.toUpperCase()}
                </span>
              </div>
            ) : (
              <span className="">Select Token</span>
            )}
            <ChevronDownIcon className="h-4 w-4 shrink-0" />
          </div>
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-[20px]">Select Tokens</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 bg-[#E0E0E04D] p-[20px]">
          <SearchInput
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tokens..."
          />

          {isLoading && <CoinLoadingSkeleton />}

          {error && (
            <div className="text-red-500 text-center py-4">{error}</div>
          )}

          {!isLoading && !error && filteredCoins.length === 0 && (
            <div className="text-center py-4">No coins found</div>
          )}

          {!isLoading && !error && filteredCoins.length > 0 && (
            <ScrollArea className="h-[60vh] rounded-md border p-2">
              {paginatedCoins.map((coin, index) => (
                <div
                  key={coin.id || index}
                  className="p-2 border-b cursor-pointer flex flex-row items-center space-x-2  hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                  onClick={() => handleSelectCoin(coin)}
                  ref={index === paginatedCoins.length - 1 ? lastCoinRef : null}
                >
                  <Image
                    height={34}
                    width={34}
                    src={coin.image}
                    alt={coin.name}
                    className="rounded-full"
                  />
                  <p>{coin.name}</p>
                  <span className="text-sm text-neutral-500 ml-auto">
                    {coin.symbol.toUpperCase()}
                  </span>
                </div>
              ))}
            </ScrollArea>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CoinSelect;
