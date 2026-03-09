"use client"

import { useState, useEffect } from "react"
import { PageHeader } from "@/components/layout/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Building2, MapPin, Clock, ChevronRight } from "lucide-react"
import Link from "next/link"

export default function EinstellungenPage() {
  const [org, setOrg] = useState<{ id: string; name: string; locations: { id: string; name: string; address: string | null }[] } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/organization")
      .then((r) => r.json())
      .then((r) => {
        setOrg(r.data)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="container py-4">
        <PageHeader title="Einstellungen" />
        <div className="space-y-4">
          <div className="h-32 animate-pulse rounded-lg bg-muted" />
          <div className="h-32 animate-pulse rounded-lg bg-muted" />
        </div>
      </div>
    )
  }

  if (!org) {
    return (
      <div className="container py-4">
        <PageHeader title="Einstellungen" />
        <p className="text-muted-foreground">Kein Betrieb angelegt.</p>
      </div>
    )
  }

  return (
    <div className="container py-4">
      <PageHeader title="Einstellungen" />

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Building2 className="h-5 w-5" />
              Betrieb
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label>Betriebsname</Label>
              <Input value={org.name} readOnly className="bg-muted" />
            </div>
          </CardContent>
        </Card>

        {org.locations.map((loc) => (
          <Card key={loc.id}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <MapPin className="h-5 w-5" />
                Standort
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input value={loc.name} readOnly className="bg-muted" />
              </div>
              {loc.address && (
                <div className="space-y-2">
                  <Label>Adresse</Label>
                  <Input value={loc.address} readOnly className="bg-muted" />
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        <Link href="/einstellungen/schichtvorlagen" className="block">
          <Card className="transition-colors hover:bg-accent/50">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <div className="font-medium">Schichtvorlagen</div>
                <div className="text-sm text-muted-foreground">
                  Vorlagen für wiederkehrende Schichten verwalten
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}
