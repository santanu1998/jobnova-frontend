import React from 'react'
import { useDispatch } from 'react-redux'
import { CheckCircle, MoreHorizontal, ShieldCheck, Ban, ExternalLink, Trash2 } from 'lucide-react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table'
import { Avatar, AvatarFallback, AvatarImage } from '../../../components/ui/avatar'
import { Badge } from '../../../components/ui/badge'
import { Button } from '../../../components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../../components/ui/dropdown-menu'
import { deactivateCompany, deleteCompany, verifyCompany } from '../../../reduxt-store/company/companyThunk'
import DeleteConfirm from '../../user/ResumeEdit/shared/DeleteConfirm'
import { useState } from 'react'
import { formatEnum } from '../../../lib/constants'

const STATUS_STYLE = {
  ACTIVE: "bg-emerald-50 text-emerald-700 border-emerald-200",
  PENDING_VERIFICATION: "bg-amber-50 text-amber-700 border-amber-200",
  SUSPENDED: "bg-red-50 text-red-700 border-red-200",
  REJECTED: "bg-red-50 text-red-700 border-red-200",
}

const fmt = (dt) =>
  dt ? new Date(dt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "-"

const CompanyTable = ({ companies }) => {
  const dispatch = useDispatch()
  const [toDelete, setToDelete] = useState(null)
  return (
    <div className="rounded-xl border border-slate-200 overflow-hidden bg-white shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-[11px] font-bold text-slate-500 uppercase tracking-wider w-10 pl-6">#</TableHead>
            <TableHead className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Company</TableHead>
            <TableHead className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Industry/Type</TableHead>
            <TableHead className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Size</TableHead>
            <TableHead className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Status</TableHead>
            <TableHead className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Verified</TableHead>
            <TableHead className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Registered</TableHead>
            <TableHead className="text-right pr-6" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {companies.length === 0 && (
            <TableRow>
              <TableCell colSpan={8} className="py-10 text-center text-sm text-slate-500">
                No companies found.
              </TableCell>
            </TableRow>
          )}
          {companies.map((company, index) => {
            const verified = !!company.verifiedAt && company.status === "ACTIVE"
            return (
              <TableRow key={company.id}>
                <TableCell className="pl-6">{index + 1}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={company.logoUrl} />
                      <AvatarFallback>{company.name?.charAt(0) ?? "?"}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-semibold text-slate-900 leading-tight">{company.name}</p>
                      <p className="text-xs text-slate-400 truncate max-w-[200px]">{company.email}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <p className="text-sm font-medium text-slate-700">{formatEnum(company.industryType)}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{formatEnum(company.companyType)}</p>
                  </div>
                </TableCell>
                <TableCell>{formatEnum(company.companySize)}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={STATUS_STYLE[company.status]}>
                    {formatEnum(company.status)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={verified ? "bg-green-100 text-green-700" : ""}>
                    {verified && <CheckCircle className="h-3 w-3" />}
                    {verified ? `Verified ${fmt(company.verifiedAt)}` : "Unverified"}
                  </Badge>
                </TableCell>
                <TableCell>{fmt(company.createdAt)}</TableCell>
                <TableCell className="text-right pr-6">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {company.status !== "ACTIVE" && (
                        <DropdownMenuItem onClick={() => dispatch(verifyCompany(company.id))}>
                          <ShieldCheck className="mr-2 h-4 w-4" /> Verify &amp; activate
                        </DropdownMenuItem>
                      )}
                      {company.status !== "SUSPENDED" && (
                        <DropdownMenuItem className="text-red-600" onClick={() => dispatch(deactivateCompany(company.id))}>
                          <Ban className="mr-2 h-4 w-4" /> Deactivate
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem className="text-red-600" onClick={() => setToDelete(company)}>
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                      </DropdownMenuItem>
                      {company.website && (
                        <DropdownMenuItem onClick={() => window.open(company.website, "_blank", "noopener")}>
                          <ExternalLink className="mr-2 h-4 w-4" /> Open website
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
      <DeleteConfirm
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={() => {
          dispatch(deleteCompany(toDelete.id))
          setToDelete(null)
        }}
        label={toDelete ? `company "${toDelete.name}"` : 'company'}
      />
    </div>
  )
}

export default CompanyTable
