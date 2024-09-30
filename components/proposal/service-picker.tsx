"use client";

import * as React from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
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
import { AddServiceDialog } from "../service/add/dialog";

// Simulando alguns serviços como exemplo.
const services = [
    { value: "service-1", label: "Instalação de Câmeras", quantity: 1, price: 300.0 },
    { value: "service-2", label: "Manutenção de Equipamentos", quantity: 1, price: 150.0 },
    { value: "service-3", label: "Monitoramento Mensal", quantity: 1, price: 100.0 },
    { value: "service-4", label: "Consultoria de Segurança", quantity: 1, price: 500.0 },
    { value: "service-5", label: "Serviço de Cablagem", quantity: 1, price: 200.0 },
    { value: "service-6", label: "Configuração de Equipamentos", quantity: 1, price: 250.0 },
    { value: "service-7", label: "Treinamento de Funcionários", quantity: 1, price: 180.0 },
    { value: "service-8", label: "Auditoria de Segurança", quantity: 1, price: 600.0 },
];

interface ServiceMultiSelectProps {
    onServicesChange: (services: { value: string; quantity: number }[]) => void;
    onTotalPriceChange: (total: number) => void;
    parentSelectedServices: { value: string; quantity: number }[];
}

export function ServiceMultiSelect({
    onServicesChange,
    onTotalPriceChange,
    parentSelectedServices,
}: ServiceMultiSelectProps) {
    const [open, setOpen] = React.useState(false);
    const [selectedServices, setSelectedServices] = React.useState<{ value: string; quantity: number }[]>(parentSelectedServices);

    // Atualizar o localStorage e informar o componente pai ao alterar os serviços
    React.useEffect(() => {
        localStorage.setItem("selectedServices", JSON.stringify(selectedServices));
        onServicesChange(selectedServices);
    }, [selectedServices, onServicesChange]);

    // Detalhes dos serviços selecionados
    const selectedServiceDetails = services.filter((service) =>
        selectedServices.some((selected) => selected.value === service.value)
    );

    // Calcula o total dos serviços selecionados
    const totalPrice = selectedServiceDetails.reduce((acc, service) => {
        const selectedService = selectedServices.find((item) => item.value === service.value);
        return acc + service.price * (selectedService?.quantity || 1);
    }, 0);

    // Atualizar o valor total no componente pai
    React.useEffect(() => {
        onTotalPriceChange(totalPrice);
    }, [totalPrice, onTotalPriceChange]);

    // Função para adicionar ou remover um serviço selecionado
    const toggleServiceSelection = (serviceValue: string) => {
        setSelectedServices((prev) =>
            prev.find((item) => item.value === serviceValue)
                ? prev.filter((item) => item.value !== serviceValue) // Remove se já estiver selecionado
                : [...prev, { value: serviceValue, quantity: 1 }] // Adiciona com quantidade inicial 1 se não estiver
        );
    };

    // Atualiza a quantidade de um serviço selecionado
    const updateServiceQuantity = (serviceValue: string, quantity: number) => {
        setSelectedServices((prev) =>
            prev.map((item) => (item.value === serviceValue ? { ...item, quantity } : item))
        );
    };

    // Remove um serviço específico da lista
    const removeService = (serviceValue: string) => {
        setSelectedServices((prev) => prev.filter((item) => item.value !== serviceValue));
    };

    return (
        <div className="w-full">
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between rounded-b-none">
                        {selectedServices.length > 0 ? `${selectedServices.length} serviço(s) selecionado(s)` : "Selecione os serviços..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[400px] p-0">
                    <Command>
                        <CommandInput placeholder="Buscar serviço..." />
                        <CommandList>
                            <CommandEmpty><AddServiceDialog/></CommandEmpty>
                            <CommandGroup>
                                {services.map((service) => (
                                    <CommandItem key={service.value} value={service.label} onSelect={() => toggleServiceSelection(service.value)}>
                                        <Check
                                            className={`mr-2 h-4 w-4 ${selectedServices.some((selected) => selected.value === service.value) ? "opacity-100" : "opacity-0"
                                                }`}
                                        />
                                        {service.label}
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>

            {/* Exibição dos serviços selecionados em formato de tabela */}
            {selectedServices.length > 0 ? (
                <div className="border border-t-0 rounded shadow-sm -mt-1" style={{ height: "300px", display: "flex", flexDirection: "column" }}>
                    <div style={{ flexGrow: 1, overflowY: "auto" }}>
                        <table className="min-w-full text-sm">
                            <thead className="bg-custom-background-100 text-slate-700 sticky top-0">
                                <tr>
                                    <th className="py-2 px-4 text-left">Qntd</th>
                                    <th className="py-2 px-4 text-left">Descrição</th>
                                    <th className="py-2 px-4 text-left">Valor</th>
                                    <th className="py-2 px-4 text-left">Remover</th>
                                </tr>
                            </thead>
                            <tbody>
                                {selectedServiceDetails.map((service) => {
                                    const selectedService = selectedServices.find((item) => item.value === service.value);
                                    return (
                                        <tr key={service.value} className="border-b">
                                            <td className="py-2 px-4">
                                                <input
                                                    type="number"
                                                    min={1}
                                                    value={selectedService?.quantity ?? 1}
                                                    onChange={(e) => updateServiceQuantity(service.value, parseInt(e.target.value, 10) || 1)}
                                                    className="w-16 border rounded px-1 text-center bg-custom-background-100"
                                                />
                                            </td>
                                            <td className="py-2 px-4">{service.label}</td>
                                            <td className="py-2 px-4">R$ {(service.price * (selectedService?.quantity || 1)).toFixed(2)}</td>
                                            <td className="py-2 px-4 text-center">
                                                <button onClick={() => removeService(service.value)}>
                                                    <X className="h-4 w-4 text-red-500 cursor-pointer hover:text-red-700" />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Exibir o total geral fixo abaixo da tabela */}
                    <div className="py-2 px-4 text-sm text-right bg-custom-background-100 flex justify-between">
                        <p>Total:</p>
                        <p>R$ {totalPrice.toFixed(2)}</p>
                    </div>
                </div>
            ) : (
                <div className="border border-t-0 rounded shadow-sm -mt-1" style={{ height: "300px", display: "flex", flexDirection: "column" }}>
                    <p className="m-auto text-gray-500">Nenhum serviço selecionado.</p>
                </div>
            )}
        </div>
    );
}