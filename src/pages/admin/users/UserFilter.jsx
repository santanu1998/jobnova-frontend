import React from 'react'
import { Search } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select'
import { Input } from '../../../components/ui/input'
import { ROLES } from '../../../lib/constants'

const UserFilter = ({ onRoleFilter, onStatusFilter, onSearch }) => {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 flex-wrap">

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            className="h-9 pl-9 bg-white border-slate-200 text-sm"
            placeholder="Search name or email..."
            onChange={(e) => onSearch?.(e.target.value)}
          />
        </div>

        <Select onValueChange={(value)=>onRoleFilter?.(value)}>
            <SelectTrigger className="h-9 w-full sm:w-40 bg-white border-slate-200 text-sm rounded-lg">
                <SelectValue placeholder="All Roles" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value={ROLES.JOB_SEEKER}>Job Seekers</SelectItem>
                <SelectItem value={ROLES.EMPLOYER}>Employers</SelectItem>
                <SelectItem value={ROLES.ADMIN}>Admin</SelectItem>
            </SelectContent>
        </Select>

        <Select onValueChange={(value)=>onStatusFilter?.(value)}>
            <SelectTrigger className="h-9 w-full sm:w-40 bg-white border-slate-200 text-sm rounded-lg">
                <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="SUSPENDED">Suspended</SelectItem>
                <SelectItem value="INACTIVE">Inactive</SelectItem>
            </SelectContent>
        </Select>
    </div>
  )
}

export default UserFilter
