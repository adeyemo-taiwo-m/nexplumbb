'use client'

import React, { useState, useMemo } from 'react'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import Input from '@/components/ui/Input'
import NairaInput from '@/components/ui/NairaInput'
import { 
  Package, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  AlertCircle,
  Check
} from 'lucide-react'
import { toast } from 'sonner'

interface Product {
  id: string
  name: string
  category: 'plumbing' | 'electrical' | 'tiling' | 'carpentry'
  price: number
  stock: number
  sku: string
}

export default function SupplierProducts() {
  
  // Mock products state
  const [products, setProducts] = useState<Product[]>([
    { id: '1', name: '3/4-inch PVC Pressure Pipe (6m)', category: 'plumbing', price: 4500, stock: 85, sku: 'PVC-PP-34-6M' },
    { id: '2', name: 'Pegler 1/2-inch Brass Gate Valve', category: 'plumbing', price: 9500, stock: 18, sku: 'PEG-BGV-12' },
    { id: '3', name: 'Coleman 2.5mm Single Core Wire Blue (100m)', category: 'electrical', price: 35000, stock: 24, sku: 'COL-SCW-25-BL' },
    { id: '4', name: 'Schneider 12-Way Distribution Board', category: 'electrical', price: 68000, stock: 6, sku: 'SCH-DB-12W' },
    { id: '5', name: 'Dangote Portland Cement 42.5R (50kg)', category: 'tiling', price: 7800, stock: 150, sku: 'DAN-PC-50K' },
    { id: '6', name: 'Galvanized Roofing Nails 3-inch (Box)', category: 'carpentry', price: 11000, stock: 42, sku: 'GAL-RN-3I' }
  ])

  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [newName, setNewName] = useState('')
  const [newCategory, setNewCategory] = useState<'plumbing' | 'electrical' | 'tiling' | 'carpentry'>('plumbing')
  const [newPrice, setNewPrice] = useState(1000)
  const [newStock, setNewStock] = useState(10)
  
  // Inline edit state
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editPrice, setEditPrice] = useState(0)
  const [editStock, setEditStock] = useState(0)

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.sku.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCat = categoryFilter === 'all' || p.category === categoryFilter
      return matchesSearch && matchesCat
    })
  }, [products, searchTerm, categoryFilter])

  const handleAddProduct = () => {
    if (!newName.trim()) {
      toast.error('Product name is required.')
      return
    }

    const newProd: Product = {
      id: `P-${Date.now()}`,
      name: newName.trim(),
      category: newCategory,
      price: newPrice,
      stock: newStock,
      sku: `${newCategory.slice(0,3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`
    }

    setProducts([newProd, ...products])
    setIsAddModalOpen(false)
    
    // Reset values
    setNewName('')
    setNewPrice(1000)
    setNewStock(10)

    toast.success('Product catalog updated.', {
      description: `Material item "${newProd.name}" listed successfully.`
    })
  }

  const handleStartEdit = (p: Product) => {
    setEditingId(p.id)
    setEditPrice(p.price)
    setEditStock(p.stock)
  }

  const handleSaveEdit = (id: string) => {
    setProducts(products.map(p => 
      p.id === id ? { ...p, price: editPrice, stock: editStock } : p
    ))
    setEditingId(null)
    toast.success('Product stock metrics updated.')
  }

  const handleDeleteProduct = (id: string, name: string) => {
    setProducts(products.filter(p => p.id !== id))
    toast.warning(`Product deleted: ${name}`)
  }

  return (
    <div className="w-full flex flex-col gap-6 animate-fade-in select-none text-left">
      
      {/* Header */}
      <div className="flex justify-between items-center border-b border-border pb-4 flex-wrap gap-4">
        <div>
          <h1 className="text-h1 text-navy font-display font-semibold">Products Catalog</h1>
          <p className="font-body text-[14px] text-slate mt-0.5">
            Manage material items, adjust bulk prices, and update warehousing stock levels.
          </p>
        </div>
        
        <div>
          <Button 
            variant="primary" 
            size="sm"
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1 font-display"
          >
            <Plus size={16} /> List New Material
          </Button>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-card border border-border p-4 shadow-card flex flex-col sm:flex-row justify-between gap-4">
        
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate" />
          <input
            type="text"
            placeholder="Search products, SKUs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-10 w-full rounded-btn border border-border bg-white pl-9 pr-4 font-mono text-[12px] text-body placeholder:text-slate focus:outline-none focus:border-teal"
          />
        </div>

        {/* Category filter */}
        <div className="flex items-center gap-2 font-mono text-[12px]">
          <span className="font-bold text-navy uppercase">Category:</span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="h-10 border border-border bg-white rounded-btn px-3 text-body focus:outline-none focus:border-teal"
          >
            <option value="all">All Materials</option>
            <option value="plumbing">Plumbing</option>
            <option value="electrical">Electrical</option>
            <option value="tiling">Tiling</option>
            <option value="carpentry">Carpentry</option>
          </select>
        </div>

      </div>

      {/* Catalog Table */}
      <div className="bg-white rounded-card border border-border shadow-card overflow-hidden">
        {filteredProducts.length === 0 ? (
          <p className="text-center py-12 font-body text-[14px] text-slate">No products listed.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse font-mono text-[13px] text-left">
              <thead>
                <tr className="bg-lgray border-b border-border text-[11px] text-slate font-bold uppercase tracking-wider">
                  <th className="py-3 px-4 font-display">Material Item</th>
                  <th className="py-3 px-4 font-display">SKU Code</th>
                  <th className="py-3 px-4 font-display">Category</th>
                  <th className="py-3 px-4 font-display text-right">Unit Price</th>
                  <th className="py-3 px-4 text-center font-display">Warehouse Stock</th>
                  <th className="py-3 px-4 text-center font-display">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((p) => {
                  const isEditing = editingId === p.id
                  return (
                    <tr 
                      key={p.id} 
                      className="border-b border-border/50 hover:bg-nxblue/5 odd:bg-white even:bg-lgray/30 transition-colors"
                    >
                      <td className="py-3 px-4 font-display font-semibold text-navy text-[14px]">{p.name}</td>
                      <td className="py-3 px-4">{p.sku}</td>
                      <td className="py-3 px-4 font-medium uppercase text-[10px] text-slate">{p.category}</td>
                      <td className="py-3 px-4 text-right">
                        {isEditing ? (
                          <input
                            type="number"
                            value={editPrice}
                            onChange={(e) => setEditPrice(parseInt(e.target.value) || 0)}
                            className="h-8 w-24 border rounded px-2 text-right font-mono text-[12px] focus:outline-none focus:border-teal"
                          />
                        ) : (
                          <span className="font-bold text-navy">₦{p.price.toLocaleString()}</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {isEditing ? (
                          <input
                            type="number"
                            value={editStock}
                            onChange={(e) => setEditStock(parseInt(e.target.value) || 0)}
                            className="h-8 w-16 border rounded text-center font-mono text-[12px] focus:outline-none focus:border-teal"
                          />
                        ) : (
                          <span className={`font-bold ${p.stock <= 5 ? 'text-red-600' : p.stock <= 15 ? 'text-amber-dark' : 'text-teal'}`}>
                            {p.stock} units
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {isEditing ? (
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => handleSaveEdit(p.id)}
                              className="text-teal hover:text-teal/80 font-bold"
                              title="Save Changes"
                            >
                              <Check size={16} />
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="text-slate hover:text-navy font-bold"
                              title="Cancel"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="flex justify-center gap-3">
                            <button
                              onClick={() => handleStartEdit(p)}
                              className="text-nxblue hover:underline font-bold"
                              title="Edit item metrics"
                            >
                              <Edit size={14} className="inline" /> Edit
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(p.id, p.name)}
                              className="text-red-600 hover:underline font-bold"
                              title="Remove item"
                            >
                              <Trash2 size={14} className="inline" /> Delete
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Product Modal */}
      {isAddModalOpen && (
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title="List New Store Material Item"
          footerActions={
            <>
              <Button variant="secondary" onClick={() => setIsAddModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleAddProduct}>
                List Product Item
              </Button>
            </>
          }
        >
          <div className="flex flex-col gap-4 font-mono text-[13px] text-navy text-left">
            <Input
              label="Material Item Name"
              placeholder="e.g. 1/2-inch PPR Hot Water Pipe (Green)"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-mono text-[11px] font-bold text-slate mb-1 block uppercase">Material Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="h-12 w-full rounded-btn border border-border bg-white px-4 font-mono text-[13px] text-body focus:outline-none focus:border-teal"
                >
                  <option value="plumbing">Plumbing</option>
                  <option value="electrical">Electrical</option>
                  <option value="tiling">Tiling</option>
                  <option value="carpentry">Carpentry</option>
                </select>
              </div>

              <div>
                <label className="font-mono text-[11px] font-bold text-slate mb-1.5 block uppercase tracking-wide">Starting Stock Inventory</label>
                <input
                  type="number"
                  value={newStock}
                  onChange={(e) => setNewStock(parseInt(e.target.value) || 0)}
                  className="h-12 w-full rounded-btn border border-border px-4 font-mono text-[14px]"
                />
              </div>
            </div>

            <div>
              <label className="font-mono text-[11px] font-bold text-slate mb-1.5 block uppercase tracking-wide">Unit Retail Price (₦)</label>
              <input
                type="number"
                value={newPrice}
                onChange={(e) => setNewPrice(parseInt(e.target.value) || 0)}
                className="h-12 w-full rounded-btn border border-border px-4 font-mono text-[14px]"
              />
            </div>
          </div>
        </Modal>
      )}

    </div>
  )
}
