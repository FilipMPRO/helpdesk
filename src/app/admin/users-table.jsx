"use client"

import { useState, useTransition } from "react"
import { cn } from "cn"
import { Loader2Icon } from "lucide-react"
import { toast } from "sonner"
import { RoleTag } from "@/components/role-tag"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { changeRole } from "@/lib/actions"
import { roleIcons, roleNames } from "@/lib/roles"

// Role do wyboru na liscie (bez admina)
const selectableRoles = {
  user: (
    <>
      <roleIcons.user />
      {roleNames.user}
    </>
  ),
  technician: (
    <>
      <roleIcons.technician />
      {roleNames.technician}
    </>
  ),
}

export function UsersTable({ users, currentUserId }) {
  const [tab, setTab] = useState("all")
  const [query, setQuery] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  // Zmiana czekajaca na potwierdzenie w okienku
  const [pending, setPending] = useState(null)
  const [isSaving, startSaving] = useTransition()

  const search = query.trim().toLowerCase()
  const visibleUsers = users.filter(
    (user) => (tab === "all" || user.role === tab) && user.email.toLowerCase().includes(search)
  )
  const countByRole = (role) => users.filter((user) => user.role === role).length

  function askForConfirmation(user, role) {
    if (role === user.role) {
      return
    }
    setPending({ user, role })
    setDialogOpen(true)
  }

  function confirmChange() {
    startSaving(async () => {
      const result = await changeRole(pending.user.id, pending.role)
      if (result?.error) {
        toast.error(result.error)
      } else {
        toast.success("Rola została zmieniona.")
      }
      setDialogOpen(false)
    })
  }

  const promoting = pending?.role === "technician"

  return (
    <>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="all">
              Wszyscy <span className="text-muted-foreground">{users.length}</span>
            </TabsTrigger>
            <TabsTrigger value="user">
              Użytkownicy <span className="text-muted-foreground">{countByRole("user")}</span>
            </TabsTrigger>
            <TabsTrigger value="technician">
              Technicy <span className="text-muted-foreground">{countByRole("technician")}</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <Input
          type="search"
          placeholder="Szukaj po emailu…"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="sm:w-64"
        />
      </div>

      <div className="mt-4 overflow-hidden rounded-xl border">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="px-4">Email</TableHead>
              <TableHead className="px-4">Rola</TableHead>
              <TableHead className="hidden px-4 sm:table-cell">Konto od</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visibleUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="px-4 break-all whitespace-normal">
                  {user.email || <span className="text-muted-foreground">Email ukryty</span>}
                  {user.id === currentUserId && (
                    <span className="ml-1 text-xs text-muted-foreground">(Ty)</span>
                  )}
                </TableCell>
                <TableCell className="px-4">
                  {user.role === "admin" ? (
                    <RoleTag role="admin" className="w-36" />
                  ) : (
                    <Select
                      items={selectableRoles}
                      value={user.role}
                      onValueChange={(role) => askForConfirmation(user, role)}
                    >
                      <SelectTrigger
                        size="sm"
                        aria-label={`Rola konta ${user.email}`}
                        className={cn(
                          "w-36",
                          user.role === "technician" && "border-primary bg-primary/15 hover:bg-primary/25"
                        )}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(selectableRoles).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </TableCell>
                <TableCell className="hidden px-4 text-muted-foreground sm:table-cell">
                  {user.created}
                </TableCell>
              </TableRow>
            ))}

            {visibleUsers.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} className="py-8 text-center text-muted-foreground">
                  Brak kont spełniających kryteria.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={(open) => !isSaving && setDialogOpen(open)}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>{promoting ? "Nadać rolę technika?" : "Odebrać rolę technika?"}</DialogTitle>
            <DialogDescription>
              Konto <span className="font-medium text-foreground">{pending?.user.email || "bez widocznego emaila"}</span>{" "}
              {promoting
                ? "zobaczy wszystkie zgłoszenia i będzie mogło zmieniać ich status."
                : "straci dostęp do panelu technika."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" disabled={isSaving} onClick={() => setDialogOpen(false)}>
              Anuluj
            </Button>
            <Button disabled={isSaving} onClick={confirmChange}>
              {isSaving && <Loader2Icon className="animate-spin" />}
              {promoting ? "Nadaj rolę" : "Odbierz rolę"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
