"use client";

import { useRef, useEffect, useState } from "react";
import { Camera, Loader2, FileText, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import useFetch from "@/hooks/use-fetch";
import { scanReceipt } from "@/actions/transaction";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function ReceiptScanner({ onScanComplete }) {
  const fileInputRef = useRef(null);
  const [textInput, setTextInput] = useState("");
  const [activeTab, setActiveTab] = useState("foto");

  const {
    loading: scanReceiptLoading,
    fn: scanReceiptFn,
    data: scannedData,
  } = useFetch(scanReceipt);

  const handleReceiptScan = async (file) => {
    if (file.size > 5 * 1024 * 1024) {
      toast.error("O arquivo deve ter menos de 5MB");
      return;
    }

    await scanReceiptFn(file);
  };

  const handleTextScan = async () => {
    if (!textInput.trim()) {
      toast.error("Por favor, insira algum texto para processar");
      return;
    }

    // Criamos um Blob a partir do texto para simular um arquivo
    const blob = new Blob([textInput], { type: "text/plain" });
    const file = new File([blob], "texto-transacao.txt", { type: "text/plain" });
    
    await scanReceiptFn(file);
  };

  useEffect(() => {
    if (scannedData && !scanReceiptLoading) {
      onScanComplete(scannedData);
      toast.success("Dados processados com sucesso!");
      setTextInput(""); // Limpa o campo de texto após processamento bem-sucedido
    }
  }, [scanReceiptLoading, scannedData, onScanComplete]);

  return (
    <Card className="mb-6 border border-blue-100 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-normal text-blue-800">
          Assistente de Transações IA
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="foto">Digitalizar Nota Fiscal</TabsTrigger>
            <TabsTrigger value="texto">Descrever Transação</TabsTrigger>
          </TabsList>
          
          <TabsContent value="foto" className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Tire uma foto da nota fiscal ou recibo para extrair automaticamente os dados da transação.
            </p>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              capture="environment"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleReceiptScan(file);
              }}
            />
            <Button
              type="button"
              variant="outline"
              className="w-full h-10 bg-gradient-to-br from-blue-500 to-purple-600 hover:opacity-90 transition-opacity text-white hover:text-white"
              onClick={() => fileInputRef.current?.click()}
              disabled={scanReceiptLoading}
            >
              {scanReceiptLoading ? (
                <>
                  <Loader2 className="mr-2 animate-spin" />
                  <span>Processando imagem...</span>
                </>
              ) : (
                <>
                  <Camera className="mr-2" />
                  <span>Digitalizar Nota Fiscal</span>
                </>
              )}
            </Button>
          </TabsContent>
          
          <TabsContent value="texto" className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Descreva a transação em texto livre e nossa IA extrairá os dados automaticamente.
            </p>
            <Textarea
              placeholder="Exemplo: Compra de 500kg de celulose para fabricação de papel toalha interfolhado no valor de R$ 3.750,00 da fornecedora Suzano em 15/07/2023. Pagamento via transferência bancária, NF 12345."
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              className="min-h-[100px] border-blue-200 focus:border-blue-400"
              disabled={scanReceiptLoading}
            />
            <Button
              type="button"
              variant="outline"
              className="w-full h-10 bg-gradient-to-br from-green-500 to-teal-600 hover:opacity-90 transition-opacity text-white hover:text-white"
              onClick={handleTextScan}
              disabled={scanReceiptLoading || !textInput.trim()}
            >
              {scanReceiptLoading ? (
                <>
                  <Loader2 className="mr-2 animate-spin" />
                  <span>Processando texto...</span>
                </>
              ) : (
                <>
                  <Send className="mr-2" />
                  <span>Processar Descrição</span>
                </>
              )}
            </Button>
          </TabsContent>
        </Tabs>
        
        {scanReceiptLoading && (
          <div className="mt-4 p-3 bg-blue-50 rounded-md text-center">
            <Loader2 className="animate-spin h-5 w-5 mx-auto mb-2 text-blue-600" />
            <p className="text-sm text-blue-700">
              Nossa IA está analisando seus dados. Isso pode levar alguns segundos...
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
