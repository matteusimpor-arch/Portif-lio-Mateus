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
    soundFx.playClick();
  };

  return (
    <div className="space-y-6 font-sans-ui text-slate-200">
      {/* App Banner */}
      <div className="bg-slate-900/90 p-5 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-950 border border-blue-800 rounded-lg text-blue-400">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white font-vt323 text-2xl">PAINEL DE LOGÍSTICA & SUPPLY CHAIN</h1>
            <p className="text-xs text-slate-400">Gestão de Estoques, Indicadores (KPIs) e Eficiência Operacional</p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-blue-950/60 border border-blue-800 text-blue-300 px-3 py-1 rounded text-xs font-mono-code">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
          <span>PAINEL CORPORATIVO</span>
        </div>
      </div>

      {/* KPI Overview Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-2">
          <div className="flex justify-between items-center text-xs text-slate-400 font-mono-code">
            <span>OTIF (On-Time In-Full)</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono-code">97.8%</div>
          <div className="text-[10px] text-emerald-400 font-mono-code">+2.1% vs mês anterior</div>
        </div>

        <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-2">
          <div className="flex justify-between items-center text-xs text-slate-400 font-mono-code">
            <span>Giro de Estoque</span>
            <Activity className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono-code">12.4x</div>
          <div className="text-[10px] text-blue-400 font-mono-code">Meta anual: 12.0x</div>
        </div>

        <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-2">
          <div className="flex justify-between items-center text-xs text-slate-400 font-mono-code">
            <span>Lead Time Médio</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono-code">3.2 Dias</div>
          <div className="text-[10px] text-amber-400 font-mono-code">-0.5 dias de redução</div>
        </div>

        <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-2">
          <div className="flex justify-between items-center text-xs text-slate-400 font-mono-code">
            <span>Acurácia do WMS</span>
            <Package className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono-code">99.4%</div>
          <div className="text-[10px] text-purple-400 font-mono-code">Contagem cíclica em dia</div>
        </div>
      </div>

      {/* Interactive Safety Stock & Reorder Point Calculator */}
      <div className="bg-slate-900/80 p-5 rounded-xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <h2 className="text-base font-bold text-white font-vt323 text-xl flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-400" />
            <span>SIMULADOR DE PONTO DE PEDIDO & ESTOQUE DE SEGURANÇA</span>
          </h2>
          <span className="text-xs text-emerald-400 font-mono-code">Cálculo Quantitativo</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-mono-code text-slate-300">Demanda Média Diária (unid/dia):</label>
            <input
              type="number"
              value={dailyDemand}
              onChange={(e) => setDailyDemand(Number(e.target.value))}
              className="w-full bg-slate-950 text-slate-200 px-3 py-2 rounded border border-slate-800 text-xs focus:outline-none focus:border-blue-500 font-mono-code"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-mono-code text-slate-300">Lead Time do Fornecedor (dias):</label>
            <input
              type="number"
              value={leadTimeDays}
              onChange={(e) => setLeadTimeDays(Number(e.target.value))}
              className="w-full bg-slate-950 text-slate-200 px-3 py-2 rounded border border-slate-800 text-xs focus:outline-none focus:border-blue-500 font-mono-code"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-mono-code text-slate-300">Nível de Serviço Desejado:</label>
            <select
              value={safetyFactor}
              onChange={(e) => setSafetyFactor(Number(e.target.value))}
              className="w-full bg-slate-950 text-slate-200 px-3 py-2 rounded border border-slate-800 text-xs focus:outline-none focus:border-blue-500 font-mono-code"
            >
              <option value={1.28}>90% (Fator Z: 1.28)</option>
              <option value={1.65}>95% (Fator Z: 1.65)</option>
              <option value={2.33}>99% (Fator Z: 2.33)</option>
            </select>
          </div>
        </div>

        {/* Results output box */}
        <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono-code text-xs">
          <div className="space-y-0.5">
            <span className="text-slate-400">Consumo em Lead Time:</span>
            <div className="text-base font-bold text-white">{baseDemandLeadTime} unid.</div>
          </div>

          <div className="space-y-0.5">
            <span className="text-slate-400">Estoque de Segurança:</span>
            <div className="text-base font-bold text-amber-400">{safetyStock} unid.</div>
          </div>

          <div className="space-y-0.5">
            <span className="text-slate-400">Ponto de Pedido (ROP):</span>
            <div className="text-base font-bold text-emerald-400">{reorderPoint} unid.</div>
          </div>
        </div>
      </div>

      {/* Logistics Process Pipeline */}
      <div className="bg-slate-900/80 p-5 rounded-xl border border-slate-800 space-y-3">
        <h3 className="text-xs font-bold text-slate-400 font-mono-code uppercase">Cadeia de Valor do Processo Logístico</h3>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-center">
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1">
            <span className="text-[10px] font-mono-code text-blue-400 font-bold">01. RECEBIMENTO</span>
            <p className="text-xs text-slate-300 font-semibold">Conferência & WMS</p>
          </div>
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1">
            <span className="text-[10px] font-mono-code text-blue-400 font-bold">02. ARMAZENAGEM</span>
            <p className="text-xs text-slate-300 font-semibold">Endereçamento & Curva ABC</p>
          </div>
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1">
            <span className="text-[10px] font-mono-code text-blue-400 font-bold">03. EXPEDIÇÃO</span>
            <p className="text-xs text-slate-300 font-semibold">Picking, Packing & OTIF</p>
          </div>
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1">
            <span className="text-[10px] font-mono-code text-blue-400 font-bold">04. TRANSPORTE</span>
            <p className="text-xs text-slate-300 font-semibold">Roteirização & Last Mile</p>
          </div>
        </div>
      </div>
    </div>
  );
};
