import * as React from "react";
import { Check, ChevronsUpDown, Square, SquareCheck, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Spinner } from "../ui/circular-spinner";
import { useProduct } from "@/hooks/stores/use-product";
import { observer } from "mobx-react-lite";
import type { Product } from "@prisma/client";
import { useProductStoreWithSWR } from "@/store/product";

interface ProductMultiSelectProps {
  onProductsChange: (
    products: { product: Partial<Product>; quantity: number }[]
  ) => void;
  onTotalPriceChange: (total: number) => void;
  onTotalProfitChange: (total: number) => void;
  parentSelectedProducts: { product: Partial<Product>; quantity: number }[];
}

export const ProductMultiSelect = observer(
  ({
    onProductsChange,
    onTotalPriceChange,
    onTotalProfitChange,
    parentSelectedProducts,
  }: ProductMultiSelectProps) => {
    const { products, isLoading } = useProductStoreWithSWR(useProduct(), false, false);
    const [open, setOpen] = React.useState(false);
    const [selectedProducts, setSelectedProducts] = React.useState<
      { product: Partial<Product>; quantity: number }[]
    >(parentSelectedProducts);

    React.useEffect(() => {
      localStorage.setItem(
        "selectedProducts",
        JSON.stringify(selectedProducts)
      );
      onProductsChange(selectedProducts);
    }, [selectedProducts, onProductsChange]);

    // Filtra os produtos selecionados
    const selectedProductDetails = products.filter((product) =>
      selectedProducts.some((selected) => selected.product.id === product.id)
    );

    // Calcula o total de preços
    const totalPrice = selectedProductDetails.reduce((acc, product) => {
      const selectedProduct = selectedProducts.find(
        (item) => item.product.id === product.id
      );
      return acc + product.sell_price * (selectedProduct?.quantity || 1);
    }, 0);

    // Calcula o total de lucros
    const totalProfit = selectedProductDetails.reduce((acc, product) => {
      const selectedProduct = selectedProducts.find(
        (item) => item.product.id === product.id
      );
      const profitPerUnit = product.sell_price - product.cost_price; // Lucro unitário
      return acc + profitPerUnit * (selectedProduct?.quantity || 1);
    }, 0);

    React.useEffect(() => {
      onTotalPriceChange(totalPrice);
      onTotalProfitChange(totalProfit);
    }, [totalPrice, totalProfit, onTotalPriceChange, onTotalProfitChange]);

    const toggleProductSelection = (productValue: number) => {
      setSelectedProducts((prev) =>
        prev.some((item) => item.product.id === productValue)
          ? prev.filter((item) => item.product.id !== productValue)
          : [
              ...prev,
              {
                product: products.find((p) => p.id === productValue)!,
                quantity: 1,
              },
            ]
      );
    };

    const updateProductQuantity = (productValue: number, quantity: number) => {
      setSelectedProducts((prev) =>
        prev.map((item) =>
          item.product.id === productValue ? { ...item, quantity } : item
        )
      );
    };

    const removeProduct = (productValue: number) => {
      setSelectedProducts((prev) =>
        prev.filter((item) => item.product.id !== productValue)
      );
    };

    return (
      <div className="w-full">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between rounded-b-none"
            >
              {selectedProducts.length > 0
                ? `${selectedProducts.length} produto(s) selecionado(s)`
                : "Selecione os produtos..."}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[400px] p-0">
            <Command>
              <CommandInput placeholder="Buscar produto..." />
              <CommandList>
                {isLoading ? (
                  <div className="flex items-center justify-center py-6">
                    <Spinner height="20" width="20" />
                  </div>
                ) : (
                  <>
                    <CommandEmpty>Nenhum produto encontrado</CommandEmpty>
                    <CommandGroup>
                      {products.map((product) => (
                        <CommandItem
                          key={product.id}
                          value={product.description}
                          onSelect={() => toggleProductSelection(product.id)}
                        >
                          {selectedProducts.some(
                            (selected) => selected.product.id === product.id
                          ) ? (
                            <SquareCheck className="mr-2 h-6 w-6 opacity-50" />
                          ) : (
                            <Square className="mr-2 h-6 w-6 opacity-50" />
                          )}

                          {product.description}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </>
                )}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        <>
          {isLoading ? (
            <div
              className="border border-t-0 rounded shadow-sm -mt-1 border-custom-border-200"
              style={{
                height: "300px",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <p className="m-auto text-custom-text-400">
                <Spinner />
              </p>
            </div>
          ) : (
            <>
              {selectedProducts.length > 0 ? (
                <div
                  className="border border-t-0 rounded shadow-sm -mt-1 border-custom-border-200"
                  style={{
                    height: "300px",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <div style={{ flexGrow: 1, overflowY: "auto" }}>
                    <table className="min-w-full text-sm">
                      <thead className="bg-custom-background-100 text-custom-text-200 sticky top-0">
                        <tr>
                          <th className="py-2 px-4 text-left">Qntd</th>
                          <th className="py-2 px-4 text-left">Descrição</th>
                          <th className="py-2 px-4 text-left">Valor</th>
                          <th className="py-2 px-4 text-left">Remover</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedProductDetails.map((product: Product) => {
                          const selectedProduct = selectedProducts.find(
                            (item) => item.product.id === product.id
                          );
                          return (
                            <tr
                              key={product.id}
                              className="border-b border-custom-border-200 text-custom-text-100"
                            >
                              <td className="py-2 px-4">
                                <input
                                  type="number"
                                  min={1}
                                  value={selectedProduct?.quantity ?? 1}
                                  onChange={(e) =>
                                    updateProductQuantity(
                                      product.id,
                                      parseInt(e.target.value, 10) || 1
                                    )
                                  }
                                  className="w-16 border border-custom-border-200 rounded px-1 text-center bg-custom-background-100"
                                />
                              </td>
                              <td className="py-2 px-4">
                                {product.description}
                              </td>
                              <td className="py-2 px-4">
                                R${" "}
                                {(
                                  product.sell_price *
                                  (selectedProduct?.quantity || 1)
                                ).toFixed(2)}
                              </td>
                              <td className="py-2 px-4 text-center">
                                <button
                                  onClick={() => removeProduct(product.id)}
                                >
                                  <X className="h-4 w-4 text-red-500 cursor-pointer hover:text-red-700" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  <div className="py-2 px-4 text-sm text-right bg-custom-background-100 flex justify-between">
                    <p>Total:</p>
                    <p>R$ {totalPrice.toFixed(2)}</p>
                  </div>

                  <div className="py-2 px-4 text-sm text-right bg-custom-background-100 flex justify-between">
                    <p>Lucro Total:</p>
                    <p>R$ {totalProfit.toFixed(2)}</p>
                  </div>
                </div>
              ) : (
                <div
                  className="border border-t-0 rounded shadow-sm -mt-1 border-custom-border-200"
                  style={{
                    height: "300px",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <p className="m-auto text-custom-text-400">
                    Nenhum produto selecionado.
                  </p>
                </div>
              )}
            </>
          )}
        </>
      </div>
    );
  }
);
