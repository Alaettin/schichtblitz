"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StepIndicator } from "./step-indicator"
import { EmployeeForm } from "@/components/employees/employee-form"
import { useToast } from "@/hooks/use-toast"
import { Zap } from "lucide-react"

const STEPS = ["Betrieb", "Standort", "Team"]

export function OnboardingWizard() {
  const router = useRouter()
  const { toast } = useToast()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)

  // Step 1: Organization
  const [orgName, setOrgName] = useState("")
  const [orgId, setOrgId] = useState("")

  // Step 2: Location
  const [locName, setLocName] = useState("")
  const [locAddress, setLocAddress] = useState("")
  const [locationId, setLocationId] = useState("")

  const createOrganization = async () => {
    if (!orgName.trim()) return
    setLoading(true)
    try {
      const res = await fetch("/api/organization", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: orgName }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast({ title: "Fehler", description: data.error, variant: "destructive" })
        return
      }
      setOrgId(data.data.id)
      setStep(1)
    } catch {
      toast({ title: "Fehler", description: "Verbindung fehlgeschlagen", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const createLocation = async () => {
    if (!locName.trim()) return
    setLoading(true)
    try {
      const res = await fetch("/api/locations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: locName,
          address: locAddress || undefined,
          organizationId: orgId,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast({ title: "Fehler", description: data.error, variant: "destructive" })
        return
      }
      setLocationId(data.data.id)
      setStep(2)
    } catch {
      toast({ title: "Fehler", description: "Verbindung fehlgeschlagen", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container max-w-lg py-8">
      <div className="mb-8 text-center">
        <Zap className="mx-auto mb-2 h-10 w-10 text-primary" />
        <h1 className="text-2xl font-bold">Willkommen bei SchichtBlitz</h1>
        <p className="text-sm text-muted-foreground">
          Richte deinen Betrieb in 3 einfachen Schritten ein
        </p>
      </div>

      <div className="mb-8">
        <StepIndicator steps={STEPS} currentStep={step} />
      </div>

      {/* Step 1: Betrieb */}
      {step === 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Wie heißt dein Betrieb?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="orgName">Betriebsname</Label>
              <Input
                id="orgName"
                placeholder="z.B. Ristorante Bella"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                autoFocus
              />
            </div>
            <Button
              className="w-full"
              onClick={createOrganization}
              disabled={!orgName.trim() || loading}
            >
              {loading ? "Wird erstellt..." : "Weiter"}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Standort */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Standort anlegen</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="locName">Standortname</Label>
              <Input
                id="locName"
                placeholder="z.B. Hauptstandort"
                value={locName}
                onChange={(e) => setLocName(e.target.value)}
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="locAddress">Adresse (optional)</Label>
              <Input
                id="locAddress"
                placeholder="z.B. Musterstraße 1, 10115 Berlin"
                value={locAddress}
                onChange={(e) => setLocAddress(e.target.value)}
              />
            </div>
            <Button
              className="w-full"
              onClick={createLocation}
              disabled={!locName.trim() || loading}
            >
              {loading ? "Wird erstellt..." : "Weiter"}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Erster Mitarbeiter */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Ersten Mitarbeiter anlegen</CardTitle>
          </CardHeader>
          <CardContent>
            <EmployeeForm
              locationId={locationId}
              onSuccess={() => {
                toast({
                  title: "Einrichtung abgeschlossen!",
                  description: "Dein Betrieb ist einsatzbereit.",
                })
                router.push("/team")
              }}
              onCancel={() => router.push("/team")}
            />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
