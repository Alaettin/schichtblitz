"use client"

import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import type { ShiftTemplate, AssignmentWithDetails } from "@/types"
import {
  DAYS_ORDERED,
  DAY_OF_WEEK_SHORT,
  DAY_OF_WEEK_LABELS,
  QUALIFICATION_LABELS,
  getStaffingForDay,
  totalStaffing,
} from "@/types"

interface WeekExportButtonProps {
  weekLabel: string
  templates: ShiftTemplate[]
  assignments: AssignmentWithDetails[]
}

function buildExportHtml(
  weekLabel: string,
  templates: ShiftTemplate[],
  assignments: AssignmentWithDetails[]
): string {
  const gridRows = templates
    .map((template) => {
      const dayCells = DAYS_ORDERED.map((day) => {
        const dayStaffing = getStaffingForDay(template.staffing, day)
        const total = totalStaffing(dayStaffing)
        const cellAssignments = assignments.filter(
          (a) => a.shiftTemplateId === template.id && a.dayOfWeek === day
        )

        if (total === 0) {
          return `<td class="cell off"><span class="dash">–</span></td>`
        }

        const filled = cellAssignments.length
        const statusClass =
          filled >= total ? "full" : filled > 0 ? "partial" : "empty"

        const names = cellAssignments
          .map((a) => {
            const qual = QUALIFICATION_LABELS[a.qualification] ?? a.qualification
            return `<div class="emp"><span class="emp-name">${a.employee.firstName} ${a.employee.lastName}</span><span class="emp-qual">${qual}</span></div>`
          })
          .join("")

        // Show missing slots
        const missing = total - filled
        const missingSlots = missing > 0
          ? Array.from({ length: missing }, () => `<div class="emp missing">— offen —</div>`).join("")
          : ""

        return `<td class="cell ${statusClass}">
          <div class="badge badge-${statusClass}">${filled}/${total}</div>
          ${names}${missingSlots}
        </td>`
      }).join("")

      return `<tr>
        <td class="shift-label">
          <div class="shift-name">${template.name}</div>
          <div class="shift-time">${template.startTime} – ${template.endTime}</div>
        </td>
        ${dayCells}
      </tr>`
    })
    .join("")

  return `<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="UTF-8">
<title>Wochenplan — ${weekLabel}</title>
<style>
  @page { size: A4 landscape; margin: 1cm; }

  * { margin: 0; padding: 0; box-sizing: border-box; }

  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif;
    color: #1e293b;
    padding: 24px;
    background: #fff;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  /* Header */
  .header {
    display: flex;
    align-items: baseline;
    gap: 12px;
    margin-bottom: 20px;
    padding-bottom: 12px;
    border-bottom: 2px solid #7c3aed;
  }
  .header h1 {
    font-size: 18px;
    font-weight: 700;
    color: #1e293b;
  }
  .header .subtitle {
    font-size: 12px;
    color: #94a3b8;
  }

  /* Table */
  table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
    border-radius: 8px;
    overflow: hidden;
    border: 1px solid #e2e8f0;
  }

  th {
    background: #7c3aed;
    color: #fff;
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    padding: 8px 6px;
    text-align: center;
  }
  th:first-child {
    text-align: left;
    padding-left: 12px;
    width: 130px;
  }

  td {
    border-bottom: 1px solid #f1f5f9;
    vertical-align: top;
  }

  tr:last-child td { border-bottom: none; }

  /* Shift label column */
  .shift-label {
    background: #f8fafc;
    padding: 8px 12px;
    border-right: 1px solid #e2e8f0;
  }
  .shift-name {
    font-weight: 600;
    font-size: 12px;
    color: #1e293b;
  }
  .shift-time {
    font-size: 10px;
    color: #94a3b8;
    margin-top: 2px;
  }

  /* Day cells */
  .cell {
    padding: 6px 8px;
    text-align: center;
    min-height: 48px;
    border-right: 1px solid #f1f5f9;
  }
  .cell:last-child { border-right: none; }

  .cell.full { background: #f0fdf4; }
  .cell.partial { background: #fffbeb; }
  .cell.empty { background: #fff1f2; }
  .cell.off { background: #fafafa; }

  .dash { color: #d1d5db; font-size: 14px; }

  /* Badge */
  .badge {
    display: inline-block;
    font-size: 10px;
    font-weight: 700;
    padding: 1px 6px;
    border-radius: 10px;
    margin-bottom: 4px;
  }
  .badge-full { background: #dcfce7; color: #15803d; }
  .badge-partial { background: #fef3c7; color: #a16207; }
  .badge-empty { background: #fecdd3; color: #be123c; }

  /* Employee entries */
  .emp {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    font-size: 10px;
    line-height: 1.6;
  }
  .emp-name { font-weight: 500; color: #334155; }
  .emp-qual {
    font-size: 9px;
    color: #7c3aed;
    background: #ede9fe;
    padding: 0 4px;
    border-radius: 3px;
  }
  .emp.missing {
    color: #d1d5db;
    font-style: italic;
    font-weight: 400;
  }

  /* Footer */
  .footer {
    margin-top: 16px;
    font-size: 9px;
    color: #cbd5e1;
    text-align: right;
  }

  @media print {
    body { padding: 0; }
  }
</style>
</head>
<body>
  <div class="header">
    <h1>Wochenplan — ${weekLabel}</h1>
    <span class="subtitle">SchichtBlitz</span>
  </div>

  <table>
    <thead>
      <tr>
        <th>Schicht</th>
        ${DAYS_ORDERED.map((d) => `<th>${DAY_OF_WEEK_LABELS[d]}</th>`).join("")}
      </tr>
    </thead>
    <tbody>
      ${gridRows}
    </tbody>
  </table>

  <div class="footer">Erstellt am ${new Date().toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}</div>
</body>
</html>`
}

export function WeekExportButton({ weekLabel, templates, assignments }: WeekExportButtonProps) {
  function handleExport() {
    const html = buildExportHtml(weekLabel, templates, assignments)
    const win = window.open("", "_blank")
    if (!win) return
    win.document.write(html)
    win.document.close()
    win.onload = () => win.print()
  }

  return (
    <Button variant="outline" size="sm" onClick={handleExport}>
      <Download className="h-4 w-4 mr-1" />
      Export
    </Button>
  )
}
