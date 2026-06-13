'use client'

import React, { useState, useMemo } from 'react'
import { useAuthStore } from '@/lib/store/auth'
import { useMockDb } from '@/lib/store/mockDb'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import StarRating from '@/components/ui/StarRating'
import { LAGOS_LGAS } from '@/lib/validation'
import { 
  Camera, 
  Plus, 
  X, 
  MapPin, 
  Calendar, 
  Clock, 
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { toast } from 'sonner'

export default function ArtisanProfileEditor() {
  const { user } = useAuthStore()
  const { artisans, updateArtisan } = useMockDb()

  const artisan = useMemo(() => {
    return artisans.find(a => a.id === user?.id)
  }, [artisans, user])

  // Profile Form States
  const [bioText, setBioText] = useState(artisan?.bio || '')
  const [skillInput, setSkillInput] = useState('')
  const [skillsList, setSkillsList] = useState<string[]>(artisan?.skills || [])
  const [selectedLGAs, setSelectedLGAs] = useState<string[]>(['Surulere', 'Yaba'])
  const [weeklySchedule, setWeeklySchedule] = useState({
    Mon: { active: true, hours: '9am - 6pm' },
    Tue: { active: true, hours: '9am - 6pm' },
    Wed: { active: true, hours: '9am - 6pm' },
    Thu: { active: true, hours: '9am - 6pm' },
    Fri: { active: true, hours: '9am - 6pm' },
    Sat: { active: true, hours: '9am - 4pm' },
    Sun: { active: false, hours: 'Closed' }
  })

  // Completeness calculation
  const completeness = useMemo(() => {
    let score = 30 // base registration
    if (bioText.length > 50) score += 20
    if (skillsList.length >= 3) score += 20
    if (selectedLGAs.length >= 2) score += 15
    if (artisan && artisan.portfolio.length >= 3) score += 15
    return Math.min(100, score)
  }, [bioText, skillsList, selectedLGAs, artisan])

  const handleSaveBio = () => {
    if (user?.id) {
      updateArtisan(user.id, { bio: bioText })
      toast.success('Bio description updated successfully!')
    }
  }

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault()
    const sk = skillInput.trim()
    if (!sk) return
    if (skillsList.includes(sk)) {
      toast.error('Skill tag already added')
      return
    }
    const newList = [...skillsList, sk]
    setSkillsList(newList)
    setSkillInput('')
    
    if (user?.id) {
      updateArtisan(user.id, { skills: newList })
    }
  }

  const handleRemoveSkill = (tag: string) => {
    const newList = skillsList.filter(s => s !== tag)
    setSkillsList(newList)
    if (user?.id) {
      updateArtisan(user.id, { skills: newList })
    }
  }

  const handleToggleLGA = (lga: string) => {
    let nextList = []
    if (selectedLGAs.includes(lga)) {
      nextList = selectedLGAs.filter(l => l !== lga)
    } else {
      nextList = [...selectedLGAs, lga]
    }
    setSelectedLGAs(nextList)
    toast.success('Service area coverage updated.')
  }

  const handleScheduleToggle = (day: string) => {
    setWeeklySchedule((prev: any) => {
      const current = prev[day]
      return {
        ...prev,
        [day]: { ...current, active: !current.active }
      }
    })
    toast.success('Availability schedule saved.')
  }

  return (
    <div className="w-full flex-grow grid grid-cols-1 desktop:grid-cols-12 gap-8 animate-fade-in select-none">
      
      {/* LEFT COLUMN: EDITOR SECTIONS (60% or 7 cols) */}
      <main className="desktop:col-span-8 flex flex-col gap-6">
        
        {/* Title */}
        <div>
          <h1 className="text-h1 text-navy">Profile Editor</h1>
          <p className="font-body text-[14px] text-slate mt-0.5">Customize your service profile details seen by customers.</p>
        </div>

        {/* Completeness Bar */}
        <div className="bg-white rounded-card border border-border p-5 shadow-card select-none">
          <div className="flex justify-between items-center font-mono text-[12px] font-bold text-navy mb-2">
            <span>Vetting profile completeness</span>
            <span>{completeness}%</span>
          </div>
          <div className="w-full h-3 bg-border rounded-full overflow-hidden">
            <div className="h-full bg-teal transition-all duration-500" style={{ width: `${completeness}%` }} />
          </div>
          {completeness < 100 && (
            <p className="font-mono text-[10px] text-slate mt-2">
              💡 Tip: Add more detailed skills and complete portfolio photos to reach 100%.
            </p>
          )}
        </div>

        {/* 1. Public Bio Description */}
        <div className="bg-white rounded-card border border-border p-6 shadow-card flex flex-col gap-4">
          <h3 className="font-display font-bold text-[15px] text-navy border-b border-border pb-2">
            1. Service bio introduction
          </h3>
          <textarea
            value={bioText}
            onChange={(e) => setBioText(e.target.value)}
            rows={4}
            className="w-full rounded-btn border border-border bg-white px-4 py-3 font-mono text-[13px] focus:outline-none focus:border-teal"
            placeholder="Write details about your experience, training and prompt responses..."
          />
          <div className="flex justify-between items-center select-none font-mono text-[11px] text-slate">
            <span>{bioText.length} characters</span>
            <Button variant="primary" size="sm" onClick={handleSaveBio}>
              Save Bio
            </Button>
          </div>
        </div>

        {/* 2. Skills tags manager */}
        <div className="bg-white rounded-card border border-border p-6 shadow-card flex flex-col gap-4">
          <h3 className="font-display font-bold text-[15px] text-navy border-b border-border pb-2">
            2. Manage trade skills tags
          </h3>
          <form onSubmit={handleAddSkill} className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. Copper pipes, Drain flush"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              className="flex-1 h-10 border border-border rounded-btn px-4 font-mono text-[13px] focus:outline-none focus:border-teal"
            />
            <Button type="submit" variant="secondary" size="sm">
              Add Tag
            </Button>
          </form>

          {/* Tag chips */}
          <div className="flex flex-wrap gap-2 mt-2 select-none">
            {skillsList.map((tag) => (
              <span 
                key={tag}
                className="bg-lgray text-navy border border-border font-mono text-[12px] pl-3 pr-1 py-1 rounded-full flex items-center gap-1.5"
              >
                <span>{tag}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(tag)}
                  className="p-0.5 hover:bg-border rounded-full text-slate"
                >
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* 3. Coverage LGAs map selector */}
        <div className="bg-white rounded-card border border-border p-6 shadow-card flex flex-col gap-4">
          <h3 className="font-display font-bold text-[15px] text-navy border-b border-border pb-2">
            3. Service area coverage (LGAs)
          </h3>
          <p className="font-body text-[13px] text-slate leading-relaxed select-none">
            Toggle areas in Lagos you are willing to accept dispatch requests for.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 select-none">
            {['Surulere', 'Yaba', 'Ikeja', 'Kosofe', 'Mainland', 'Lekki', 'Apapa', 'Mushin'].map((lga) => {
              const active = selectedLGAs.includes(lga)
              return (
                <button
                  key={lga}
                  type="button"
                  onClick={() => handleToggleLGA(lga)}
                  className={`p-2.5 rounded-btn border font-mono text-[12px] text-center transition-all focus:outline-none
                    ${active 
                      ? 'bg-teal border-teal text-white font-bold' 
                      : 'bg-white border-border text-navy hover:border-teal hover:text-teal'}`}
                >
                  {lga}
                </button>
              )
            })}
          </div>
        </div>

        {/* 4. Weekly schedule schedule */}
        <div className="bg-white rounded-card border border-border p-6 shadow-card flex flex-col gap-4 select-none">
          <h3 className="font-display font-bold text-[15px] text-navy border-b border-border pb-2">
            4. Weekly schedule schedule
          </h3>
          
          <div className="flex flex-col gap-3 font-mono text-[13px]">
            {Object.entries(weeklySchedule).map(([day, val]) => (
              <div key={day} className="flex justify-between items-center border-b border-border/50 pb-2">
                <span className="font-bold w-12">{day}</span>
                <span className="text-slate">{val.hours}</span>
                <button
                  onClick={() => handleScheduleToggle(day)}
                  className={`w-10 h-6 rounded-full p-0.5 transition-colors focus:outline-none ${
                    val.active ? 'bg-teal' : 'bg-slate/40'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white shadow transform duration-200 ${
                    val.active ? 'translate-x-4' : 'translate-x-0'
                  }`} />
                </button>
              </div>
            ))}
          </div>
        </div>

      </main>

      {/* RIGHT COLUMN: PREVIEW PROFILE AS CUSTOMER SEE IT */}
      {artisan && (
        <aside className="desktop:col-span-4 bg-white border border-border rounded-card p-5 shadow-card sticky top-[80px] self-start flex flex-col gap-4">
          <div className="border-b border-border pb-2 flex justify-between items-center select-none font-mono text-[10px] font-bold text-slate uppercase">
            <span>Public profile Preview</span>
            <span className="w-2 h-2 rounded-full bg-teal animate-pulse" />
          </div>

          <div className="flex flex-col items-center text-center p-2">
            <img
              src={artisan.portfolio[0]?.url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'}
              alt={artisan.name}
              className="w-16 h-16 rounded-full object-cover border"
            />
            <h4 className="font-display font-bold text-[15px] text-navy mt-3 leading-none">{artisan.name}</h4>
            <p className="font-mono text-[11px] text-slate mt-1">{artisan.trade} · {artisan.area}</p>
            <div className="mt-1.5 select-none">
              <StarRating rating={artisan.rating} />
            </div>
          </div>

          <div className="bg-lgray/30 p-3 rounded text-[12px] font-mono text-slate border leading-relaxed select-text">
            <p className="font-bold text-navy text-[10px] uppercase mb-1">Public Bio Description:</p>
            <p className="font-body italic font-normal">"{bioText}"</p>
          </div>

          <div>
            <p className="font-mono text-[10px] font-bold text-slate uppercase mb-1.5">Trade Skills Tags ({skillsList.length}):</p>
            <div className="flex flex-wrap gap-1.5 select-none">
              {skillsList.map((tag) => (
                <span key={tag} className="bg-lgray text-body font-mono text-[10px] border px-2 py-0.5 rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </aside>
      )}

    </div>
  )
}
