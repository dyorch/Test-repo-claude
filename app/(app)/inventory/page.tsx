'use client';
import { useState } from 'react';
import { useApp } from '@/contexts/app-context';
import { formatDate } from '@/lib/utils';

type InvTab = 'items' | 'purchases';

export default function InventoryPage() {
  const { inventoryItems, inventoryPurchases, addInventoryItem, updateInventoryItem, addInventoryPurchase, role } = useApp();
  const [tab, setTab] = useState<InvTab>('items');
  const [showItemForm, setShowItemForm] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [showAddPurchase, setShowAddPurchase] = useState(false);

  // Item form (used for both add and edit)
  const [itemName, setItemName] = useState('');
  const [itemUnit, setItemUnit] = useState('unidades');
  const [itemStock, setItemStock] = useState(0);
  const [itemMin, setItemMin] = useState(0);

  // New purchase form
  const [purItemId, setPurItemId] = useState('');
  const [purQty, setPurQty] = useState(0);
  const [purDate, setPurDate] = useState(new Date().toISOString().split('T')[0]);
  const [purNotes, setPurNotes] = useState('');

  if (role !== 'admin') {
    return (
      <div className="p-6 text-center">
        <p className="text-slate-500 text-sm">Solo el recepcionista puede acceder al inventario.</p>
      </div>
    );
  }

  function openAddItem() {
    setEditingItemId(null);
    setItemName(''); setItemUnit('unidades'); setItemStock(0); setItemMin(0);
    setShowItemForm(true);
  }

  function openEditItem(itemId: string) {
    const item = inventoryItems.find(i => i.id === itemId);
    if (!item) return;
    setEditingItemId(itemId);
    setItemName(item.name);
    setItemUnit(item.unit);
    setItemStock(item.currentStock);
    setItemMin(item.minStock);
    setShowItemForm(true);
  }

  function closeItemForm() {
    setShowItemForm(false);
    setEditingItemId(null);
  }

  function handleItemSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (editingItemId) {
      updateInventoryItem({
        id: editingItemId,
        name: itemName,
        unit: itemUnit,
        currentStock: itemStock,
        minStock: itemMin,
      });
    } else {
      addInventoryItem({ name: itemName, unit: itemUnit, currentStock: itemStock, minStock: itemMin });
    }
    closeItemForm();
  }

  function handleAddPurchase(e: React.FormEvent) {
    e.preventDefault();
    addInventoryPurchase({ itemId: purItemId, quantity: purQty, date: purDate, notes: purNotes });
    setShowAddPurchase(false);
    setPurItemId(''); setPurQty(0); setPurNotes(''); setPurDate(new Date().toISOString().split('T')[0]);
  }

  const lowStockCount = inventoryItems.filter(i => i.currentStock < i.minStock).length;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Inventario</h1>
          <p className="text-slate-500 text-sm mt-0.5">Control de insumos y compras</p>
        </div>
        {lowStockCount > 0 && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm font-medium">
            ⚠ {lowStockCount} producto{lowStockCount !== 1 ? 's' : ''} con stock bajo
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-0 border-b border-slate-200 mb-6">
        {[
          { id: 'items' as const, label: 'Productos', count: inventoryItems.length },
          { id: 'purchases' as const, label: 'Historial compras', count: inventoryPurchases.length },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${tab === t.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            {t.label}
            <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${tab === t.id ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500'}`}>
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {/* Items */}
      {tab === 'items' && (
        <div className="space-y-4">
          <div className="flex justify-end gap-2">
            <button onClick={() => setShowAddPurchase(true)} className="px-3 py-1.5 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium">
              + Registrar compra
            </button>
            <button onClick={openAddItem} className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
              + Nuevo producto
            </button>
          </div>

          {showItemForm && (
            <form onSubmit={handleItemSubmit} className={`bg-white rounded-xl border p-5 space-y-3 ${editingItemId ? 'border-amber-200' : 'border-blue-200'}`}>
              <h3 className="font-semibold text-slate-800 text-sm">
                {editingItemId ? 'Editar producto' : 'Nuevo producto'}
              </h3>
              <div className="grid md:grid-cols-2 gap-3">
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-slate-600 mb-1">Nombre del producto</label>
                  <input required value={itemName} onChange={e => setItemName(e.target.value)}
                    placeholder="Ej. Agujas de acupuntura"
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Unidad</label>
                  <select value={itemUnit} onChange={e => setItemUnit(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                    <option value="unidades">unidades</option>
                    <option value="rollos">rollos</option>
                    <option value="cajas">cajas</option>
                    <option value="paquetes">paquetes</option>
                    <option value="litros">litros</option>
                    <option value="frascos">frascos</option>
                    <option value="pares">pares</option>
                    <option value="kg">kg</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Stock actual
                      {editingItemId && <span className="text-amber-600 ml-1">(ajustar manualmente)</span>}
                    </label>
                    <input required type="number" value={itemStock} onChange={e => setItemStock(Number(e.target.value))}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Stock mínimo</label>
                    <input required type="number" value={itemMin} onChange={e => setItemMin(Number(e.target.value))}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>
              </div>
              {editingItemId && (
                <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                  💡 Usa este formulario cuando hagas un conteo físico del inventario. Para registrar una compra y sumar al stock, usa el botón "Registrar compra".
                </div>
              )}
              <div className="flex justify-end gap-2">
                <button type="button" onClick={closeItemForm} className="px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg">Cancelar</button>
                <button type="submit" className={`px-4 py-2 text-sm text-white rounded-lg font-medium ${editingItemId ? 'bg-amber-600 hover:bg-amber-700' : 'bg-blue-600 hover:bg-blue-700'}`}>
                  {editingItemId ? 'Guardar cambios' : 'Crear'}
                </button>
              </div>
            </form>
          )}

          {showAddPurchase && (
            <form onSubmit={handleAddPurchase} className="bg-white rounded-xl border border-emerald-200 p-5 space-y-3">
              <h3 className="font-semibold text-slate-800 text-sm">Registrar compra</h3>
              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Producto</label>
                  <select required value={purItemId} onChange={e => setPurItemId(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                    <option value="">Seleccionar…</option>
                    {inventoryItems.map(i => <option key={i.id} value={i.id}>{i.name} ({i.unit})</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Cantidad</label>
                  <input required type="number" value={purQty || ''} onChange={e => setPurQty(Number(e.target.value))}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Fecha</label>
                  <input required type="date" value={purDate} onChange={e => setPurDate(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Notas (opcional)</label>
                  <input value={purNotes} onChange={e => setPurNotes(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowAddPurchase(false)} className="px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg">Cancelar</button>
                <button type="submit" className="px-4 py-2 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">Registrar</button>
              </div>
            </form>
          )}

          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Producto</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Unidad</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Stock actual</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Mínimo</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Estado</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {inventoryItems.map(item => {
                  const isLow = item.currentStock < item.minStock;
                  const isWarning = item.currentStock < item.minStock * 1.5 && !isLow;
                  return (
                    <tr key={item.id} className={`hover:bg-slate-50 transition-colors ${isLow ? 'bg-red-50/30' : ''}`}>
                      <td className="px-5 py-3 font-medium text-slate-800">{item.name}</td>
                      <td className="px-4 py-3 text-slate-600 text-xs">{item.unit}</td>
                      <td className="px-4 py-3 text-right font-bold text-lg text-slate-800">{item.currentStock}</td>
                      <td className="px-4 py-3 text-right text-slate-500">{item.minStock}</td>
                      <td className="px-4 py-3">
                        {isLow ? (
                          <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">Bajo stock</span>
                        ) : isWarning ? (
                          <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">Por agotarse</span>
                        ) : (
                          <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">OK</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => openEditItem(item.id)}
                          className="text-xs px-2.5 py-1 border border-slate-200 text-slate-600 rounded-lg hover:border-amber-400 hover:text-amber-700 hover:bg-amber-50 transition-colors font-medium"
                        >
                          Editar
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {inventoryItems.length === 0 && (
              <div className="px-5 py-12 text-center text-slate-400 text-sm">Sin productos en el inventario</div>
            )}
          </div>
        </div>
      )}

      {/* Purchases */}
      {tab === 'purchases' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Fecha</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Producto</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Cantidad</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Notas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {[...inventoryPurchases].sort((a, b) => b.date.localeCompare(a.date)).map(p => {
                const item = inventoryItems.find(i => i.id === p.itemId);
                return (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3 text-slate-700">{formatDate(p.date)}</td>
                    <td className="px-4 py-3 font-medium text-slate-800">{item?.name ?? '—'}</td>
                    <td className="px-4 py-3 text-right font-semibold text-emerald-600">+{p.quantity} {item?.unit}</td>
                    <td className="px-4 py-3 text-xs text-slate-500">{p.notes || '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {inventoryPurchases.length === 0 && (
            <div className="px-5 py-12 text-center text-slate-400 text-sm">Sin compras registradas</div>
          )}
        </div>
      )}
    </div>
  );
}
