import React, { useState } from 'react';
import { Truck, Package, Activity, BarChart3, TrendingUp, AlertTriangle, RefreshCw, Clock, ShieldCheck, ArrowRight } from 'lucide-react';
import { soundFx } from '../../utils/soundEffects';

export const LogisticsApp: React.FC = () => {
  // Interactive Inventory Safety Stock Calculator state
  const [dailyDemand, setDailyDemand] = useState<number>(50);
  const [leadTimeDays, setLeadTimeDays] = useState<number>(7);
  const [safetyFactor, setSafetyFactor] = useState<number>(1.65); // 95% service level

  // Calculations
  const baseDemandLeadTime = dailyDemand * leadTimeDays;
  const safetyStock = Math.ceil(Math.sqrt(leadTimeDays) * dailyDemand * 0.25 * safetyFactor);
  const reorderPoint = baseDemandLeadTime + safetyStock;

  const handleRecalculate = () => {
    try { soundFx.playClick(); } catch (e) {}
  };

  return (
    <div className="space-y-4 font-sans text-gray-900 select-none max-w-4xl mx-auto">
      {/* Retro Directory Header */}
      <div className="bg-[#c0c0c0] p-2 border-2 border-white border-r-gray-800 border-b-gray-800 flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-2 font-bold">
          <Truck className="w-4 h-4 text-blue-900" />
          <span className="text-blue-950 font-bold">C:\MATEUS\LOGISTICA_SUPPLY_CHAIN.EXE</span>
        </div>
        <span className="text-[11px] text-gray-700">MÓDULO DE GESTÃO QUANTITATIVA</span>
      </div>

      {/* App Banner */}
      <div className="bg-[#F5F4ED] p-4 border-2 border-gray-400 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#000080] border-2 border-white border-r-gray-800 border-b-gray-800 text-white">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-blue-950 font-mono">PAINEL DE LOGÍSTICA & SUPPLY CHAIN</h1>
            <p className="text-xs text-gray-800">Gestão de Estoques, Indicadores (KPIs) e Eficiência Operacional</p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-[#ECE9D8] border-2 border-white border-r-gray-800 border-b-gray-800 text-blue-950 px-3 py-1 text-xs font-mono font-bold">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-900" />
          <span>PAINEL CORPORATIVO</span>
        </div>
      </div>

      {/* KPI Overview Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-[#ECE9D8] p-3 border-2 border-white border-r-gray-800 border-b-gray-800 space-y-1">
          <div className="flex justify-between items-center text-xs text-gray-700 font-mono">
            <span>OTIF (On-Time)</span>
            <TrendingUp className="w-4 h-4 text-emerald-800" />
          </div>
          <div className="text-2xl font-bold text-blue-950 font-mono">97.8%</div>
          <div className="text-[10px] text-emerald-900 font-mono font-bold">+2.1% vs mês anterior</div>
        </div>

        <div className="bg-[#ECE9D8] p-3 border-2 border-white border-r-gray-800 border-b-gray-800 space-y-1">
          <div className="flex justify-between items-center text-xs text-gray-700 font-mono">
            <span>Giro Estoque</span>
            <Activity className="w-4 h-4 text-blue-800" />
          </div>
          <div className="text-2xl font-bold text-blue-950 font-mono">12.4x</div>
          <div className="text-[10px] text-blue-900 font-mono font-bold">Meta anual: 12.0x</div>
        </div>

        <div className="bg-[#ECE9D8] p-3 border-2 border-white border-r-gray-800 border-b-gray-800 space-y-1">
          <div className="flex justify-between items-center text-xs text-gray-700 font-mono">
            <span>Lead Time</span>
            <Clock className="w-4 h-4 text-amber-800" />
          </div>
          <div className="text-2xl font-bold text-blue-950 font-mono">3.2 Dias</div>
          <div className="text-[10px] text-amber-900 font-mono font-bold">-0.5 dias de redução</div>
        </div>

        <div className="bg-[#ECE9D8] p-3 border-2 border-white border-r-gray-800 border-b-gray-800 space-y-1">
          <div className="flex justify-between items-center text-xs text-gray-700 font-mono">
            <span>Acurácia WMS</span>
            <Package className="w-4 h-4 text-purple-800" />
          </div>
          <div className="text-2xl font-bold text-blue-950 font-mono">99.4%</div>
          <div className="text-[10px] text-purple-900 font-mono font-bold">Contagem cíclica em dia</div>
        </div>
      </div>

      {/* Interactive Safety Stock & Reorder Point Calculator */}
      <div className="bg-[#F5F4ED] p-4 border-2 border-gray-400 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b-2 border-yellow-700">
          <h2 className="text-sm font-bold text-blue-950 font-mono flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-blue-900" />
            <span>SIMULADOR DE PONTO DE PEDIDO & ESTOQUE DE SEGURANÇA</span>
          </h2>
          <span className="text-xs text-emerald-900 font-mono font-bold">Cálculo Quantitativo</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-mono font-bold text-gray-900">Demanda Média Diária (unid/dia):</label>
            <input
              type="number"
              value={dailyDemand}
              onChange={(e) => setDailyDemand(Number(e.target.value))}
              className="w-full bg-white text-gray-900 px-3 py-1.5 border-2 border-gray-500 border-r-white border-b-white text-xs focus:outline-none font-mono font-bold"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-mono font-bold text-gray-900">Lead Time do Fornecedor (dias):</label>
            <input
              type="number"
              value={leadTimeDays}
              onChange={(e) => setLeadTimeDays(Number(e.target.value))}
              className="w-full bg-white text-gray-900 px-3 py-1.5 border-2 border-gray-500 border-r-white border-b-white text-xs focus:outline-none font-mono font-bold"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-mono font-bold text-gray-900">Nível de Serviço Desejado:</label>
            <select
              value={safetyFactor}
              onChange={(e) => setSafetyFactor(Number(e.target.value))}
              className="w-full bg-white text-gray-900 px-3 py-1.5 border-2 border-gray-500 border-r-white border-b-white text-xs focus:outline-none font-mono font-bold"
            >
              <option value={1.28}>90% (Fator Z: 1.28)</option>
              <option value={1.65}>95% (Fator Z: 1.65)</option>
              <option value={2.33}>99% (Fator Z: 2.33)</option>
            </select>
          </div>
        </div>

        {/* Results output box */}
        <div className="bg-[#ECE9D8] p-4 border-2 border-white border-r-gray-800 border-b-gray-800 grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
          <div className="space-y-0.5">
            <span className="text-gray-700">Consumo em Lead Time:</span>
            <div className="text-base font-bold text-blue-950">{baseDemandLeadTime} unid.</div>
          </div>

          <div className="space-y-0.5">
            <span className="text-gray-700">Estoque de Segurança:</span>
            <div className="text-base font-bold text-amber-950">{safetyStock} unid.</div>
          </div>

          <div className="space-y-0.5">
            <span className="text-gray-700">Ponto de Pedido (ROP):</span>
            <div className="text-base font-bold text-emerald-950">{reorderPoint} unid.</div>
          </div>
        </div>
      </div>

      {/* Logistics Process Pipeline */}
      <div className="bg-[#F5F4ED] p-4 border-2 border-gray-400 shadow-xs space-y-3">
        <h3 className="text-xs font-bold text-blue-950 font-mono uppercase">Cadeia de Valor do Processo Logístico</h3>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-center">
          <div className="bg-[#ECE9D8] p-3 border-2 border-white border-r-gray-800 border-b-gray-800 space-y-1">
            <span className="text-[10px] font-mono text-blue-900 font-bold">01. RECEBIMENTO</span>
            <p className="text-xs text-gray-900 font-bold">Conferência & WMS</p>
          </div>
          <div className="bg-[#ECE9D8] p-3 border-2 border-white border-r-gray-800 border-b-gray-800 space-y-1">
            <span className="text-[10px] font-mono text-blue-900 font-bold">02. ARMAZENAGEM</span>
            <p className="text-xs text-gray-900 font-bold">Endereçamento & Curva ABC</p>
          </div>
          <div className="bg-[#ECE9D8] p-3 border-2 border-white border-r-gray-800 border-b-gray-800 space-y-1">
            <span className="text-[10px] font-mono text-blue-900 font-bold">03. EXPEDIÇÃO</span>
            <p className="text-xs text-gray-900 font-bold">Picking, Packing & OTIF</p>
          </div>
          <div className="bg-[#ECE9D8] p-3 border-2 border-white border-r-gray-800 border-b-gray-800 space-y-1">
            <span className="text-[10px] font-mono text-blue-900 font-bold">04. TRANSPORTE</span>
            <p className="text-xs text-gray-900 font-bold">Roteirização & Last Mile</p>
          </div>
        </div>
      </div>

      {/* Retro Status Bar */}
      <div className="bg-[#c0c0c0] p-1.5 border-bevel-in text-[11px] font-mono text-gray-800 flex items-center justify-between">
        <span>STATUS: SISTEMA DE SUPPLY CHAIN OPERACIONAL</span>
        <span>MATEUS OS 2000</span>
      </div>
    </div>
  );
};
