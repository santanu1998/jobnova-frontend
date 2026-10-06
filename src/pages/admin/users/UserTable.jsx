import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { MoreHorizontal, UserX, UserCheck, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "../../../components/ui/avatar";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu";
import DeleteConfirm from "../../user/ResumeEdit/shared/DeleteConfirm";
import { cn } from "../../../lib/utils";
import { ROLES } from "../../../lib/constants";
import {
  activateUser,
  deleteUser,
  suspendUser,
} from "../../../reduxt-store/adminUser/adminThunk";

const roleConfig = {
  [ROLES.JOB_SEEKER]: { label: "Job Seeker", className: "bg-blue-50 text-blue-700 border-blue-200" },
  [ROLES.EMPLOYER]: { label: "Employer", className: "bg-purple-50 text-purple-700 border-purple-200" },
  [ROLES.ADMIN]: { label: "Admin", className: "bg-red-50 text-red-700 border-red-200" },
};

const statusConfig = {
  ACTIVE: { label: "Active", dot: "bg-emerald-500", text: "text-emerald-700", bg: "bg-emerald-50" },
  INACTIVE: { label: "Inactive", dot: "bg-slate-400", text: "text-slate-500", bg: "bg-slate-100" },
  SUSPENDED: { label: "Suspended", dot: "bg-amber-500", text: "text-amber-700", bg: "bg-amber-50" },
  DELETED: { label: "Deleted", dot: "bg-red-500", text: "text-red-700", bg: "bg-red-50" },
};

const UserTable = ({ users, showActions = false }) => {
  const dispatch = useDispatch();
  const { user: me } = useSelector((s) => s.auth);
  const { actionError } = useSelector((s) => s.adminUser);
  const [toDelete, setToDelete] = useState(null);

  return (
    <div className="rounded-xl border border-slate-200 overflow-hidden bg-white shadow-sm">
      {showActions && actionError && (
        <p className="px-6 py-2 text-sm text-red-600 bg-red-50 border-b border-red-100">{actionError}</p>
      )}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-[11px] font-bold text-slate-500 uppercase tracking-wider w-10 pl-6">#</TableHead>
            <TableHead className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">User</TableHead>
            <TableHead className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Role</TableHead>
            <TableHead className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Status</TableHead>
            <TableHead className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Phone</TableHead>
            <TableHead className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Joined</TableHead>
            {showActions && <TableHead className="text-right pr-6" />}
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length === 0 && (
            <TableRow>
              <TableCell colSpan={showActions ? 7 : 6} className="py-10 text-center text-sm text-slate-500">
                No users found.
              </TableCell>
            </TableRow>
          )}
          {users.map((user, index) => {
            const role = roleConfig[user.role] ?? { label: user.role, className: "" };
            const status = statusConfig[user.status] ?? statusConfig.INACTIVE;
            const joinedAt = user.createdAt
              ? new Date(user.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })
              : "-";
            const isMe = me?.id === user.id;
            return (
              <TableRow key={user.id}>
                <TableCell className="pl-6">{index + 1}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={user.profileImage} />
                      <AvatarFallback>{user.fullName?.charAt(0) ?? "?"}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-semibold text-slate-900 leading-tight">
                        {user.fullName} {isMe && <span className="text-xs text-slate-400">(you)</span>}
                      </p>
                      <p className="text-xs text-slate-400 truncate max-w-[200px]">{user.email}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={cn("text-xs font-semibold px-2 py-0.5 border", role.className)}>
                    {role.label}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold",
                      status.bg,
                    )}
                  >
                    <div className={cn("h-1.5 w-1.5 rounded-full shrink-0", status.dot)} />
                    <span className={status.text}>{status.label}</span>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-slate-600">{user.phoneNumber || "—"}</TableCell>
                <TableCell>{joinedAt}</TableCell>
                {showActions && (
                  <TableCell className="text-right pr-6">
                    {!isMe && user.role !== ROLES.ADMIN && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {user.status === "SUSPENDED" ? (
                            <DropdownMenuItem onClick={() => dispatch(activateUser(user.id))}>
                              <UserCheck className="mr-2 h-4 w-4" /> Activate
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem onClick={() => dispatch(suspendUser(user.id))}>
                              <UserX className="mr-2 h-4 w-4" /> Suspend
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600" onClick={() => setToDelete(user)}>
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </TableCell>
                )}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <DeleteConfirm
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={() => {
          dispatch(deleteUser(toDelete.id));
          setToDelete(null);
        }}
        label={toDelete ? `user ${toDelete.fullName}` : "user"}
      />
    </div>
  );
};

export default UserTable;
